'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { School, Home } from 'lucide-react'
import { useAssessment, AssessData } from '../AssessQuiz'
import { MapOnly } from '../OpportunityMap'

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
  suitability?: number; // New field for family suitability score (1-5)
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
      website: 'https://www.arlingtonelementary.edu',
      schoolType: 'elementary'
    },
    {
      name: 'Riverside Middle School',
      rating: 8.5,
      description: 'Innovative middle school offering specialized STEM and arts programs with small class sizes.',
      website: 'https://www.riversidems.edu',
      schoolType: 'middle'
    },
    {
      name: 'Greenwood High School',
      rating: 8.3,
      description: 'Community-focused high school with comprehensive enrichment programs and strong parent engagement.',
      website: 'https://www.greenwoodhs.edu',
      schoolType: 'high'
    }
  ],
  communityProgramData: [
    {
      name: 'Arlington Youth Leadership',
      description: 'Comprehensive youth development program focusing on leadership skills, community service, and personal growth.',
      website: 'https://www.arlingtonyouth.org',
      ageRanges: ['middle', 'high'],
      tags: ['leadership', 'community']
    },
    {
      name: 'STEM Innovators Club',
      description: 'Advanced science and technology program for curious young minds, offering hands-on robotics, coding, and innovation workshops.',
      website: 'https://www.steminnovators.edu',
      ageRanges: ['elementary', 'middle'],
      tags: ['stem', 'technology', 'science']
    },
    {
      name: 'Creative Arts Academy',
      description: 'Comprehensive arts education program offering in-depth training in music, visual arts, theater, and dance.',
      website: 'https://www.creativearts.org',
      ageRanges: ['elementary', 'middle', 'high'],
      tags: ['arts', 'music', 'theater']
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
      description: 'Spacious homes with yards, ideal for families',
      suitability: 4
    },
    {
      type: 'Townhouse',
      priceRange: '$350,000 - $550,000',
      averageSize: '1,500 - 2,200 sq ft',
      description: 'Modern living with lower maintenance',
      suitability: 3
    },
    {
      type: 'Apartment',
      priceRange: '$1,800 - $3,200/month',
      averageSize: '800 - 1,500 sq ft',
      description: 'Convenient options with amenities',
      suitability: 2
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
  assessmentData?: AssessData; 
}

// Helper functions
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
    // If schoolType is undefined, don't include this school
    if (!school.schoolType) return false;
    // Include if it's 'all' or matches one of the needed types
    return school.schoolType === 'all' || neededSchoolTypes.includes(school.schoolType);
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
    // Check if program serves any of the children's age ranges
    const ageMatch = program.ageRanges.includes('all') || 
      childAgeRanges.some(age => {
        // Convert the age string to the appropriate type for the includes check
        const validAge = age as 'preschool' | 'elementary' | 'middle' | 'high';
        return program.ageRanges!.includes(validAge);
      });
    
    // Check gender compatibility
    const genderMatch = !program.genderFocus || 
      program.genderFocus === 'all' ||
      (program.genderFocus === 'girls' && hasGirlChild) ||
      (program.genderFocus === 'boys' && hasBoyChild);
    
    return ageMatch && genderMatch;
  });
};

// Calculate housing suitability based on family characteristics
const filterHousingOptions = (
  options: HousingOption[], 
  assessmentData: AssessData | undefined
): HousingOption[] => {
  // If no assessment data, return all options
  if (!assessmentData) return options;
  
  // Calculate family size (parents + children)
  const familySize = (assessmentData.children?.length || 0) + 2; // Assuming 2 parents
  
  // Tag each housing option with a suitability score
  return options.map(option => {
    let suitability = option.suitability || 3; // Base suitability score
    
    // Adjust based on family size
    if (familySize >= 5 && option.type === 'Apartment') {
      suitability -= 2; // Larger families may need more space than typical apartments
    }
    if (familySize <= 3 && option.type === 'Single Family Home') {
      suitability -= 1; // Small families might find single family homes less economical
    }
    if (familySize >= 4 && option.type === 'Single Family Home') {
      suitability += 1; // Larger families might benefit from single family homes
    }
    
    // Adjust based on income
    const incomeRange = assessmentData.income;
    if (incomeRange === '<25k' && option.type === 'Single Family Home') {
      suitability -= 2; // Lower income families might find single family homes less affordable
    }
    if (incomeRange === '>100k' && option.type === 'Apartment') {
      suitability -= 1; // Higher income families might prefer more spacious options
    }
    
    // Ensure suitability stays within 1-5 range
    suitability = Math.max(1, Math.min(5, suitability));
    
    return {
      ...option,
      suitability
    };
  }).sort((a, b) => (b.suitability || 0) - (a.suitability || 0)); // Sort by suitability
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
    advice.push("For your younger child, look for neighborhoods with parks, playgrounds, and strong elementary schools.");
  }
  
  if (hasTeenager) {
    advice.push("For your teenager, consider areas with extracurricular activities, public transportation access, and college prep programs.");
  }
  
  // Income-based advice
  const lowerIncome = assessmentData.income === '<25k' || assessmentData.income === '25-50k';
  const higherIncome = assessmentData.income === '>100k';
  
  if (lowerIncome) {
    advice.push("Consider areas with affordable housing options, good public transportation, and schools with strong support services.");
  }
  
  if (higherIncome) {
    advice.push("Look for neighborhoods with high opportunity scores, excellent school districts, and enrichment resources.");
  }
  
  // Return the personalized advice
  return advice.join(' ');
};

const Move: React.FC<MoveProps> = ({ onSaveChoices, assessmentData }) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedHousingType, setSelectedHousingType] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MoveRecommendations>(defaultRecommendations);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<CommunityProgramData[]>([]);
  const [filteredHousingOptions, setFilteredHousingOptions] = useState<HousingOption[]>([]);
  const [mapAddress, setMapAddress] = useState<string>('');
  const [shouldFetchData, setShouldFetchData] = useState(false);
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment();
  const contextData = assessmentContext?.data;
  const userData = assessmentData || contextData;

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName);
  };

  const handleCommunityProgramToggle = (programName: string) => {
    setSelectedCommunityPrograms(prev => 
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    );
  };

  const handleNeighborhoodSelect = (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);
    
    // Update map address when neighborhood is selected
    if (zipCode) {
      setMapAddress(`${neighborhoodName}, ${zipCode}`);
    }
  };

  const handleHousingTypeSelect = (housingType: string) => {
    setSelectedHousingType(housingType);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
    // Set flag to fetch data when zipCode changes and length is at least 5
    if (e.target.value.length >= 5) {
      setShouldFetchData(true);
    }
  };
  
  // Fallback data in case the API call fails
  const fallbackRecommendations = defaultRecommendations;

  // Fetch personalized recommendations from OpenAI API
  const fetchRecommendations = useCallback(async () => {
    if (!zipCode || zipCode.length < 5) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = userData || {};
      const address = data.address || '';
      const income = data.income || '<25k';
      const children = data.children || [];
      
      // Update map address when zip code changes
      setMapAddress(zipCode);
      
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
        const errorMessage = `API returned status code ${response.status}: ${response.statusText}`;
        console.error(`API error: ${errorMessage}`);
        
        try {
          // Try to get more detailed error information from the response
          const errorData = await response.json();
          console.error('Error details:', errorData);
          
          if (errorData.details) {
            console.error('API error details:', errorData.details);
          }
          
          if (errorData.rawResponse) {
            console.error('Raw API response:', errorData.rawResponse);
          }
          
          // If we have valid JSON data in the error response that looks like recommendations,
          // we can use it instead of falling back to default data
          if (errorData.townData && errorData.schoolData) {
            console.log('Found valid recommendation data in error response, using it');
            
            // Process the data we received
            const filteredSchools = filterSchoolsByChildAge(errorData.schoolData, userData);
            const filteredPrograms = filterCommunityPrograms(errorData.communityProgramData || [], userData);
            const ratedHousingOptions = filterHousingOptions(errorData.housingOptions || [], userData);
            
            // Update state with the data from the error response
            setFilteredSchools(filteredSchools);
            setFilteredPrograms(filteredPrograms);
            setFilteredHousingOptions(ratedHousingOptions);
            setRecommendations(errorData);
            
            // Show a warning but don't treat it as a full error
            setError(`Using recommendations from response despite API error: ${errorMessage}`);
            setLoading(false);
            
            // Exit early from the function
            return;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        
        // Apply filtering to fallback recommendations
        const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
        const ratedDefaultHousingOptions = filterHousingOptions(fallbackRecommendations.housingOptions, userData);
        
        // Update state with fallback data
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
        setFilteredHousingOptions(ratedDefaultHousingOptions);
        setRecommendations(fallbackRecommendations);
        setError(`Using default recommendations. API error: ${errorMessage}`);
        setLoading(false);
        
        // Exit early from the function
        return;
      }
      
      let recommendationsData;
      try {
        recommendationsData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing API response as JSON:', jsonError);
        
        // Apply filtering to fallback recommendations
        const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
        const ratedDefaultHousingOptions = filterHousingOptions(fallbackRecommendations.housingOptions, userData);
        
        // Update state with fallback data
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
        setFilteredHousingOptions(ratedDefaultHousingOptions);
        setRecommendations(fallbackRecommendations);
        setError('Could not parse API response. Using default recommendations instead.');
        setLoading(false);
        return;
      }
      
      // Ensure the response has the expected structure
      const validatedData: MoveRecommendations = {
        townData: recommendationsData.townData || defaultRecommendations.townData,
        neighborhoodData: {
          topNeighborhoods: Array.isArray(recommendationsData.neighborhoodData?.topNeighborhoods) 
            ? recommendationsData.neighborhoodData.topNeighborhoods 
            : defaultRecommendations.neighborhoodData.topNeighborhoods
        },
        schoolData: Array.isArray(recommendationsData.schoolData) 
          ? recommendationsData.schoolData.map(inferSchoolType)
          : defaultRecommendations.schoolData,
        communityProgramData: Array.isArray(recommendationsData.communityProgramData) 
          ? recommendationsData.communityProgramData 
          : defaultRecommendations.communityProgramData,
        communityDemographics: recommendationsData.communityDemographics || defaultRecommendations.communityDemographics,
        housingOptions: Array.isArray(recommendationsData.housingOptions) 
          ? recommendationsData.housingOptions 
          : defaultRecommendations.housingOptions
      };
      
      // Apply filters based on user data
      const filteredSchoolData = filterSchoolsByChildAge(validatedData.schoolData, userData);
      const filteredProgramData = filterCommunityPrograms(validatedData.communityProgramData, userData);
      const ratedHousingOptions = filterHousingOptions(validatedData.housingOptions, userData);
      
      // Update state
      setRecommendations(validatedData);
      setFilteredSchools(filteredSchoolData);
      setFilteredPrograms(filteredProgramData);
      setFilteredHousingOptions(ratedHousingOptions);
      
    } catch (err) {
      console.error('Error fetching move recommendations:', err);
      setError(`Failed to fetch personalized recommendations: ${err instanceof Error ? err.message : String(err)}. Using default data instead.`);
      
      // Use fallback recommendations but apply filtering
      const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
      const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
      const ratedDefaultHousingOptions = filterHousingOptions(fallbackRecommendations.housingOptions, userData);
      
      setFilteredSchools(filteredDefaultSchools);
      setFilteredPrograms(filteredDefaultPrograms);
      setFilteredHousingOptions(ratedDefaultHousingOptions);
      
      // Use fallback recommendations
      setRecommendations(fallbackRecommendations);
    } finally {
      setLoading(false);
      // Reset the flag after fetching
      setShouldFetchData(false);
    }
  }, [zipCode, userData, fallbackRecommendations]);
  
  // Trigger the API call when shouldFetchData is true
  useEffect(() => {
    if (shouldFetchData) {
      fetchRecommendations();
    }
  }, [shouldFetchData, fetchRecommendations]);

  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
        town: recommendations.townData.name,
        selectedSchool,
        selectedCommunityPrograms,
        selectedNeighborhood: selectedNeighborhood || undefined,
        selectedHousingType: selectedHousingType || undefined
      };
      onSaveChoices(choices);
    }
  };

  const hasRequiredSelections = 
    selectedSchool && 
    selectedCommunityPrograms.length > 0 && 
    zipCode && 
    selectedNeighborhood && 
    selectedHousingType;

  // Safe number formatting function to handle undefined values
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    try {
      return value.toLocaleString();
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(value || 'N/A');
    }
  };

  // Ensure neighborhoods data is valid
  const neighborhoods = Array.isArray(recommendations?.neighborhoodData?.topNeighborhoods) 
    ? recommendations.neighborhoodData.topNeighborhoods 
    : defaultRecommendations.neighborhoodData.topNeighborhoods;

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
              onClick={() => setShouldFetchData(true)}
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
              <p className="mb-4">We&apos;re showing you our default recommendations instead.</p>
              <button 
                onClick={() => setShouldFetchData(true)}
                className="bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Personalized Advice */}
          {!loading && userData && (
            <div className="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p>{generatePersonalizedAdvice(userData)}</p>
            </div>
          )}
          
          {/* Town Information */}
          {!loading && recommendations?.townData && (
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

          {/* Opportunity Map & Top Neighborhoods */}
          {!loading && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Opportunity Map - Takes up left half on desktop */}
                <div className="w-full lg:w-1/2">
                  <h3 className="text-2xl font-semibold mb-4">Opportunity Map</h3>
                  <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                    {mapAddress ? (
                      <div className="w-full h-full">
                        <MapOnly 
                          address={mapAddress}
                          isVisible={true}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <p className="text-gray-500">Enter a ZIP code to see the opportunity map</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Neighborhoods List - Takes up right half on desktop */}
                <div className="w-full lg:w-1/2">
                  <h3 className="text-2xl font-semibold mb-4">Top Neighborhoods in {zipCode}</h3>
                  <p className="mb-4">Select a neighborhood you&apos;re interested in:</p>
                  
                  <div className="space-y-4">
                    {neighborhoods.map((neighborhood) => (
                      <div 
                        key={neighborhood.name} 
                        className={`
                          border rounded-lg p-4 cursor-pointer transition-all duration-300
                          ${selectedNeighborhood === neighborhood.name 
                            ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                            : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                        `}
                        onClick={() => handleNeighborhoodSelect(neighborhood.name)}
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-xl font-semibold">{neighborhood.name}</h4>
                          <div className="flex items-center">
                            <span className="text-sm mr-2">Opportunity Score:</span>
                            <span className="bg-[#6CD9CA] text-white font-bold px-2 py-1 rounded-md">{neighborhood.score}/10</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{neighborhood.description}</p>
                      </div>
                    ))}
                  </div>

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
          {!loading && filteredSchools.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Local Schools</h3>
              <p className="mb-1">Select a school that would be a good option:</p>
              <p className="mb-4 text-sm text-gray-600">{getSchoolLevelMessage(userData)}</p>
              
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
                            <p className="text-sm text-gray-600 ml-4">Rating: {school.rating}/10</p>
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

              {selectedSchool && (
                <p className="mt-4 text-lg font-semibold">
                  {selectedSchool} school looks like a great option for your child!
                </p>
              )}
            </div>
          )}

          {/* Community Programs */}
          {!loading && filteredPrograms.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4">Community Programs</h3>
              <p className="mb-4">Select community programs your child can be part of:</p>
              
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

              {selectedCommunityPrograms.length > 0 && (
                <p className="mt-4 text-lg font-semibold">
                  {selectedCommunityPrograms.join(', ')} {selectedCommunityPrograms.length === 1 ? 'looks' : 'look'} like a great option for your child!
                </p>
              )}
            </div>
          )}

          {/* Community Demographics */}
          {!loading && recommendations?.communityDemographics && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-6 text-center">Community Demographics</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Population Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Population:</span>
                      <span>{formatNumber(recommendations.communityDemographics.population)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Age:</span>
                      <span>{recommendations.communityDemographics.medianAge || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Household Income:</span>
                      <span>${formatNumber(recommendations.communityDemographics.medianHousehold)}</span>
                    </div>
                  </div>
                  
                  <h5 className="mt-6 text-xl font-semibold mb-4">Ethnic Composition</h5>
                  <div className="space-y-2">
                    {Array.isArray(recommendations.communityDemographics.ethnicComposition) && 
                      recommendations.communityDemographics.ethnicComposition.map((group) => (
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
                    {Array.isArray(recommendations.communityDemographics.educationLevel) && 
                      recommendations.communityDemographics.educationLevel.map((level) => (
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
          {!loading && filteredHousingOptions.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-6 text-center">Housing Options</h3>
              <p className="mb-4 text-center">Select a housing type you&apos;re interested in:</p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {filteredHousingOptions.map((option) => (
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
                      <div className="flex items-center">
                        <Home className="text-[#6CD9CA]" size={20} />
                        {option.suitability !== undefined && (
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs
                            ${option.suitability >= 4 ? 'bg-green-100 text-green-800' : 
                             option.suitability >= 3 ? 'bg-blue-100 text-blue-800' : 
                             'bg-gray-100 text-gray-800'}`}>
                            {option.suitability >= 4 ? 'Highly Suitable' : 
                             option.suitability >= 3 ? 'Suitable' : 'Less Suitable'}
                          </span>
                        )}
                      </div>
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
          
          {/* Job Resources Section */}
          {!loading && zipCode && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-6 text-center">Job Resources</h3>
              <p className="mb-4 text-center">Find employment opportunities in your new area:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <a 
                  href="https://www.indeed.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  Indeed
                </a>
                <a 
                  href="https://www.linkedin.com/jobs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  LinkedIn Jobs
                </a>
                <a 
                  href="https://www.glassdoor.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  Glassdoor
                </a>
                <a 
                  href="https://www.usajobs.gov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  USA Jobs
                </a>
              </div>
              
              <h4 className="text-xl font-semibold mb-4 text-center">Local Resources</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <a 
                  href="https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  American Job Centers
                </a>
                <a 
                  href="https://www.sba.gov/local-assistance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  Small Business Resources
                </a>
                <a 
                  href="https://www.meetup.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-[#6CD9CA] hover:bg-opacity-20 rounded-lg p-4 text-center transition-colors"
                >
                  Professional Meetups
                </a>
              </div>
            </div>
          )}

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
  );
};

export default Move;