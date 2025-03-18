'use client';

import React, { useState } from 'react';
import { FaSchool, FaShieldAlt, FaHospital, FaStore, FaHome } from 'react-icons/fa';
import { MdDirectionsBus } from 'react-icons/md';
import { useTranslations } from 'next-intl';

// Define interfaces for neighborhood data
export interface CategoryData {
  score: number;
  description: string;
  details: string[];
}

export interface NeighborhoodData {
  schoolQuality: CategoryData;
  safety: CategoryData;
  healthcare: CategoryData;
  amenities: CategoryData;
  housing: CategoryData;
  transportation: CategoryData;
  [key: string]: CategoryData; // Index signature for dynamic access
}

interface NeighborhoodAnalysisProps {
  insightsData: NeighborhoodData | null;
  loadingInsights: boolean;
  opportunityScore: number | null;
  loadingOpportunityScore?: boolean;
}

const NeighborhoodAnalysis: React.FC<NeighborhoodAnalysisProps> = ({ 
  insightsData, 
  loadingInsights, 
  opportunityScore, 
  loadingOpportunityScore = false 
}) => {
  const t = useTranslations('neighborhoodAnalysis');
  
  // State to track user ratings for each category
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  
  // Function to set user rating for a category
  const setUserRating = (categoryId: string, rating: number, element: HTMLDivElement) => {
    // Add a subtle animation effect when clicked
    element.classList.add('animate-pulse');
    setTimeout(() => {
      element.classList.remove('animate-pulse');
    }, 300);
    
    setUserRatings(prev => {
      // If clicking the same rating again, remove the rating
      if (prev[categoryId] === rating + 1) {
        const newRatings = { ...prev };
        delete newRatings[categoryId];
        return newRatings;
      }
      // Otherwise set the new rating
      return {
        ...prev,
        [categoryId]: rating + 1 // Add 1 because index is 0-based but rating is 1-10
      };
    });
  };
  
  // Define the categories for neighborhood insights
  const categories = [
    { id: 'schoolQuality', name: t('schoolQuality'), icon: <FaSchool size={20} /> },
    { id: 'safety', name: t('safety'), icon: <FaShieldAlt size={20} /> },
    { id: 'healthcare', name: t('healthcare'), icon: <FaHospital size={20} /> },
    { id: 'amenities', name: t('amenities'), icon: <FaStore size={20} /> },
    { id: 'housing', name: t('housing'), icon: <FaHome size={20} /> },
    { id: 'transportation', name: t('transportation'), icon: <MdDirectionsBus size={20} /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4">{t('title')}</h3>
      
      {(!insightsData && opportunityScore === null) ? (
        <div className="flex justify-center items-center flex-grow">
          <p className="text-gray-500">{t('enterAddress')}</p>
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          {/* Opportunity Score */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold mb-4">{t('opportunityScore')}</h4>
            <div className="flex items-center">
              {loadingOpportunityScore ? (
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className="relative flex flex-col items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border-4 border-gray-200 z-10">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">
                      {t('loadingScore')}
                    </p>
                  </div>
                </div>
              ) : opportunityScore !== null ? (
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className="absolute w-24 h-24 bg-primary bg-opacity-10 rounded-full animate-pulse"></div>
                    <div className="relative flex flex-col items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border-4 border-primary z-10">
                      <span 
                        className="text-2xl font-bold" 
                        style={{ color: '#6CD9CA' }}
                      >
                        {Math.round(opportunityScore)}/10
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">
                      {t('scoreDescription')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className="relative flex flex-col items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg border-4 border-gray-200 z-10">
                      <span className="text-2xl font-bold text-gray-300">--</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">
                      {t('enterAddress')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Neighborhood Insights Bar Graph */}
          {loadingInsights ? (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{t('neighborhoodFactors')}</h4>
                <p className="text-xs text-gray-500 italic mt-1">(Click to set your own rating)</p>
              </div>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-sm text-gray-500">{t('loadingInsights')}</p>
              </div>
            </div>
          ) : insightsData ? (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{t('neighborhoodFactors')}</h4>
                <p className="text-xs text-gray-500 italic mt-1">(Click to set your own rating)</p>
              </div>
              <div>
                {categories.map((category) => {
                  const score = insightsData[category.id].score;
                  const filledIcons = Math.round(score);
                  
                  return (
                    <div key={category.id} className="mb-5">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="ml-auto text-sm font-semibold">
                          {userRatings[category.id] ? 
                            <span style={{ color: '#6CD9CA' }}>{userRatings[category.id]}/10</span> : 
                            <span>{Math.round(score)}/10</span>
                          }
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(10)].map((_, index) => {
                          // Get user rating for this category (if any)
                          const userRating = userRatings[category.id] || 0;
                          
                          // Determine if this icon should be filled
                          // If user has set a rating, use that, otherwise use the data score
                          const isFilledByUser = userRating > 0 && index < userRating;
                          const isFilledByScore = userRating === 0 && index < filledIcons;
                          
                          return (
                            <div 
                              key={index} 
                              className={`
                                ${isFilledByUser ? 'text-primary' : isFilledByScore ? 'text-primary' : 'text-gray-200'}
                                cursor-pointer transition-all duration-200 hover:scale-110 hover:opacity-80 hover:drop-shadow-md
                                ${index === 0 ? 'relative group' : ''}
                              `}
                              onClick={(e) => setUserRating(category.id, index, e.currentTarget as HTMLDivElement)}
                              title={`${category.name} - Level ${index + 1}`}
                            >
                              {category.icon}
                              {index === 0 && (
                                <div className="absolute left-0 -top-8 w-32 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                  Click to rate
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          
          {/* No additional information section */}
        </div>
      )}
    </div>
  );
};

export default NeighborhoodAnalysis;
