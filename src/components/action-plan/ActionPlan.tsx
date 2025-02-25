'use client'

import React, { useState } from 'react'
import StayAndImprove from './Stay'

const TakeAction = () => {
  const [selectedAction, setSelectedAction] = useState<'stay' | 'move' | null>(null)
  const [savedChoices, setSavedChoices] = useState<{
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  } | null>(null)

  const handleActionSelect = (action: 'stay' | 'move') => {
    setSelectedAction(action)
  }

  const handleSaveChoices = (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => {
    setSavedChoices(choices)
    // You could also trigger additional actions here, 
    // like saving to a backend or progressing to the next step
  }

  return (
    <section 
      id="take-action" 
      className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Take Action</h1>
        <p className="text-xl">Based on your community&apos;s opportunity score, here are some actions you can consider:</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Community Score */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Your Community Score</h3>
          <div className="w-40 h-40 rounded-full bg-[#6CD9CA] text-white flex items-center justify-center">
            <span className="text-5xl font-bold">
              5<span className="text-2xl">/10</span>
            </span>
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Areas for Improvement</h3>
          <ul className="space-y-2 text-lg">
            <li className="bg-[#6CD9CA] bg-opacity-20 px-4 py-2 rounded-md">
              School Quality
            </li>
            <li className="bg-[#6CD9CA] bg-opacity-20 px-4 py-2 rounded-md">
              Community Programs
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">What would you like to do?</h2>
        
        <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Stay & Improve Option */}
          <div 
            className={`
              w-full max-w-md p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300
              ${selectedAction === 'stay' 
                ? 'border-4 border-[#6CD9CA] scale-105' 
                : 'hover:shadow-xl hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleActionSelect('stay')}
          >
            <h3 className="text-2xl font-bold mb-4">Stay & Improve</h3>
            <p className="mb-4">Work with your community to improve opportunities:</p>
            <ul className="list-disc list-inside mb-6 text-left">
              <li>Join the PTA or school board</li>
              <li>Advocate for better community programs</li>
              <li>Connect with local representatives</li>
              <li>Start community initiatives</li>
            </ul>
            <button 
              className={`
                w-full py-3 rounded-full text-white font-semibold transition-colors duration-300
                ${selectedAction === 'stay' 
                  ? 'bg-[#6CD9CA]' 
                  : 'bg-[#6CD9CA] bg-opacity-70 hover:bg-opacity-100'}
              `}
              onClick={() => handleActionSelect('stay')}
            >
              Choose This Option
            </button>
          </div>

          {/* Explore New Areas Option */}
          <div 
            className={`
              w-full max-w-md p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300
              ${selectedAction === 'move' 
                ? 'border-4 border-[#6CD9CA] scale-105' 
                : 'hover:shadow-xl hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleActionSelect('move')}
          >
            <h3 className="text-2xl font-bold mb-4">Explore New Areas</h3>
            <p className="mb-4">Find communities with better opportunities:</p>
            <ul className="list-disc list-inside mb-6 text-left">
              <li>Compare different neighborhoods</li>
              <li>Find better schools</li>
              <li>Discover available resources</li>
              <li>Plan your move</li>
            </ul>
            <button 
              className={`
                w-full py-3 rounded-full text-white font-semibold transition-colors duration-300
                ${selectedAction === 'move' 
                  ? 'bg-[#6CD9CA]' 
                  : 'bg-[#6CD9CA] bg-opacity-70 hover:bg-opacity-100'}
              `}
              onClick={() => handleActionSelect('move')}
            >
              Choose This Option
            </button>
          </div>
        </div>

        {/* Action Details Section (conditionally rendered) */}
        {selectedAction === 'stay' && (
          <StayAndImprove onSaveChoices={handleSaveChoices} />
        )}

        {/* Saved Choices Summary */}
        {savedChoices && (
          <div className="mt-12 bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Your Saved Choices</h3>
            <div className="space-y-2">
              <p><strong>Town:</strong> {savedChoices.town}</p>
              <p><strong>Selected School:</strong> {savedChoices.selectedSchool}</p>
              <p>
                <strong>Selected Community Programs:</strong>{' '}
                {savedChoices.selectedCommunityPrograms.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default TakeAction