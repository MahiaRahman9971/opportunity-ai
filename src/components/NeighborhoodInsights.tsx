'use client'

import React, { useState, useEffect } from 'react';
import { usePersonalization } from './AssessQuiz';
import { FaSchool, FaShieldAlt, FaHospital, FaStore, FaHome } from 'react-icons/fa';
import { MdDirectionsBus } from 'react-icons/md';

// This would come from an API in a real application
const fetchNeighborhoodData = async (address: string) => {
  // Simulate API call with mock data
  // In a real app, this would fetch data from a real API based on the address
  console.log(`Fetching neighborhood data for: ${address}`);
  
  // Mock data - would be replaced with real API data
  return {
    schoolQuality: {
      score: 7.2,
      description: 'Above average public schools with some specialized programs',
      details: [
        'Elementary School Rating: 7.5/10',
        'Middle School Rating: 6.8/10',
        'High School Rating: 7.3/10',
        '82% high school graduation rate',
        '68% college attendance rate'
      ]
    },
    safety: {
      score: 8.1,
      description: 'Low crime rates compared to national averages',
      details: [
        'Violent crime: 65% below national average',
        'Property crime: 42% below national average',
        'Well-lit streets and active neighborhood watch',
        'Responsive local police department'
      ]
    },
    healthcare: {
      score: 6.5,
      description: 'Adequate healthcare facilities within reasonable distance',
      details: [
        '2 hospitals within 10 miles',
        '5 primary care clinics in the area',
        'Average wait time for appointments: 12 days',
        'Limited pediatric specialists locally'
      ]
    },
    amenities: {
      score: 8.3,
      description: 'Well-equipped with family-friendly amenities',
      details: [
        '5 parks within walking distance',
        'Public library with children\'s programs',
        'Community center with youth activities',
        'Multiple grocery stores and family restaurants'
      ]
    },
    housing: {
      score: 5.9,
      description: 'Moderately affordable housing with some options',
      details: [
        'Median home price: $375,000',
        'Average rent (3BR): $2,200/month',
        'Limited affordable housing programs',
        'Moderate property tax rates'
      ]
    },
    transportation: {
      score: 6.7,
      description: 'Decent public transportation and accessibility',
      details: [
        'Bus routes connecting to major areas',
        'Average commute time: 28 minutes',
        'Limited late-night transportation options',
        'Bike-friendly roads in most areas'
      ]
    }
  };
};

const NeighborhoodInsights = () => {
  const { data } = usePersonalization();
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const getNeighborhoodData = async () => {
      if (data.address) {
        setLoading(true);
        try {
          const neighborhoodData = await fetchNeighborhoodData(data.address);
          setInsightsData(neighborhoodData);
        } catch (error) {
          console.error('Error fetching neighborhood data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    getNeighborhoodData();
  }, [data.address]);

  if (loading) {
    return (
      <div className="my-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2">Loading neighborhood insights...</p>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className="my-12 text-center">
        <p>Please enter your address in the assessment section to see neighborhood insights.</p>
      </div>
    );
  }

  const categories = [
    { id: 'schoolQuality', name: 'School Quality', icon: <FaSchool size={24} /> },
    { id: 'safety', name: 'Safety', icon: <FaShieldAlt size={24} /> },
    { id: 'healthcare', name: 'Healthcare', icon: <FaHospital size={24} /> },
    { id: 'amenities', name: 'Amenities', icon: <FaStore size={24} /> },
    { id: 'housing', name: 'Housing', icon: <FaHome size={24} /> },
    { id: 'transportation', name: 'Transportation', icon: <MdDirectionsBus size={24} /> }
  ];

  // Calculate overall neighborhood score (average of all category scores)
  const overallScore = parseFloat(
    (Object.values(insightsData)
      .reduce((sum: any, category: any) => sum + category.score, 0) / 
      Object.values(insightsData).length
    ).toFixed(1)
  );

  return (
    <div className="mt-16">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Your Neighborhood Insights</h2>
      
      {/* Category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`
              p-4 rounded-lg cursor-pointer transition-all duration-300 text-center
              ${activeCategory === category.id 
                ? 'bg-primary text-white shadow-md transform scale-105' 
                : 'bg-white shadow hover:shadow-md hover:bg-primary hover:bg-opacity-10'}
            `}
            onClick={() => setActiveCategory(
              activeCategory === category.id ? null : category.id
            )}
          >
            <div className="flex flex-col items-center">
              <div className={`mb-2 ${activeCategory === category.id ? 'text-white' : 'text-primary'}`}>
                {category.icon}
              </div>
              <h4 className="font-semibold">{category.name}</h4>
              <div className="mt-2 flex items-center">
                <span className="text-lg font-bold">
                  {insightsData[category.id].score}
                </span>
                <span className="text-sm ml-1">/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Detailed information for selected category */}
      {activeCategory && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 transition-all duration-300">
          <h3 className="text-xl font-semibold mb-2">
            {categories.find(c => c.id === activeCategory)?.name}
          </h3>
          <p className="mb-4">{insightsData[activeCategory].description}</p>
          
          <h4 className="font-semibold mb-2">Details:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {insightsData[activeCategory].details.map((detail: string, index: number) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodInsights;
