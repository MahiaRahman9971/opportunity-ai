'use client'

import React, { useState, useEffect } from 'react'
import { School } from 'lucide-react'
import { useAssessment, AssessData } from '../AssessQuiz'

// Define types for the recommendations data
type TownData = {
  name: string;
  website: string;
  description: string;
};

type SchoolData = {
  name: string;
  rating: number;
  description: string;
  website: string;
};

type CommunityProgramData = {
  name: string;
  description: string;
  website: string;
};

type Recommendations = {
  townData: TownData;
  schoolData: SchoolData[];
  communityProgramData: CommunityProgramData[];
};

// Default data to use as fallback
const defaultRecommendations: Recommendations = {
  townData: {
    name: 'Oakridge Community',
    website: 'https://www.oakridgetownship.gov',
    description: 'A growing suburban community committed to education and family development. Located in a region with diverse economic opportunities and strong community support.',
  },
  schoolData: [
    {
      name: 'Oakridge Elementary',
      rating: 8.5,
      description: 'A top-rated elementary school with advanced STEM programs and a strong focus on individualized learning.',
      website: 'https://www.oakridgeelementary.edu'
    },
    {
      name: 'Riverside Magnet School',
      rating: 8.2,
      description: 'A magnet school offering specialized programs in arts and technology, with small class sizes.',
      website: 'https://www.riversidemagnet.edu'
    },
    {
      name: 'Community Learning Center',
      rating: 7.9,
      description: 'A community-focused school with integrated enrichment programs and strong parent involvement.',
      website: 'https://www.communitylearningcenter.edu'
    }
  ],
  communityProgramData: [
    {
      name: 'Youth Leadership Academy',
      description: 'After-school program focusing on leadership skills, community service, and personal development.',
      website: 'https://www.youthleadershipacademy.org'
    },
    {
      name: 'STEM Explorers Club',
      description: 'Hands-on science and technology program for curious young minds, with robotics and coding workshops.',
      website: 'https://www.stemexplorers.edu'
    },
    {
      name: 'Creative Arts Program',
      description: 'Comprehensive arts education program offering music, visual arts, theater, and dance classes.',
      website: 'https://www.creativeartsprogram.org'
    }
  ]
};

interface StayProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
  assessmentData?: AssessData; 
}

const Stay: React.FC<StayProps> = ({ onSaveChoices, assessmentData }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendations>(defaultRecommendations)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment()
  const userData = assessmentData || assessmentContext.data

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName)
  }

  const handleCommunityProgramToggle = (programName: string) => {
    setSelectedCommunityPrograms(prev => 
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    )
  }

  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
        town: recommendations.townData.name,
        selectedSchool,
        selectedCommunityPrograms
      }
      onSaveChoices(choices)
    }
  }
  
  // Fetch recommendations from OpenAI API
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Skip if no address is available
      if (!userData?.address) {
        setError('No address provided. Please complete the assessment form first.')
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: userData.address,
            income: userData.income,
            children: userData.children
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || 
            `Failed to fetch recommendations: ${response.status} ${response.statusText}`
          );
        }
        
        const data = await response.json()
        setRecommendations(data)
      } catch (err: Error | unknown) {
        console.error('Error fetching recommendations:', err)
        setError(`Failed to load personalized recommendations: ${err instanceof Error ? err.message : String(err)}. Using default data instead.`)
        // Fall back to default recommendations (already set as initial state)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [userData])

  return (
    <div className="space-y-12 mt-16">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6CD9CA]"></div>
          <p className="mt-4 text-lg">Loading personalized recommendations based on your address...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <p className="mt-2">Please make sure you&apos;ve completed the assessment form with your address.</p>
        </div>
      ) : (
        <>
          {/* Town Information */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-left">Township Information</h3>
            <div className="text-left space-y-2">
              <p><strong>Town Name:</strong> {recommendations.townData.name}</p>
              <p>
                <strong>Township Website:</strong>{' '}
                <a 
                  href={recommendations.townData.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#6CD9CA] hover:underline"
                >
                  {recommendations.townData.website}
                </a>{' '}
                <span className="text-sm text-gray-600">
                  (Click to learn more about local opportunities!)
                </span>
              </p>
              <p><strong>Description:</strong> {recommendations.townData.description}</p>
            </div>
          </div>

          {/* Local Schools */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4">Local Schools</h3>
            <p className="mb-4">Select a school that would be a good alternative:</p>
            
            <div className="space-y-4">
              {recommendations.schoolData.map((school) => (
                <div 
                  key={school.name}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center
                    ${selectedSchool === school.name 
                      ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                      : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                  `}
                  onClick={() => handleSchoolSelect(school.name)}
                >
                  <School className="mr-4 text-[#6CD9CA]" size={24} />
                  <div className="flex-grow flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-semibold">{school.name}</h4>
                        <p className="text-sm text-gray-600 ml-4">Rating: {school.rating}/10</p>
                      </div>
                      <p className="mt-1">{school.description}</p>
                    </div>
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#6CD9CA] hover:underline ml-4"
                    >
                      Website
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {selectedSchool && (
              <p className="mt-4 text-lg font-semibold">
                {selectedSchool} school looks like a great option for your child!
              </p>
            )}
          </div>

          {/* Community Programs */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4">Community Programs</h3>
            <p className="mb-4">Select community programs your child can be part of:</p>
            
            <div className="space-y-4">
              {recommendations.communityProgramData.map((program) => (
                <div 
                  key={program.name}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-300
                    ${selectedCommunityPrograms.includes(program.name)
                      ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                      : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                  `}
                  onClick={() => handleCommunityProgramToggle(program.name)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xl font-semibold">{program.name}</h4>
                    </div>
                    <a 
                      href={program.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#6CD9CA] hover:underline"
                    >
                      Website
                    </a>
                  </div>
                  <p className="mt-2">{program.description}</p>
                </div>
              ))}
            </div>

            {selectedCommunityPrograms.length > 0 && (
              <p className="mt-4 text-lg font-semibold">
                {selectedCommunityPrograms.join(', ')} {selectedCommunityPrograms.length === 1 ? 'looks' : 'look'} like a great option for your child!
              </p>
            )}
          </div>
        </>
      )}

      {/* Save Choices Button */}
      {selectedSchool && selectedCommunityPrograms.length > 0 && (
        <div className="text-center">
          <button 
            onClick={handleSaveChoices}
            className="bg-[#6CD9CA] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Save My Choices
          </button>
        </div>
      )}
    </div>
  )
}

export default Stay