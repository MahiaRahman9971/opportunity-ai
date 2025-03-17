'use client'

import React, { useState } from 'react'
import { FaCheckCircle, FaCircle, FaExternalLinkAlt } from 'react-icons/fa'
import { MdDownload, MdEmail, MdPrint, MdInfo } from 'react-icons/md'

interface SavedChoices {
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
}

interface NextStepsProps {
  selectedAction: 'stay' | 'move' | null;
  savedChoices: SavedChoices | null;
}

interface Task {
  id: string;
  text: string;
  details: string;
  explanation: string; // Why this task is important
  link?: {
    url: string;
    label: string;
  };
}

const NextSteps: React.FC<NextStepsProps> = ({ selectedAction, savedChoices }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [expandedTasks, setExpandedTasks] = useState<string[]>([])
  
  // Toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId))
    } else {
      setCompletedTasks(prev => [...prev, taskId])
    }
  }

  // Toggle explanation visibility
  const toggleExplanation = (taskId: string) => {
    if (expandedTasks.includes(taskId)) {
      setExpandedTasks(prev => prev.filter(id => id !== taskId))
    } else {
      setExpandedTasks(prev => [...prev, taskId])
    }
  }

  // Generate tasks based on the selected action and saved choices
  const generateTasks = (): Task[] => {
    if (!selectedAction || !savedChoices) return []

    const commonTasks: Task[] = [
      {
        id: 'review_choices',
        text: `Review my selected choices for ${savedChoices.town}`,
        details: 'Take time to reflect on these choices and discuss with your family',
        explanation: 'Involving your whole family in the decision-making process ensures everyone feels heard and increases the likelihood of a successful transition. This is especially important for children who may feel anxious about changes.'
      },
      {
        id: 'create_calendar',
        text: 'Create a calendar with important dates and deadlines',
        details: 'Set reminders for application deadlines, school visits, and community program registrations',
        explanation: 'Opportunity windows often have specific timelines. Creating a calendar helps you stay organized and ensures you don\'t miss important deadlines for school applications, program registrations, or housing opportunities.'
      }
    ]

    if (selectedAction === 'stay') {
      return [
        {
          id: 'township_website',
          text: `Visit the ${savedChoices.town} township website`,
          details: 'Explore resources, community events, and local initiatives',
          explanation: 'Township websites often contain valuable information about local programs, initiatives, and resources that aren\'t advertised elsewhere. Many offer newsletters you can subscribe to for regular updates.',
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.town + ' township official website')}`,
            label: 'Search for Township Website'
          }
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? `Contact ${savedChoices.selectedSchool} about transfer options` 
            : 'Research school transfer options in your area',
          details: 'Prepare questions about curriculum, extracurricular activities, and the transfer process',
          explanation: 'School quality is one of the biggest factors in a child\'s future opportunities. Even within the same district, different schools may offer vastly different resources and programs.',
          link: savedChoices.selectedSchool ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedSchool + ' ' + savedChoices.town)}`,
            label: 'Search for School Information'
          } : undefined
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Research enrollment details for ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Explore community programs in your area',
          details: 'Look for registration dates, costs, and program schedules',
          explanation: 'Community programs provide additional support, enrichment, and opportunities that supplement what schools offer. These programs can help develop skills, confidence, and social connections that improve future outcomes.',
          link: savedChoices.selectedCommunityPrograms.length > 0 ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedCommunityPrograms[0] + ' ' + savedChoices.town)}`,
            label: 'Search for Program Information'
          } : undefined
        },
        {
          id: 'community_visit',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Schedule visits to ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Visit local community centers',
          details: 'Meet program coordinators and see facilities in person',
          explanation: 'In-person visits give you a much better sense of the environment and quality of programs than websites or brochures can provide. They also demonstrate your interest, which can be helpful for competitive programs.'
        },
        {
          id: 'parent_network',
          text: 'Connect with other parents in your community',
          details: 'Join local parent groups, school PTAs, or neighborhood associations',
          explanation: 'Parent networks are invaluable sources of information, support, and advocacy. Other parents can share insider knowledge about schools, programs, and resources that may not be widely advertised.',
          link: {
            url: `https://www.facebook.com/search/groups/?q=${encodeURIComponent('parents ' + savedChoices.town)}`,
            label: 'Find Local Parent Groups'
          }
        },
        {
          id: 'advocate',
          text: 'Identify ways to advocate for better opportunities',
          details: 'Attend town meetings, connect with local representatives, or join advocacy groups',
          explanation: 'Community advocacy has been shown to improve local services and opportunities. When parents organize and advocate together, they can create significant positive changes in schools and community resources.',
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent('city council meetings ' + savedChoices.town)}`,
            label: 'Find Local Government Meetings'
          }
        },
        ...commonTasks
      ]
    } else if (selectedAction === 'move') {
      return [
        {
          id: 'housing_research',
          text: savedChoices.selectedHousingType 
            ? `Research ${savedChoices.selectedHousingType} options in ${savedChoices.town}`
            : `Research housing options in ${savedChoices.town}`,
          details: 'Compare costs, neighborhoods, and proximity to schools and amenities',
          explanation: 'Housing location significantly impacts access to quality schools, safe environments, and community resources. Research shows that moving to a high-opportunity neighborhood can improve children\'s lifetime outcomes.',
          link: {
            url: `https://www.zillow.com/homes/${encodeURIComponent(savedChoices.town)}_rb/`,
            label: 'View Housing Options'
          }
        },
        {
          id: 'neighborhood_visit',
          text: savedChoices.selectedNeighborhood 
            ? `Schedule a visit to ${savedChoices.selectedNeighborhood} in ${savedChoices.town}`
            : `Schedule a visit to ${savedChoices.town}`,
          details: 'Explore the neighborhood, visit schools, and get a feel for the community',
          explanation: 'Visiting in person helps you assess factors that don\'t show up in statistics: community feel, safety, noise levels, and whether the neighborhood is a good fit for your family\'s lifestyle and needs.',
          link: savedChoices.selectedNeighborhood ? {
            url: `https://www.google.com/maps/search/${encodeURIComponent(savedChoices.selectedNeighborhood + ' ' + savedChoices.town)}`,
            label: 'View Neighborhood Map'
          } : undefined
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? `Contact ${savedChoices.selectedSchool} about enrollment` 
            : 'Research school enrollment procedures',
          details: 'Gather information about enrollment requirements, deadlines, and documentation needed',
          explanation: 'Schools may have specific enrollment windows, documentation requirements, or waitlists. Contacting them early gives you time to prepare and increases your chances of securing a spot.',
          link: savedChoices.selectedSchool ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedSchool + ' ' + savedChoices.town + ' enrollment')}`,
            label: 'Search for School Enrollment Info'
          } : undefined
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Research registration for ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Explore community programs in the new area',
          details: 'Look for registration dates, costs, and program schedules',
          explanation: 'Community programs provide additional support and enrichment beyond school. They help children build skills, make friends, and develop a sense of belonging in their new community.',
          link: savedChoices.selectedCommunityPrograms.length > 0 ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedCommunityPrograms[0] + ' ' + savedChoices.town)}`,
            label: 'Search for Program Information'
          } : undefined
        },
        {
          id: 'moving_plans',
          text: 'Create a detailed moving plan and timeline',
          details: 'Include housing search, school transfers, and community program registrations',
          explanation: 'Moving involves many steps that need to be coordinated. A detailed plan helps ensure nothing falls through the cracks during this complex transition.',
          link: {
            url: 'https://www.moving.com/tips/creating-a-moving-timeline-checklist/',
            label: 'Moving Timeline Guide'
          }
        },
        {
          id: 'budget',
          text: 'Develop a budget for the move',
          details: 'Consider housing costs, moving expenses, and potential changes in cost of living',
          explanation: 'Moving often involves significant costs beyond just housing. Planning for these expenses helps prevent financial stress that could undermine the benefits of relocating.',
          link: {
            url: 'https://www.bankrate.com/calculators/savings/moving-cost-of-living-calculator.aspx',
            label: 'Cost of Living Calculator'
          }
        },
        {
          id: 'local_resources',
          text: 'Identify local resources for new families',
          details: 'Find welcome centers, family support services, and newcomer programs',
          explanation: 'Many communities have resources specifically designed to help new families integrate and thrive. These can ease the transition and help you quickly build connections in your new community.',
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent('family resources newcomers ' + savedChoices.town)}`,
            label: 'Search for Family Resources'
          }
        },
        {
          id: 'housing_arrangement',
          text: savedChoices.selectedHousingType 
            ? `Contact real estate agents about ${savedChoices.selectedHousingType} options`
            : 'Contact real estate agents about housing options',
          details: 'Prepare questions about availability, pricing, and financing options',
          explanation: 'Local real estate agents have valuable insights about neighborhoods, school districts, and housing trends that may not be obvious online. They can also help you navigate the local market more effectively.',
          link: {
            url: `https://www.realtor.com/realestateagents/${encodeURIComponent(savedChoices.town)}`,
            label: 'Find Real Estate Agents'
          }
        },
        ...commonTasks
      ]
    }
    
    return []
  }

  const tasks = generateTasks()
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  if (!selectedAction || !savedChoices) {
    return (
      <div id="next-steps" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Next Steps</h1>
          <p className="text-xl">Complete the previous sections to see your personalized action plan</p>
        </div>
      </div>
    )
  }

  return (
    <div id="next-steps" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Next Steps</h1>
        <p className="text-xl">
          {selectedAction === 'stay' 
            ? `A personalized to-do list to improve opportunities in ${savedChoices.town}`
            : `A personalized to-do list for your move to ${savedChoices.town}`
          }
        </p>
      </div>
      
      {/* Display all saved choices */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
        <h3 className="text-2xl font-semibold mb-4">Your Saved Choices</h3>
        <div className="space-y-2">
          <p><strong>Town:</strong> {savedChoices.town}</p>
          {selectedAction === 'move' && savedChoices.selectedNeighborhood && (
            <p><strong>Selected Neighborhood:</strong> {savedChoices.selectedNeighborhood}</p>
          )}
          <p><strong>Selected School:</strong> {savedChoices.selectedSchool}</p>
          <p>
            <strong>Selected Community Programs:</strong>{' '}
            {savedChoices.selectedCommunityPrograms.join(', ')}
          </p>
          {selectedAction === 'move' && savedChoices.selectedHousingType && (
            <p><strong>Housing Type:</strong> {savedChoices.selectedHousingType}</p>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold mb-4 md:mb-0">Your Progress</h2>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">
              <MdPrint className="mr-2" />
              Print
            </button>
            <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">
              <MdEmail className="mr-2" />
              Email
            </button>
            <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">
              <MdDownload className="mr-2" />
              Download
            </button>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-5 mb-2">
          <div 
            className="bg-primary h-5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-600">
          {completedTasks.length} of {tasks.length} tasks completed ({progress}%)
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">Your To-Do List</h2>
        
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start">
                <div 
                  className="mt-1 text-primary cursor-pointer"
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {completedTasks.includes(task.id) 
                    ? <FaCheckCircle size={20} /> 
                    : <FaCircle size={20} className="text-gray-300 hover:text-primary-light" />
                  }
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-lg font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-500' : ''}`}>
                        {task.text}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {task.details}
                      </p>
                    </div>
                    <button 
                      onClick={() => toggleExplanation(task.id)}
                      className="flex-shrink-0 p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded-full transition-colors"
                      aria-label={expandedTasks.includes(task.id) ? "Hide explanation" : "Show explanation"}
                    >
                      <MdInfo size={20} />
                    </button>
                  </div>
                  
                  {/* Task link */}
                  {task.link && (
                    <div className="mt-3">
                      <a 
                        href={task.link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        {task.link.label} <FaExternalLinkAlt size={12} className="ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {/* Task explanation */}
                  {expandedTasks.includes(task.id) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Why this matters:</h4>
                      <p className="text-sm text-gray-700">{task.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NextSteps