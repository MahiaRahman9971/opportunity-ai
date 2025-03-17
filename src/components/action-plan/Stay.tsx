'use client'

import React, { useState, useEffect } from 'react'
import { School } from 'lucide-react'
import { useAssessment, AssessData } from '../AssessQuiz'
import { useTranslations } from 'next-intl'

// Enhanced types for the recommendations data
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
  schoolType?: 'elementary' | 'middle' | 'high' | 'all'; // New field
};

type CommunityProgramData = {
  name: string;
  description: string;
  website: string;
  ageRanges?: ('preschool' | 'elementary' | 'middle' | 'high' | 'all')[]; // New field
  genderFocus?: 'all' | 'boys' | 'girls'; // New field
  tags?: string[]; // New field
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
      website: 'https://www.oakridgeelementary.edu',
      schoolType: 'elementary'
    },
    {
      name: 'Oakridge Middle School',
      rating: 8.2,
      description: 'A magnet school offering specialized programs in arts and technology, with small class sizes.',
      website: 'https://www.oakridgemiddle.edu',
      schoolType: 'middle'
    },
    {
      name: 'Oakridge High School',
      rating: 7.9,
      description: 'A community-focused school with integrated enrichment programs and strong parent involvement.',
      website: 'https://www.oakridgehigh.edu',
      schoolType: 'high'
    }
  ],
  communityProgramData: [
    {
      name: 'Youth Leadership Academy',
      description: 'After-school program focusing on leadership skills, community service, and personal development.',
      website: 'https://www.youthleadershipacademy.org',
      ageRanges: ['elementary', 'middle', 'high'],
      genderFocus: 'all',
      tags: ['leadership', 'community']
    },
    {
      name: 'STEM Explorers Club',
      description: 'Hands-on science and technology program for curious young minds, with robotics and coding workshops.',
      website: 'https://www.stemexplorers.edu',
      ageRanges: ['elementary', 'middle'],
      genderFocus: 'all',
      tags: ['stem', 'technology', 'science']
    },
    {
      name: 'Creative Arts Program',
      description: 'Comprehensive arts education program offering music, visual arts, theater, and dance classes.',
      website: 'https://www.creativeartsprogram.org',
      ageRanges: ['elementary', 'middle', 'high'],
      genderFocus: 'all',
      tags: ['arts', 'creativity']
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

// Helper function to determine appropriate school type based on child's age
const getSchoolTypeForAge = (age: number): 'elementary' | 'middle' | 'high' => {
  if (age >= 5 && age <= 10) return 'elementary';
  if (age >= 11 && age <= 13) return 'middle';
  if (age >= 14) return 'high';
  return 'elementary'; // Default to elementary for very young children
};

// Helper function to filter schools based on children's ages
const filterSchoolsByChildAge = (schools: SchoolData[], assessmentData: AssessData | undefined): SchoolData[] => {
  // If no children data is available, return all schools
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return schools;
  }

  // Get school types needed for all children in the family
  const neededSchoolTypes = assessmentData.children
    .map(child => {
      const age = parseInt(child.age);
      return getSchoolTypeForAge(age);
    })
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  // Filter schools that match any of the needed school types or are marked as 'all' (all grades)
  return schools.filter(school => {
    // If schoolType is undefined, don't include it
    if (!school.schoolType) return false;
    
    // Now we know schoolType is defined, check if it's 'all' or in neededSchoolTypes
    return school.schoolType === 'all' || 
           neededSchoolTypes.includes(school.schoolType as 'elementary' | 'middle' | 'high');
  });
};

// Helper function to filter community programs based on children's profiles
const filterCommunityPrograms = (
  programs: CommunityProgramData[], 
  assessmentData: AssessData | undefined
): CommunityProgramData[] => {
  // If no children data is available, return all programs
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return programs;
  }

  // Get age ranges needed for all children in the family
  const childAgeRanges = assessmentData.children.map(child => {
    const age = parseInt(child.age);
    if (age >= 5 && age <= 10) return 'elementary';
    if (age >= 11 && age <= 13) return 'middle';
    if (age >= 14) return 'high';
    return 'preschool'; // For very young children
  });

  // Get gender preferences
  const hasGirlChild = assessmentData.children.some(child => child.gender === 'F');
  const hasBoyChild = assessmentData.children.some(child => child.gender === 'M');

  // Filter programs that match age ranges and gender considerations
  return programs.filter(program => {
    // If no age ranges are specified, include the program
    if (!program.ageRanges || program.ageRanges.length === 0) return true;
    
    // At this point we know program.ageRanges exists and has elements
    const ageRanges = program.ageRanges; // Store in a local variable to help TypeScript understand it's defined
    
    // Check if program serves any of the children's age ranges
    const ageMatch = ageRanges.includes('all') || 
      childAgeRanges.some(age => {
        // Convert the age string to the appropriate type for the includes check
        const validAge = age as 'preschool' | 'elementary' | 'middle' | 'high';
        return ageRanges.includes(validAge);
      });
    
    // Check gender compatibility
    const genderMatch = !program.genderFocus || 
      program.genderFocus === 'all' ||
      (program.genderFocus === 'girls' && hasGirlChild) ||
      (program.genderFocus === 'boys' && hasBoyChild);
    
    return ageMatch && genderMatch;
  });
};

// Helper to infer school type if not provided
const inferSchoolType = (school: SchoolData): SchoolData => {
  if (school.schoolType) return school;
  
  const name = school.name.toLowerCase();
  let schoolType: 'elementary' | 'middle' | 'high' | 'all' = 'all';
  
  if (name.includes('elementary') || name.includes('primary')) {
    schoolType = 'elementary';
  } else if (name.includes('middle') || name.includes('junior')) {
    schoolType = 'middle';
  } else if (name.includes('high')) {
    schoolType = 'high';
  }
  
  return { ...school, schoolType };
};

// Helper to get school level message
const getSchoolLevelMessage = (assessmentData: AssessData | undefined): string => {
  if (!assessmentData || !assessmentData.children || assessmentData.children.length === 0) {
    return 'Showing all schools in the area';
  }

  const schoolTypes = assessmentData.children
    .map(child => getSchoolTypeForAge(parseInt(child.age)))
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
  const typeLabels: Record<string, string> = {
    elementary: 'elementary schools',
    middle: 'middle schools',
    high: 'high schools'
  };
  
  const typeStrings = schoolTypes.map(type => typeLabels[type]);
  
  if (typeStrings.length === 1) {
    return `Showing ${typeStrings[0]} based on your child's age`;
  } else {
    return `Showing ${typeStrings.join(' and ')} based on your children's ages`;
  }
};

// Generate personalized advice based on the user's specific situation
const generatePersonalizedAdvice = (assessmentData: AssessData | undefined): string => {
  if (!assessmentData) return '';
  
  const advice = [];
  
  // Age-specific advice
  const hasYoungChild = assessmentData.children?.some(child => parseInt(child.age) <= 10);
  const hasTeenager = assessmentData.children?.some(child => parseInt(child.age) >= 13);
  
  if (hasYoungChild) {
    advice.push("For your younger child, look for schools with strong early literacy programs and supportive environments.");
  }
  
  if (hasTeenager) {
    advice.push("For your teenager, consider schools with college prep programs, AP/IB courses, and strong counseling services.");
  }
  
  // Income-based advice
  const lowerIncome = assessmentData.income === '<25k' || assessmentData.income === '25-50k';
  const higherIncome = assessmentData.income === '>100k';
  
  if (lowerIncome) {
    advice.push("Ask about free/reduced lunch programs, scholarship opportunities, and fee waivers for extracurricular activities.");
  }
  
  if (higherIncome) {
    advice.push("Look for schools and programs that offer advanced enrichment opportunities and acceleration options.");
  }
  
  // Return the personalized advice
  return advice.join(' ');
};

const Stay: React.FC<StayProps> = ({ onSaveChoices, assessmentData }) => {
  const t = useTranslations('stay');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendations>(defaultRecommendations)
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>(defaultRecommendations.schoolData)
  const [filteredPrograms, setFilteredPrograms] = useState<CommunityProgramData[]>(defaultRecommendations.communityProgramData)
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
        
        const data = await response.json();
        
        // Ensure schoolType is present or infer it
        const processedSchoolData = data.schoolData.map(inferSchoolType);
        
        // Apply filters based on child's age
        const filteredSchoolData = filterSchoolsByChildAge(processedSchoolData, userData);
        const filteredProgramData = filterCommunityPrograms(data.communityProgramData, userData);
        
        // Store both the complete and filtered data
        setRecommendations({
          ...data,
          schoolData: processedSchoolData
        });
        
        setFilteredSchools(filteredSchoolData);
        setFilteredPrograms(filteredProgramData);
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError(`Failed to load personalized recommendations: ${err instanceof Error ? err.message : String(err)}. Using default data instead.`)
        
        // Fall back to default recommendations but apply filtering
        const filteredDefaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
        
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
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
          {/* Personalized Advice */}
          {userData && (
            <div className="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p>{generatePersonalizedAdvice(userData)}</p>
            </div>
          )}

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
                  {t('clickToLearnMore')}
                </span>
              </p>
              <p><strong>{t('description')}:</strong> {recommendations.townData.description}</p>
            </div>
          </div>

          {/* Local Schools */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4">{t('localSchools')}</h3>
            <p className="mb-1">{t('selectSchool')}</p>
            <p className="mb-4 text-sm text-gray-600">{getSchoolLevelMessage(userData)}</p>
            
            {filteredSchools.length > 0 ? (
              <div className="space-y-4">
                {filteredSchools.map((school) => (
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
                          <div className="flex items-center">
                            <p className="text-sm text-gray-600 ml-4">{t('rating')}: {school.rating}/10</p>
                            {school.schoolType && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">
                                {school.schoolType}
                              </span>
                            )}
                          </div>
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
            ) : (
              <p className="text-center text-gray-600 py-4">
                No schools matching your children&apos;s age profiles were found. Please try adjusting your search.
              </p>
            )}

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
            
            {filteredPrograms.length > 0 ? (
              <div className="space-y-4">
                {filteredPrograms.map((program) => (
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
                      <div className="flex items-center">
                        {program.genderFocus && program.genderFocus !== 'all' && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs mr-2 capitalize">
                            {program.genderFocus}
                          </span>
                        )}
                        {program.ageRanges && program.ageRanges.length > 0 && program.ageRanges[0] !== 'all' && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs mr-2 capitalize">
                            {program.ageRanges.join(', ')}
                          </span>
                        )}
                        <a 
                          href={program.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#6CD9CA] hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    </div>
                    <p className="mt-2">{program.description}</p>
                    {program.tags && program.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {program.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">
                No community programs matching your children&apos;s profiles were found. Please try adjusting your search.
              </p>
            )}

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