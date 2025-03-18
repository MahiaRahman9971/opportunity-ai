import React from 'react'
import Link from 'next/link'

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'

export default function TestOpenAI() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test OpenAI Integration</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Form</h2>
        <p className="mb-4">This is a server-side rendered page. To test the OpenAI API, please use the client-side test page at <Link href="/test-openai-move" className="text-blue-500 underline">Test OpenAI Move</Link>.</p>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded overflow-auto">
          <p className="text-sm">
            This page has been converted to a server component to avoid prerendering issues. The OpenAI API cannot be called during static build time.
          </p>
        </div>
      </div>
    </div>
  )
}