'use client'

import { RefObject, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { FaChevronDown } from 'react-icons/fa'

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
        {/* Welcome Section */}
        <section id="welcome" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-8">Building Your Child&apos;s Future</h1>
            
            <p className="text-xl md:text-2xl font-semibold mb-12">
              A friendly guide to creating opportunities for your family!
            </p>
            
            <div className="space-y-5 mb-16 text-lg">
              <p>Discover the bests places to live</p>
              <p>Search for the best schools</p>
              <p>Find local resources and community programs</p>
            </div>
            
            <div className="mt-8 mb-12 space-y-2">
              <p className="text-xl font-semibold">Let&apos;s take this journey together</p>
              <p className="text-xl font-semibold">one step at a time</p>
            </div>
            
            <div className="text-primary text-4xl mt-6 animate-bounce">
              <FaChevronDown className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Learn Section */}
        <section id="learn" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">{/* Added scroll-mt-20 here */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Learn About Opportunity</h1>
            <p className="text-xl">Opportunity in America depends on where you live</p>
          </div>

          {/* Map Visualization */}
          <div className="mb-16 relative">
            <div className="mb-6 relative">
              <Image 
                src="/opportunity-map.jpg" 
                alt="Map of opportunity in America" 
                width={800} 
                height={480} 
                className="mx-auto w-full max-w-3xl h-auto"
                priority
              />
              <div className="absolute top-4 left-4 text-sm md:text-base">
                <p>Blue areas are high opportunity</p>
              </div>
              <div className="absolute bottom-4 right-4 text-sm md:text-base">
                <p>Red areas are Low opportunity</p>
              </div>
            </div>
          </div>

          {/* Why opportunities vary section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">Why do opportunities vary by area?</h2>
              <p>Let&apos;s understand what makes some areas have more opportunities than others:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Segregation */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">Segregation</h3>
                <p className="mb-4 text-gray-700">How mixed or separated different communities are</p>
                <button className="bg-primary hover:bg-opacity-80 text-white py-2 px-4 rounded-full text-sm">Learn More</button>
              </div>

              {/* Income Inequality */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">Income Inequality</h3>
                <p className="mb-4 text-gray-700">The gap between high and low income families</p>
                <button className="bg-primary hover:bg-opacity-80 text-white py-2 px-4 rounded-full text-sm">Learn More</button>
              </div>

              {/* School Quality */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">School Quality</h3>
                <p className="mb-4 text-gray-700">How good the local schools are</p>
                <button className="bg-primary hover:bg-opacity-80 text-white py-2 px-4 rounded-full text-sm">Learn More</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Family Structure */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">Family Structure</h3>
                <p className="mb-4 text-gray-700">Support systems within families</p>
                <button className="bg-primary hover:bg-opacity-80 text-white py-2 px-4 rounded-full text-sm">Learn More</button>
              </div>

              {/* Social Capital */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">Social Capital</h3>
                <p className="mb-4 text-gray-700">Community connections and support</p>
                <button className="bg-primary hover:bg-opacity-80 text-white py-2 px-4 rounded-full text-sm">Learn More</button>
              </div>
            </div>
          </div>

          {/* How can we do better section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold">How can we do better?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {/* Live in Good Areas - House icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                  </svg>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
                  1
                </div>
                <h3 className="text-base font-semibold mb-1 text-center">Live in Good Areas</h3>
                <p className="text-sm text-center text-gray-700">Find neighborhoods with better schools, resources, and opportunity networks</p>
              </div>

              {/* Good Education - School building icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
                  2
                </div>
                <h3 className="text-base font-semibold mb-1 text-center">Good Education</h3>
                <p className="text-sm text-center text-gray-700">Access quality schools, afterschool programs, and educational resources</p>
              </div>

              {/* Take Advantage - Lightbulb/opportunity icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
                  </svg>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
                  3
                </div>
                <h3 className="text-base font-semibold mb-1 text-center">Take Advantage of Opportunities</h3>
                <p className="text-sm text-center text-gray-700">Utilize mentorship, community programs, and enrichment activities</p>
              </div>

              {/* Graduate College - Graduation cap icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12,3L1,9L12,15L23,9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                  </svg>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
                  4
                </div>
                <h3 className="text-base font-semibold mb-1 text-center">Graduate College</h3>
                <p className="text-sm text-center text-gray-700">Higher education significantly improves lifetime earning potential</p>
              </div>

              {/* Career Success - Briefcase/professional icon */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M14,6V4H10V6H14Z" />
                  </svg>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mb-3 font-semibold">
                  5
                </div>
                <h3 className="text-base font-semibold mb-1 text-center">Career Success</h3>
                <p className="text-sm text-center text-gray-700">Build professional skills and networks for long-term financial stability</p>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center mt-16 mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Ready to explore opportunities in your area?</h2>
            <p className="text-xl mb-6">Let&apos;s do it!</p>
            <div className="flex justify-center">
              <div className="text-primary text-4xl animate-bounce">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                  <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

// Alternative approach if the above still causes hydration issues:
// export default dynamic(() => Promise.resolve(Home), { ssr: false })

export default Home