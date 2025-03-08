import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
// Import commented out as it's not used but may be needed in the future
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

// Create a function to get an S3 client for a specific region
const getS3Client = (region: string = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1') => {
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
    },
  });
};

// Try to fetch from S3 with multiple region attempts
const fetchFromS3WithRegionFallback = async (bucket: string, key: string) => {
  // Regions to try in order
  const regionsToTry = [
    process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    'us-west-2',
    'us-east-2',
    'us-west-1',
    'eu-west-1'
  ];
  
  let lastError: Error | null = null;
  
  // Try each region
  for (const region of regionsToTry) {
    try {
      const s3Client = getS3Client(region);
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(command);
      
      console.log(`Successfully fetched from S3 using region: ${region}`);
      return response;
    } catch (error) {
      const err = error as { name?: string; message: string; $metadata?: { httpHeaders?: Record<string, string> } };
      console.error(`Error fetching from S3 with region ${region}:`, err.message);
      
      // If we get a PermanentRedirect error with the correct region info, use that region
      if (err.name === 'PermanentRedirect' && err.$metadata?.httpHeaders?.['x-amz-bucket-region']) {
        const correctRegion = err.$metadata.httpHeaders['x-amz-bucket-region'];
        console.log(`Detected correct region from redirect: ${correctRegion}`);
        
        try {
          const s3Client = getS3Client(correctRegion);
          const command = new GetObjectCommand({ Bucket: bucket, Key: key });
          const response = await s3Client.send(command);
          
          console.log(`Successfully fetched from S3 using redirected region: ${correctRegion}`);
          return response;
        } catch (redirectError) {
          console.error(`Error fetching from S3 with redirected region ${correctRegion}:`, redirectError);
        }
      }
      
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // If we've tried all regions and still failed, throw the last error
  throw lastError || new Error('Failed to fetch from S3 after trying all regions');
};

/**
 * Helper function to convert stream to text
 */
async function streamToText(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * API route handler for fetching data from S3
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const bucket = searchParams.get('bucket');
  const key = searchParams.get('key');
  const type = searchParams.get('type') || 'json'; // Default to JSON
  
  // Validate parameters
  if (!bucket || !key) {
    return NextResponse.json(
      { error: 'Missing required parameters: bucket and key' },
      { status: 400 }
    );
  }
  
  try {
    // Get the object from S3 with region fallback
    const response = await fetchFromS3WithRegionFallback(bucket, key);
    
    if (!response.Body) {
      throw new Error('Empty response body');
    }
    
    // Convert the readable stream to text
    const bodyContents = await streamToText(response.Body as Readable);
    
    // Return the appropriate response based on the requested type
    if (type === 'csv') {
      return new NextResponse(bodyContents, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });
    } else {
      // For JSON, parse and then stringify to ensure valid JSON
      try {
        const jsonData = JSON.parse(bodyContents);
        return NextResponse.json(jsonData);
      } catch {
        // If parsing fails, return the raw text
        return new NextResponse(bodyContents, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }
  } catch (error) {
    console.error('Error fetching from S3:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
