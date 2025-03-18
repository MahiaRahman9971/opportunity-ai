'use client'
import { RefObject, useEffect, useRef, useState } from 'react'

// Prevent static prerendering of this page
export const dynamic = 'force-dynamic'
// Prevent static generation during build
export const runtime = 'edge'
import Navbar from '../../components/Navbar'
import Welcome from '../../components/Welcome'
import PersonalizationQuiz, { usePersonalization } from '../../components/AssessQuiz'
import OpportunityMap from '../../components/OpportunityMap'
import TakeAction from '@/components/action-plan/ActionPlan'
import NextSteps from '../../components/NextSteps'
import CommunityConnections from '../../components/CommunityConnections'
import { PersonalizationProvider } from '../../components/AssessQuiz'
import MobileLanguageSwitcher from '../../components/MobileLanguageSwitcher'
import ClientPage from './client-page'


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
      
      <main>
        <PersonalizationProvider>
          <HomeContent 
            selectedAction={selectedAction} 
            savedChoices={savedChoices}
            handleActionAndChoicesSave={handleActionAndChoicesSave}
          />
        </PersonalizationProvider>
      </main>
      
      <MobileLanguageSwitcher />
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
      <section className="bg-white w-full">
        <div className="container mx-auto">
          <Welcome />
        </div>
      </section>
      
      <section className="bg-gray-100 w-full">
        <div className="container mx-auto">
          <PersonalizationQuiz />
        </div>
      </section>
      
      <section className="bg-white w-full">
        <div className="container mx-auto">
          <OpportunityMap address={data.address} />
        </div>
      </section>
      
      <section className="bg-gray-100 w-full">
        <div className="container mx-auto">
          <TakeAction onSaveActionAndChoices={handleActionAndChoicesSave} />
        </div>
      </section>
      
      <section className="bg-white w-full">
        <div className="container mx-auto">
          <NextSteps selectedAction={selectedAction} savedChoices={savedChoices} />
        </div>
      </section>
      
      <section className="bg-gray-100 w-full">
        <div className="container mx-auto">
          <CommunityConnections />
        </div>
      </section>
    </>
  );
}

// Wrap the Home component with ClientPage for internationalization
export default function Page() {
  return (
    <ClientPage>
      <Home />
    </ClientPage>
  );
}
