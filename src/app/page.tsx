'use client'
import { RefObject, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Welcome from '../components/Welcome'
import Learn from '../components/Learn'
import PersonalizationQuiz, { usePersonalization } from '../components/AssessQuiz'
import OpportunityMap from '../components/OpportunityMap'
import TakeAction from '@/components/action-plan/ActionPlan'
import NextSteps from '../components/NextSteps'
import CommunityConnections from '../components/CommunityConnections'
import { PersonalizationProvider } from '../components/AssessQuiz'

interface SavedChoices {
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
}

function Home() {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'stay' | 'move' | null>(null)
  const [savedChoices, setSavedChoices] = useState<SavedChoices | null>(null)
  
  // Function to receive action and choices from TakeAction component
  const handleActionAndChoicesSave = (action: 'stay' | 'move', choices: SavedChoices) => {
    setSelectedAction(action)
    setSavedChoices(choices)
  }
  
  useEffect(() => {
    setIsMounted(true)
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollPosition = window.scrollY
      const scrollPercentage = (scrollPosition / totalScroll) * 100
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${scrollPercentage}%`
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Only render full content after component mounts on client
  if (!isMounted) {
    return <div className="min-h-screen"></div> // Empty placeholder during server render
  }
  
  return (
    <>
      <Navbar progressBarRef={progressBarRef as RefObject<HTMLDivElement>} />
      
      <main className="container">
        <PersonalizationProvider>
          <HomeContent 
            selectedAction={selectedAction} 
            savedChoices={savedChoices}
            handleActionAndChoicesSave={handleActionAndChoicesSave}
          />
        </PersonalizationProvider>
      </main>
    </>
  )
}

// This component allows us to access the personalization context
function HomeContent({ 
  selectedAction, 
  savedChoices,
  handleActionAndChoicesSave
}: { 
  selectedAction: 'stay' | 'move' | null;
  savedChoices: SavedChoices | null;
  handleActionAndChoicesSave: (action: 'stay' | 'move', choices: SavedChoices) => void;
}) {
  // Now we can use the personalization context
  const { data } = usePersonalization();
  
  return (
    <>
      <Welcome />
      <PersonalizationQuiz />
      <OpportunityMap address={data.address} />
      <Learn />
      <TakeAction onSaveActionAndChoices={handleActionAndChoicesSave} />
      <NextSteps selectedAction={selectedAction} savedChoices={savedChoices} />
      <CommunityConnections />
    </>
  );
}

export default Home