'use client'
import React, { useState, useEffect } from 'react'
import { School, Home } from 'lucide-react'
import { useAssessment } from '../AssessQuiz'

// Define types for the recommendations data
type TownData = {
  name: string;
  website: string;
  description: string;
};

type Neighborhood = {
  name: string;
  score: number;
  description: string;
};

type NeighborhoodData = {
  topNeighborhoods: Neighborhood[];
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

type EthnicGroup = {
  group: string;
  percentage: number;
};

type EducationLevel = {
  level: string;
  percentage: number;
};

type CommunityDemographics = {
  population: number;
  medianAge: number;
  ethnicComposition: EthnicGroup[];
  medianHousehold: number;
  educationLevel: EducationLevel[];
};

type HousingOption = {
  type: string;
  priceRange: string;
  averageSize: string;
  description: string;
};

type MoveRecommendations = {
  townData: TownData;
  neighborhoodData: NeighborhoodData;
  schoolData: SchoolData[];
  communityProgramData: CommunityProgramData[];
  communityDemographics: CommunityDemographics;
  housingOptions: HousingOption[];
};

// Default data to use as fallback
const defaultRecommendations: MoveRecommendations = {
  townData: {
    name: 'Arlington Heights',
    website: 'https://www.arlingtonheights.gov',
    description: 'A vibrant suburban community known for excellent educational opportunities and strong family support systems. Located in a region with diverse economic prospects and community-driven initiatives.',
  },
  neighborhoodData: {
    topNeighborhoods: [
      { name: 'Arlington Heights', score: 9.2, description: 'Family-friendly area with excellent schools' },
      { name: 'Riverside Park', score: 8.7, description: 'Diverse community with great amenities' },
      { name: 'Greenwood Estates', score: 8.5, description: 'Quiet suburban neighborhood with parks' }
    ]
  },
  schoolData: [
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
  ],
  communityProgramData: [
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
  ],
  communityDemographics: {
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
  },
  housingOptions: [
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
};

interface MoveProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
    selectedNeighborhood?: string;
    selectedHousingType?: string;
  }) => void;
  assessmentData?: any; // Optional assessment data that can be passed from parent
}

const Move: React.FC<MoveProps> = ({ onSaveChoices, assessmentData }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [selectedHousingType, setSelectedHousingType] = useState<string | null>(null)
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<MoveRecommendations>(defaultRecommendations)
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment()
  const contextData = assessmentContext?.assessmentData

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

  const handleNeighborhoodSelect = (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName)
  }

  const handleHousingTypeSelect = (housingType: string) => {
    setSelectedHousingType(housingType)
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value)
  }
  
  // Default data for fallback mechanism
  const defaultTownData = {
    name: "Arlington",
    website: "https://www.arlingtonva.us",
    description: "Arlington County is a vibrant urban community in Northern Virginia with excellent schools, diverse neighborhoods, and abundant parks and recreation facilities."
  };
  
  const defaultNeighborhoods = [
    { name: "Clarendon", score: 9.2, description: "Vibrant urban neighborhood with excellent amenities" },
    { name: "Ballston", score: 8.9, description: "Modern urban village with great transit access" },
    { name: "Shirlington", score: 8.5, description: "Quiet suburban neighborhood with parks" }
  ];
  
  const defaultSchoolData = [
    {
      name: "Arlington Elementary",
      rating: 9.0,
      description: "A top-rated elementary school with advanced educational programs and strong community involvement.",
      website: "https://www.arlingtonelementary.edu"
    },
    {
      name: "Riverside Magnet School",
      rating: 8.5,
      description: "Innovative magnet school offering specialized STEM and arts programs with small class sizes.",
      website: "https://www.riversidemagnet.edu"
    },
    {
      name: "Greenwood Community School",
      rating: 8.3,
      description: "Community-focused school with comprehensive enrichment programs and strong parent engagement.",
      website: "https://www.greenwoodschool.edu"
    }
  ];
  
  const defaultCommunityPrograms = [
    {
      name: "Arlington Youth Leadership",
      description: "Comprehensive youth development program focusing on leadership skills, community service, and personal growth.",
      website: "https://www.arlingtonyouth.org"
    },
    {
      name: "STEM Innovators Club",
      description: "Hands-on science and technology program for children of all ages, offering workshops and mentorship.",
      website: "https://www.steminnovators.org"
    },
    {
      name: "Community Arts Center",
      description: "Cultural hub offering classes, exhibitions, and performances for all ages and skill levels.",
      website: "https://www.communityartscenter.org"
    }
  ];
  
  const defaultCommunityDemographics = {
    population: 238643,
    medianAge: 34.2,
    ethnicComposition: [
      { group: "White", percentage: 64 },
      { group: "Hispanic", percentage: 15 },
      { group: "Asian", percentage: 10 },
      { group: "Black", percentage: 8 },
      { group: "Other", percentage: 3 }
    ],
    medianHousehold: 120071,
    educationLevel: [
      { level: "High School", percentage: 95 },
      { level: "Bachelor's Degree", percentage: 74 },
      { level: "Graduate Degree", percentage: 38 },
      { level: "Professional Degree", percentage: 5 }
    ]
  };
  
  const defaultHousingOptions = [
    {
      type: "Single-Family Home",
      priceRange: "$750,000 - $1,500,000",
      averageSize: "2,000 - 3,500 sq ft",
      description: "Spacious detached homes with yards, ideal for families with children."
    },
    {
      type: "Townhouse",
      priceRange: "$550,000 - $850,000",
      averageSize: "1,500 - 2,200 sq ft",
      description: "Multi-level attached homes with modern amenities and small outdoor spaces."
    },
    {
      type: "Condo/Apartment",
      priceRange: "$350,000 - $700,000",
      averageSize: "700 - 1,500 sq ft",
      description: "Low-maintenance living with building amenities like gyms and rooftop spaces."
    }
  ];
  
  // Fallback data in case the API call fails
  const fallbackRecommendations = {
    townData: defaultTownData,
    neighborhoodData: {
      topNeighborhoods: defaultNeighborhoods
    },
    schoolData: defaultSchoolData,
    communityProgramData: defaultCommunityPrograms,
    communityDemographics: defaultCommunityDemographics,
    housingOptions: defaultHousingOptions
  };

  // Fetch personalized recommendations from OpenAI API
  const fetchRecommendations = async () => {
    if (!zipCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = assessmentData || contextData || {};
      const address = data.address || '';
      const income = data.income || '<25k';
      const children = data.children || [];
      
      const response = await fetch('/api/openai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          zipCode,
          income,
          children
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || 
          `API returned status code ${response.status}: ${response.statusText}`
        );
      }
      
      const recommendationsData = await response.json();
      setRecommendations(recommendationsData);
    } catch (err: any) {
      console.error('Error fetching move recommendations:', err);
      setError(`Failed to fetch personalized recommendations: ${err.message}. Using default data instead.`);
      // Use fallback recommendations
      setRecommendations(fallbackRecommendations)
    } finally {
      setLoading(false);
    }
  };
  
  // Trigger the API call when zipCode changes
  useEffect(() => {
    if (zipCode && zipCode.length >= 5) {
      fetchRecommendations();
    }
  }, [zipCode]);

  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
        town: recommendations.townData.name,
        selectedSchool,
        selectedCommunityPrograms,
        selectedNeighborhood: selectedNeighborhood || undefined,
        selectedHousingType: selectedHousingType || undefined
      }
      onSaveChoices(choices)
    }
  }

  const hasRequiredSelections = 
    selectedSchool && 
    selectedCommunityPrograms.length > 0 && 
    zipCode && 
    selectedNeighborhood && 
    selectedHousingType;

  return (
    <div className="space-y-12 mt-16">
      {/* ZIP Code Input */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Where Would You Like to Move?</h2>
        <p className="text-xl mb-6">Do you know where you want to live next?</p>
        <div className="flex justify-center items-center">
          <label htmlFor="zipCode" className="mr-4 text-lg">Enter ZIP Code:</label>
          <div className="relative">
            <input 
              type="text" 
              id="zipCode"
              value={zipCode}
              onChange={handleZipCodeChange}
              placeholder="e.g. 22204"
              className="border-2 border-[#6CD9CA] rounded-md px-4 py-2 text-lg w-40"
              disabled={loading}
            />
            {loading && zipCode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6CD9CA]"></div>
              </div>
            )}
          </div>
          {zipCode && !loading && (
            <button 
              onClick={fetchRecommendations}
              className="ml-2 bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
            >
              Update
            </button>
          )}
        </div>
      </div>

      {/* Render following sections only when ZIP code is entered */}
      {zipCode && (
        <>
          {/* Loading State */}
          {loading && (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
              </div>
              <p className="mt-4 text-gray-600">Fetching personalized recommendations for {zipCode}...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-2xl font-semibold mb-4 text-left">Notice</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="mb-4">We're showing you our default recommendations instead.</p>
              <button 
                onClick={fetchRecommendations}
                className="bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          

          
          {/* Town Information */}
          {!loading && (
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
          )}

          {/* Opportunity Map & Top Neighborhoods - UPDATED WITH SELECTION */}
          {!loading && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 pr-0 lg:pr-4 mb-6 lg:mb-0">
                  <p className="text-gray-500 text-center py-20">Opportunity Map Coming Soon</p>
                </div>
                <div className="w-full lg:w-1/2 pl-0 lg:pl-4">
                  <h3 className="text-2xl font-semibold mb-4">Top Neighborhoods in {zipCode}</h3>
                  <p className="mb-4">Select a neighborhood you&apos;re interested in:</p>
                  
                  {recommendations.neighborhoodData.topNeighborhoods.map((neighborhood) => (
                  <div 
                    key={neighborhood.name} 
                    className={`
                      border rounded-lg p-4 mb-4 cursor-pointer transition-all duration-300
                      ${selectedNeighborhood === neighborhood.name 
                        ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                        : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                    `}
                    onClick={() => handleNeighborhoodSelect(neighborhood.name)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-semibold">{neighborhood.name}</h4>
                      <span className="text-sm text-gray-600">Score: {neighborhood.score}/10</span>
                    </div>
                    <p className="text-gray-700 mt-2">{neighborhood.description}</p>
                  </div>
                ))}

                {selectedNeighborhood && (
                  <p className="mt-4 text-lg font-semibold">
                    {selectedNeighborhood} looks like a great neighborhood for your family!
                  </p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Local Schools */}
          {!loading && (
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
          )}

          {/* Community Programs */}
          {!loading && (
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
          )}

          {/* Community Demographics */}
          {!loading && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-6 text-center">Community Demographics</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Population Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Population:</span>
                      <span>{recommendations.communityDemographics.population}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Age:</span>
                      <span>{recommendations.communityDemographics.medianAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Household Income:</span>
                      <span>${recommendations.communityDemographics.medianHousehold.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <h5 className="mt-6 text-xl font-semibold mb-4">Ethnic Composition</h5>
                  <div className="space-y-2">
                    {recommendations.communityDemographics.ethnicComposition.map((group) => (
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
                    {recommendations.communityDemographics.educationLevel.map((level) => (
                      <div key={level.level} className="flex justify-between">
                        <span>{level.level}</span>
                        <span>{level.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Housing Options - UPDATED WITH SELECTION */}
          {!loading && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-6 text-center">Housing Options</h3>
              <p className="mb-4 text-center">Select a housing type you&apos;re interested in:</p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {recommendations.housingOptions.map((option) => (
                <div 
                  key={option.type}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-300
                    ${selectedHousingType === option.type 
                      ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                      : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                  `}
                  onClick={() => handleHousingTypeSelect(option.type)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-semibold">{option.type}</h4>
                    <Home className="text-[#6CD9CA]" size={20} />
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Price Range:</strong> {option.priceRange}</p>
                    <p><strong>Size:</strong> {option.averageSize}</p>
                    <p>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedHousingType && (
              <p className="mt-4 mb-6 text-lg font-semibold text-center">
                {selectedHousingType} seems like a good fit for your family!
              </p>
            )}
            
            <h4 className="text-xl font-semibold mb-4 text-center">Find Housing On:</h4>
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
          )}

          {/* Personalized Recommendations */}

          
          {/* Save Choices Button */}
          {hasRequiredSelections ? (
            <div className="text-center">
              <button 
                onClick={handleSaveChoices}
                className="bg-[#6CD9CA] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Save My Choices
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>Please select a neighborhood, school, housing type, and at least one community program to continue</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Move