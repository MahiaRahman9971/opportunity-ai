'use client'

import { usePersonalization } from './AssessQuiz';
import { useState, useEffect } from 'react';
import NeighborhoodInsights from './NeighborhoodInsights';

// We'll use the opportunity score from the context instead of calculating it here

const Learn = () => {
  // Get opportunity score from context
  const { data } = usePersonalization();
  const [opportunityScore, setOpportunityScore] = useState<number | null>(null);
  
  // Use the opportunity score from the context
  useEffect(() => {
    // If we have an opportunity score from the map, use it
    if (data.opportunityScore !== undefined && data.opportunityScore !== null) {
      setOpportunityScore(data.opportunityScore);
    }
  }, [data.opportunityScore]);
  return (
    <section id="learn" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Learn About Opportunity</h1>
      </div>

      {/* Why opportunities vary section */}
      <div className="mb-16">
        {/* Community Score */}
        <div className="flex flex-col items-center justify-center mb-12">
          <h3 className="text-xl font-semibold mb-6">Your Opportunity Score</h3>
          <div className="w-40 h-40 rounded-full bg-[#6CD9CA] text-white flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl font-bold">
              {opportunityScore !== null 
                ? opportunityScore
                : '--'}
              <span className="text-2xl">/10</span>
            </span>
          </div>
          <p className="text-sm text-gray-600 max-w-md text-center mb-8">
            Based on household income at age 35. Higher scores indicate better economic mobility and opportunity.
          </p>
        </div>

        {/* Neighborhood Insights Section - Always shown when address is available */}
        {data.address && <NeighborhoodInsights />}

        <div className="text-center mb-10">
          <p className="max-w-2xl mx-auto">Let&apos;s understand what makes some areas have more opportunities than others:</p>
        </div>
      </div>

      {/* How can we do better section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold">How can we do better?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {/* Live in Good Areas - House icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              1
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">Live in Good Areas</h3>
            <p className="text-sm text-center text-gray-700">Find neighborhoods with better schools, resources, and opportunity networks</p>
          </div>

          {/* Good Education - School building icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              2
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">Good Education</h3>
            <p className="text-sm text-center text-gray-700">Access quality schools, afterschool programs, and educational resources</p>
          </div>

          {/* Take Advantage - Lightbulb/opportunity icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              3
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">Take Advantage of Opportunities</h3>
            <p className="text-sm text-center text-gray-700">Utilize mentorship, community programs, and enrichment activities</p>
          </div>

          {/* Graduate College - Graduation cap icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12,3L1,9L12,15L23,9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              4
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">Graduate College</h3>
            <p className="text-sm text-center text-gray-700">Higher education significantly improves lifetime earning potential</p>
          </div>

          {/* Career Success - Briefcase/professional icon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M14,6V4H10V6H14Z" />
              </svg>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
              5
            </div>
            <h3 className="text-base font-semibold mb-1 text-center">Career Success</h3>
            <p className="text-sm text-center text-gray-700">Build professional skills and networks for long-term financial stability</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Learn