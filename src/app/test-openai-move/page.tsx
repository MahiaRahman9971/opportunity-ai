'use client'

import React, { useState } from 'react'

// Define proper interface for the API response
interface MoveApiResponse {
  // Add specific fields based on what your API returns
  // This is a sample structure - adjust according to your actual response
  recommendations?: Array<{
    neighborhood?: string;
    schools?: Array<{
      name?: string;
      rating?: number;
      distance?: number;
    }>;
    amenities?: string[];
    // Add other fields as needed
  }>;
  message?: string;
  status?: string;
  // Add other top-level fields as needed
}

export default function TestOpenAIMove() {
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState('')
  const [income, setIncome] = useState('<25k')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<MoveApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/openai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          zipCode,
          income,
          children: [
            { age: '5-10', gender: 'female', ethnicity: 'asian' }
          ]
        })
      })
      
      if (!res.ok) {
        throw new Error(`API returned status code ${res.status}`)
      }
      
      const data = await res.json() as MoveApiResponse
      setResponse(data)
    } catch (err: unknown) {
      console.error('Error testing OpenAI Move API:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while testing the OpenAI Move API')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test OpenAI Move Integration</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Current Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your current address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
              Desired ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter desired ZIP code"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="income" className="block text-sm font-medium mb-1">
              Income Range
            </label>
            <select
              id="income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="<25k">Less than $25,000</option>
              <option value="25-50k">$25,000 - $50,000</option>
              <option value="50-75k">$50,000 - $75,000</option>
              <option value="75-100k">$75,000 - $100,000</option>
              <option value=">100k">More than $100,000</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#6CD9CA] text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test OpenAI Move API'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p>{error}</p>
          <div className="mt-4 p-4 bg-red-100 rounded overflow-auto">
            <p className="text-sm font-mono">
              Make sure you have set up your OPENAI_API_KEY in the .env.local file.
            </p>
          </div>
        </div>
      )}
      
      {response && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-2">Success!</h2>
          <p className="mb-4">OpenAI Move API is working correctly. Here&apos;s the response:</p>
          
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}