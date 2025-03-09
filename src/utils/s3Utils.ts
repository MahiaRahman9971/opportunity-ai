// Cache storage for S3 data
const dataCache: Record<string, { data: any; timestamp: number }> = {};

// Cache expiration time (in milliseconds) - 24 hours
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Fetches data from an S3 bucket using the server-side API route
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param type - Type of data to fetch (json or csv)
 * @param useCache - Whether to use cached data if available (default: true)
 * @returns - Response from fetch request
 */
export const getDataFromS3 = async (
  bucket: string, 
  key: string, 
  type: 'json' | 'csv' = 'json',
  useCache: boolean = true
): Promise<Response> => {
  try {
    // Create a cache key based on bucket, key, and type
    const cacheKey = `${bucket}:${key}:${type}`;
    
    // Check if we have cached data and it's not expired
    if (useCache && typeof window !== 'undefined' && window.localStorage) {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          
          // If the cache isn't expired, use it
          if (now - timestamp < CACHE_EXPIRATION) {
            console.log(`Using cached data for ${cacheKey}`);
            
            // Create a mock response from the cached data
            return new Response(type === 'json' ? JSON.stringify(data) : data, {
              headers: {
                'Content-Type': type === 'json' ? 'application/json' : 'text/csv',
                'X-Cache': 'HIT'
              }
            });
          } else {
            console.log(`Cache expired for ${cacheKey}`);
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (cacheError) {
        console.warn('Error reading from cache:', cacheError);
        // Continue with network request if cache fails
      }
    }
    
    // Use the API route to fetch data from S3
    const apiUrl = `/api/s3?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&type=${type}`;
    
    // Fetch the data using the API route
    const response = await fetch(apiUrl, {
      cache: 'default', // Let the browser handle HTTP caching
      next: { revalidate: 3600 } // For Next.js 13+ data fetching
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch from S3 API: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // Cache the response if caching is enabled
    if (useCache && typeof window !== 'undefined' && window.localStorage) {
      try {
        // Clone the response so we can both cache it and return it
        const responseClone = response.clone();
        const dataToCache = type === 'json' 
          ? await responseClone.json() 
          : await responseClone.text();
        
        // Store in localStorage with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
          data: dataToCache,
          timestamp: Date.now()
        }));
        
        console.log(`Cached data for ${cacheKey}`);
      } catch (cacheError) {
        console.warn('Error writing to cache:', cacheError);
        // Continue even if caching fails
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error getting data from S3:', error);
    throw error;
  }
};

/**
 * Fetches CSV data from S3 and parses it using PapaParse
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param useCache - Whether to use cached data if available (default: true)
 * @returns - Promise that resolves to the parsed CSV data
 */
export const getCSVFromS3 = async <T>(bucket: string, key: string, useCache: boolean = true): Promise<T[]> => {
  // Create a memory cache key for parsed CSV data
  const memoryCacheKey = `csv:${bucket}:${key}`;
  
  // Check memory cache first (faster than localStorage)
  if (useCache && dataCache[memoryCacheKey] && Date.now() - dataCache[memoryCacheKey].timestamp < CACHE_EXPIRATION) {
    console.log(`Using memory-cached CSV data for ${memoryCacheKey}`);
    return dataCache[memoryCacheKey].data as T[];
  }
  
  const response = await getDataFromS3(bucket, key, 'csv', useCache);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    import('papaparse').then(({ default: Papa }) => {
      console.time('CSV parsing');
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          console.timeEnd('CSV parsing');
          
          // Store parsed results in memory cache
          if (useCache) {
            dataCache[memoryCacheKey] = {
              data: results.data,
              timestamp: Date.now()
            };
          }
          
          resolve(results.data as T[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    }).catch(reject);
  });
};

/**
 * Fetches JSON data from S3
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param useCache - Whether to use cached data if available (default: true)
 * @returns - Promise that resolves to the parsed JSON data
 */
export const getJSONFromS3 = async <T>(bucket: string, key: string, useCache: boolean = true): Promise<T> => {
  // Create a memory cache key for parsed JSON data
  const memoryCacheKey = `json:${bucket}:${key}`;
  
  // Check memory cache first (faster than localStorage)
  if (useCache && dataCache[memoryCacheKey] && Date.now() - dataCache[memoryCacheKey].timestamp < CACHE_EXPIRATION) {
    console.log(`Using memory-cached JSON data for ${memoryCacheKey}`);
    return dataCache[memoryCacheKey].data as T;
  }
  
  const response = await getDataFromS3(bucket, key, 'json', useCache);
  const data = await response.json() as T;
  
  // Store parsed results in memory cache
  if (useCache) {
    dataCache[memoryCacheKey] = {
      data,
      timestamp: Date.now()
    };
  }
  
  return data;
};

/**
 * Preloads data from S3 into cache without waiting for the result
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param type - Type of data to fetch (json or csv)
 */
export const preloadDataFromS3 = (bucket: string, key: string, type: 'json' | 'csv' = 'json'): void => {
  // Start the fetch but don't await it
  if (type === 'json') {
    getJSONFromS3(bucket, key).catch(err => {
      console.warn(`Failed to preload JSON data from ${bucket}/${key}:`, err);
    });
  } else {
    getCSVFromS3(bucket, key).catch(err => {
      console.warn(`Failed to preload CSV data from ${bucket}/${key}:`, err);
    });
  }
  
  console.log(`Preloading ${type} data from ${bucket}/${key}`);
};
