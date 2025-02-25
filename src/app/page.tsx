'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Welcome from '../components/Welcome'
import Learn from '../components/Learn'
import PersonalizationQuiz from '../components/PersonalizationQuiz'
import OpportunityMap from '../components/OpportunityMap'  // Add this import
import TakeAction from '@/components/ActionPlan'

function Home() {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

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
        <Welcome />
        <Learn />
        <PersonalizationQuiz />
        <OpportunityMap /> 
        <TakeAction />
      </main>
    </>
  )
}

export default Home