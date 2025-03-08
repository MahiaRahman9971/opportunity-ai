// AWS S3 Configuration
import { S3Client } from '@aws-sdk/client-s3';

// Create a function to get an S3 client for a specific region
export const getS3Client = (region: string = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1') => {
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
    },
  });
};

// Initialize the S3 client with your AWS configuration
export const s3Client = getS3Client();

// Note: For client-side code in Next.js, environment variables must be prefixed with NEXT_PUBLIC_
// Make sure to add these variables to your .env.local file:
// NEXT_PUBLIC_AWS_REGION=your-region
// NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
// NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
