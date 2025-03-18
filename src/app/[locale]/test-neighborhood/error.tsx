'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="mb-4 text-gray-700">
          There was an error loading the neighborhood analysis component.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
