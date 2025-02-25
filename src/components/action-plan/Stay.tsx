'use client'

import React, { useState } from 'react'
import { School } from 'lucide-react'

// Mock data - in a real application, this would come from a database or API
const townData = {
  name: 'Oakridge Community',
  website: 'https://www.oakridgetownship.gov',
  description: 'A growing suburban community committed to education and family development. Located in a region with diverse economic opportunities and strong community support.',
}

const schoolData = [
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
]

const communityProgramData = [
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

interface StayProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
}

const Stay: React.FC<StayProps> = ({ onSaveChoices }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])

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
        town: townData.name,
        selectedSchool,
        selectedCommunityPrograms
      }
      onSaveChoices(choices)
    }
  }

  return (
    <div className="space-y-12 mt-16">
      {/* Town Information */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-left">Township Information</h3>
        <div className="text-left space-y-2">
          <p><strong>Town Name:</strong> {townData.name}</p>
          <p>
            <strong>Township Website:</strong>{' '}
            <a 
              href={townData.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#6CD9CA] hover:underline"
            >
              {townData.website}
            </a>{' '}
            <span className="text-sm text-gray-600">
              (Click to learn more about local opportunities!)
            </span>
          </p>
          <p><strong>Description:</strong> {townData.description}</p>
        </div>
      </div>

      {/* Local Schools */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4">Local Schools</h3>
        <p className="mb-4">Select a school that would be a good alternative:</p>
        
        <div className="space-y-4">
          {schoolData.map((school) => (
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
          {communityProgramData.map((program) => (
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