// Cache for storing fetched data to avoid redundant API calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

const dataCache: Record<string, CacheEntry<any>> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Creates a cache key from bucket, key and type
 */
const createCacheKey = (bucket: string, key: string, type: string): string => {
  return `${bucket}:${key}:${type}`;
};

/**
 * Fetches data from an S3 bucket using the server-side API route with caching
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param type - Type of data to fetch (json or csv)
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns - Response from fetch request
 */
export const getDataFromS3 = async (
  bucket: string, 
  key: string, 
  type: 'json' | 'csv' = 'json',
  forceRefresh: boolean = false
): Promise<Response> => {
  try {
    // Use the API route to fetch data from S3
    const apiUrl = `/api/s3?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&type=${type}`;
    
    // Add cache-busting parameter if forcing refresh
    const urlWithCacheBusting = forceRefresh ? `${apiUrl}&_t=${Date.now()}` : apiUrl;
    
    // Use cache-control headers to improve browser caching
    const fetchOptions: RequestInit = {
      headers: {
        'Cache-Control': 'max-age=3600' // 1 hour
      }
    };
    
    // Fetch the data using the API route
    const response = await fetch(urlWithCacheBusting, fetchOptions);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch from S3 API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error getting data from S3:', error);
    throw error;
  }
};

/**
 * Fetches CSV data from S3 and parses it using PapaParse with caching
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns - Promise that resolves to the parsed CSV data
 */
export const getCSVFromS3 = async <T>(
  bucket: string, 
  key: string, 
  forceRefresh: boolean = false
): Promise<T[]> => {
  const cacheKey = createCacheKey(bucket, key, 'csv');
  
  // Check if we have a valid cached version
  if (!forceRefresh && dataCache[cacheKey]) {
    const cached = dataCache[cacheKey];
    const now = Date.now();
    
    // If the cache entry is still valid, return it
    if (now - cached.timestamp < cached.expiresIn) {
      console.log(`Using cached CSV data for ${key}`);
      return cached.data as T[];
    }
  }
  
  console.log(`Fetching CSV data for ${key} from S3...`);
  const response = await getDataFromS3(bucket, key, 'csv', forceRefresh);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    import('papaparse').then(({ default: Papa }) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const data = results.data as T[];
          
          // Cache the parsed data
          dataCache[cacheKey] = {
            data,
            timestamp: Date.now(),
            expiresIn: CACHE_EXPIRY
          };
          
          resolve(data);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    }).catch(reject);
  });
};

/**
 * Fetches JSON data from S3 with caching
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns - Promise that resolves to the parsed JSON data
 */
export const getJSONFromS3 = async <T>(
  bucket: string, 
  key: string, 
  forceRefresh: boolean = false
): Promise<T> => {
  const cacheKey = createCacheKey(bucket, key, 'json');
  
  // Check if we have a valid cached version
  if (!forceRefresh && dataCache[cacheKey]) {
    const cached = dataCache[cacheKey];
    const now = Date.now();
    
    // If the cache entry is still valid, return it
    if (now - cached.timestamp < cached.expiresIn) {
      console.log(`Using cached JSON data for ${key}`);
      return cached.data as T;
    }
  }
  
  console.log(`Fetching JSON data for ${key} from S3...`);
  const response = await getDataFromS3(bucket, key, 'json', forceRefresh);
  const data = await response.json() as T;
  
  // Cache the parsed data
  dataCache[cacheKey] = {
    data,
    timestamp: Date.now(),
    expiresIn: CACHE_EXPIRY
  };
  
  return data;
};
