'use client'

import React, { useState } from 'react'
import { School } from 'lucide-react'

// Mock data - in a real application, this would come from a database or API
const townData = {
  name: 'Arlington Heights',
  website: 'https://www.arlingtonheights.gov',
  description: 'A vibrant suburban community known for excellent educational opportunities and strong family support systems. Located in a region with diverse economic prospects and community-driven initiatives.',
}

const neighborhoodData = {
  topNeighborhoods: [
    { name: 'Arlington Heights', score: 9.2, description: 'Family-friendly area with excellent schools' },
    { name: 'Riverside Park', score: 8.7, description: 'Diverse community with great amenities' },
    { name: 'Greenwood Estates', score: 8.5, description: 'Quiet suburban neighborhood with parks' }
  ]
}

const schoolData = [
  {
    name: 'Arlington Elementary',
    rating: 9.0,
    description: 'A top-rated elementary school with advanced educational programs and strong community involvement.',
    website: 'https://www.arlingtonelementary.edu'
  },
  {
    name: 'Riverside Magnet School',
    rating: 8.5,
    description: 'Innovative magnet school offering specialized STEM and arts programs with small class sizes.',
    website: 'https://www.riversidemagnet.edu'
  },
  {
    name: 'Greenwood Community School',
    rating: 8.3,
    description: 'Community-focused school with comprehensive enrichment programs and strong parent engagement.',
    website: 'https://www.greenwoodschool.edu'
  }
]

const communityProgramData = [
  {
    name: 'Arlington Youth Leadership',
    description: 'Comprehensive youth development program focusing on leadership skills, community service, and personal growth.',
    website: 'https://www.arlingtonyouth.org'
  },
  {
    name: 'STEM Innovators Club',
    description: 'Advanced science and technology program for curious young minds, offering hands-on robotics, coding, and innovation workshops.',
    website: 'https://www.steminnovators.edu'
  },
  {
    name: 'Creative Arts Academy',
    description: 'Comprehensive arts education program offering in-depth training in music, visual arts, theater, and dance.',
    website: 'https://www.creativearts.org'
  }
]

const communityDemographics = {
  population: 45672,
  medianAge: 38.5,
  ethnicComposition: [
    { group: 'White', percentage: 62 },
    { group: 'Asian', percentage: 22 },
    { group: 'Hispanic', percentage: 8 },
    { group: 'Black', percentage: 5 },
    { group: 'Other', percentage: 3 }
  ],
  medianHousehold: 112500,
  educationLevel: [
    { level: 'Bachelor\'s or higher', percentage: 58 },
    { level: 'Some College', percentage: 25 },
    { level: 'High School', percentage: 12 },
    { level: 'Less than High School', percentage: 5 }
  ]
}

const housingOptions = [
  {
    type: 'Single Family Home',
    priceRange: '$450,000 - $750,000',
    averageSize: '2,200 - 3,500 sq ft',
    description: 'Spacious homes with yards, ideal for families'
  },
  {
    type: 'Townhouse',
    priceRange: '$350,000 - $550,000',
    averageSize: '1,500 - 2,200 sq ft',
    description: 'Modern living with lower maintenance'
  },
  {
    type: 'Apartment',
    priceRange: '$1,800 - $3,200/month',
    averageSize: '800 - 1,500 sq ft',
    description: 'Convenient options with amenities'
  }
]

interface MoveProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
}

const Move: React.FC<MoveProps> = ({ onSaveChoices }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])
  const [zipCode, setZipCode] = useState('')

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

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value)
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
      {/* ZIP Code Input */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Where Would You Like to Move?</h2>
        <p className="text-xl mb-6">Do you know where you want to live next?</p>
        <div className="flex justify-center items-center">
          <label htmlFor="zipCode" className="mr-4 text-lg">Enter ZIP Code:</label>
          <input 
            type="text" 
            id="zipCode"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="e.g. 22204"
            className="border-2 border-[#6CD9CA] rounded-md px-4 py-2 text-lg w-40"
          />
        </div>
      </div>

      {/* Render following sections only when ZIP code is entered */}
      {zipCode && (
        <>
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

          {/* Opportunity Map & Top Neighborhoods */}
          <div className="bg-white shadow-md rounded-lg p-6 flex">
            <div className="w-1/2 pr-4">
              <p className="text-gray-500 text-center py-20">Opportunity Map Coming Soon</p>
            </div>
            <div className="w-1/2 pl-4">
              <h3 className="text-2xl font-semibold mb-4">Top Neighborhoods in {zipCode}</h3>
              {neighborhoodData.topNeighborhoods.map((neighborhood) => (
                <div 
                  key={neighborhood.name} 
                  className="border rounded-lg p-4 mb-4 hover:bg-[#6CD9CA] hover:bg-opacity-10"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-semibold">{neighborhood.name}</h4>
                    <span className="text-sm text-gray-600">Score: {neighborhood.score}/10</span>
                  </div>
                  <p className="text-gray-700 mt-2">{neighborhood.description}</p>
                </div>
              ))}
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

          {/* Community Demographics */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-center">Community Demographics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold mb-4">Population Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Population:</span>
                    <span>{communityDemographics.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Age:</span>
                    <span>{communityDemographics.medianAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Household Income:</span>
                    <span>${communityDemographics.medianHousehold.toLocaleString()}</span>
                  </div>
                </div>
                
                <h5 className="mt-6 text-xl font-semibold mb-4">Ethnic Composition</h5>
                <div className="space-y-2">
                  {communityDemographics.ethnicComposition.map((group) => (
                    <div key={group.group} className="flex justify-between">
                      <span>{group.group}</span>
                      <span>{group.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-4">Education Levels</h4>
                <div className="space-y-2">
                  {communityDemographics.educationLevel.map((level) => (
                    <div key={level.level} className="flex justify-between">
                      <span>{level.level}</span>
                      <span>{level.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Housing Options */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-6 text-center">Find Housing On:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="https://www.redfin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
              >
                Redfin
              </a>
              <a 
                href="https://www.zillow.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
              >
                Zillow
              </a>
              <a 
                href="https://www.hud.gov/program_offices/comm_planning/affordablehousing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
              >
                Affordable Housing
              </a>
              <a 
                href="https://www.craigslist.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
              >
                Craigslist
              </a>
            </div>
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
        </>
      )}
    </div>
  )
}

export default Move