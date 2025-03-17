'use client'

import { FaChevronDown } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

const Welcome = () => {
  const t = useTranslations('welcome');

  return (
    <div id="welcome" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-8">{t('title')}</h1>
        
        <p className="text-xl md:text-2xl font-semibold mb-12">
          {t('subtitle')}
        </p>
        
        <div className="space-y-5 mb-16 text-lg">
          <p>{t('discover')}</p>
          <p>{t('search')}</p>
          <p>{t('find')}</p>
        </div>
        
        <div className="mt-8 mb-12 space-y-2">
          <p className="text-xl font-semibold">{t('journey1')}</p>
          <p className="text-xl font-semibold">{t('journey2')}</p>
        </div>
        
        <div 
          className="text-primary text-4xl mt-6 animate-bounce cursor-pointer hover:text-primary-dark transition-colors"
          onClick={() => {
            const quizSection = document.getElementById('quiz-section');
            if (quizSection) {
              quizSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Scroll to assessment quiz"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const quizSection = document.getElementById('quiz-section');
              if (quizSection) {
                quizSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          <FaChevronDown className="mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default Welcome