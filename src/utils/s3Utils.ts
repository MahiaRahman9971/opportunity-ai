/**
 * Fetches data from an S3 bucket using the server-side API route
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @param type - Type of data to fetch (json or csv)
 * @returns - Response from fetch request
 */
export const getDataFromS3 = async (bucket: string, key: string, type: 'json' | 'csv' = 'json'): Promise<Response> => {
  try {
    // Use the API route to fetch data from S3
    const apiUrl = `/api/s3?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&type=${type}`;
    
    // Fetch the data using the API route
    const response = await fetch(apiUrl);
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
 * Fetches CSV data from S3 and parses it using PapaParse
 * @param bucket - S3 bucket name
 * @param key - S3 object key (path to file)
 * @returns - Promise that resolves to the parsed CSV data
 */
export const getCSVFromS3 = async <T>(bucket: string, key: string): Promise<T[]> => {
  const response = await getDataFromS3(bucket, key, 'csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    import('papaparse').then(({ default: Papa }) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error: Error) => {
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
 * @returns - Promise that resolves to the parsed JSON data
 */
export const getJSONFromS3 = async <T>(bucket: string, key: string): Promise<T> => {
  const response = await getDataFromS3(bucket, key, 'json');
  return await response.json() as T;
};
