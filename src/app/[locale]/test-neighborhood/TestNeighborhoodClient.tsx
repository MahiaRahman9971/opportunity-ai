'use client';

import React from 'react';
import NeighborhoodAnalysis, { NeighborhoodData } from '@/components/NeighborhoodAnalysis';

// Mock data for testing
const mockNeighborhoodData: NeighborhoodData = {
  schoolQuality: {
    score: 7.5,
    description: "Good school quality in this area",
    details: ["Several highly-rated schools nearby", "Good student-teacher ratio", "Strong extracurricular programs"]
  },
  safety: {
    score: 8.2,
    description: "Very safe neighborhood",
    details: ["Low crime rate", "Active neighborhood watch", "Well-lit streets"]
  },
  healthcare: {
    score: 6.8,
    description: "Decent healthcare access",
    details: ["One major hospital within 5 miles", "Several clinics in the area", "Specialist care requires travel"]
  },
  amenities: {
    score: 9.0,
    description: "Excellent amenities",
    details: ["Multiple shopping centers", "Restaurants of various cuisines", "Entertainment options"]
  },
  housing: {
    score: 5.5,
    description: "Moderate housing options",
    details: ["Mix of apartments and houses", "Moderately priced for the area", "Limited new construction"]
  },
  transportation: {
    score: 7.0,
    description: "Good transportation options",
    details: ["Bus routes throughout", "Close to major highways", "Limited bike lanes"]
  }
};

export default function TestNeighborhoodClient() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Neighborhood Analysis Component</h1>
      <p className="mb-6">
        This page tests the NeighborhoodAnalysis component with mock data. 
        You can click on any icon to set your own rating for that category. Your ratings will use the primary teal color (#6CD9CA).
      </p>
      
      <div className="max-w-2xl">
        <NeighborhoodAnalysis 
          insightsData={mockNeighborhoodData} 
          loadingInsights={false} 
          opportunityScore={7.8} 
          loadingOpportunityScore={false}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to use:</h2>
        <ul className="list-disc pl-5">
          <li>Click on any icon to set your rating for that category (icons up to that point will use the primary teal color)</li>
          <li>Click on the same icon again to remove your rating and revert to the default score</li>
          <li>The rating number will also change to teal when you&apos;ve set your own rating</li>
          <li>This allows users to provide their own assessment of neighborhood factors</li>
        </ul>
      </div>
    </div>
  );
}
