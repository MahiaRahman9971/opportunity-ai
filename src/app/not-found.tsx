import React from 'react'
import Link from 'next/link'

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-[#6CD9CA] text-white rounded-md hover:bg-opacity-90"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
