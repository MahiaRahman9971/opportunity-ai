'use client'
import React, { useState } from 'react'
import Stay from './Stay'
import Move from './Move'
import { useAssessment } from '../AssessQuiz'
import { useTranslations } from 'next-intl'

interface SavedChoices {
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
}

interface TakeActionProps {
  onSaveActionAndChoices?: (action: 'stay' | 'move', choices: SavedChoices) => void;
}

const TakeAction: React.FC<TakeActionProps> = ({ onSaveActionAndChoices }) => {
  const t = useTranslations('takeAction');
  const [selectedAction, setSelectedAction] = useState<'stay' | 'move' | null>(null)
  const [savedChoices, setSavedChoices] = useState<SavedChoices | null>(null)
  
  // Get assessment data from context
  const { data: assessmentData } = useAssessment()
  
  const handleActionSelect = (action: 'stay' | 'move') => {
    setSelectedAction(action)
  }
  
  const handleSaveChoices = (choices: SavedChoices) => {
    setSavedChoices(choices)
    
    // Pass choices up to parent component along with selected action
    if (onSaveActionAndChoices && selectedAction) {
      onSaveActionAndChoices(selectedAction, choices)
    }
  }
  
  return (
    <div 
      id="take-action" 
      className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20"
    >
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-xl">{t('subtitle')}</p>
      </div>
      <div className="mt-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t('whatWouldYouLikeToDo')}</h2>
        
        <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Stay & Improve Option */}
          <div 
            className={`
              w-full max-w-md p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 bg-white
              ${selectedAction === 'stay' 
                ? 'border-4 border-[#6CD9CA] scale-105' 
                : 'hover:shadow-xl hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleActionSelect('stay')}
          >
            <h3 className="text-2xl font-bold mb-4">{t('stayOption')}</h3>
            <p className="mb-4">{t('stayOptionSubtitle')}</p>
            <ul className="list-disc list-inside mb-6 text-left">
              <li>{t('stayBullet1')}</li>
              <li>{t('stayBullet2')}</li>
              <li>{t('stayBullet3')}</li>
              <li>{t('stayBullet4')}</li>
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
              {t('chooseThisOption')}
            </button>
          </div>
          {/* Explore New Areas Option */}
          <div 
            className={`
              w-full max-w-md p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 bg-white
              ${selectedAction === 'move' 
                ? 'border-4 border-[#6CD9CA] scale-105' 
                : 'hover:shadow-xl hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleActionSelect('move')}
          >
            <h3 className="text-2xl font-bold mb-4">{t('moveOption')}</h3>
            <p className="mb-4">{t('moveOptionSubtitle')}</p>
            <ul className="list-disc list-inside mb-6 text-left">
              <li>{t('moveBullet1')}</li>
              <li>{t('moveBullet2')}</li>
              <li>{t('moveBullet3')}</li>
              <li>{t('moveBullet4')}</li>
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
              {t('chooseThisOption')}
            </button>
          </div>
        </div>
        {/* Action Details Section (conditionally rendered) */}
        {selectedAction === 'stay' && (
          <Stay onSaveChoices={handleSaveChoices} assessmentData={assessmentData} />
        )}
        {selectedAction === 'move' && (
          <Move onSaveChoices={handleSaveChoices} assessmentData={assessmentData} />
        )}
        {/* Saved Choices Summary */}
        {savedChoices && (
          <div className="mt-12 bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('savedChoices')}</h3>
            <div className="space-y-2">
              <p><strong>{t('town')}:</strong> {savedChoices.town}</p>
              {selectedAction === 'move' && savedChoices.selectedNeighborhood && (
                <p><strong>{t('selectedNeighborhood')}:</strong> {savedChoices.selectedNeighborhood}</p>
              )}
              <p><strong>{t('selectedSchool')}:</strong> {savedChoices.selectedSchool}</p>
              <p>
                <strong>{t('selectedCommunityPrograms')}:</strong>{' '}
                {savedChoices.selectedCommunityPrograms.join(', ')}
              </p>
              {selectedAction === 'move' && savedChoices.selectedHousingType && (
                <p><strong>{t('housingType')}:</strong> {savedChoices.selectedHousingType}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TakeAction