'use client'

import React, { useState } from 'react'
import { FaCheckCircle, FaCircle } from 'react-icons/fa'
import { MdDownload, MdEmail, MdPrint } from 'react-icons/md'

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

const NextSteps: React.FC<NextStepsProps> = ({ selectedAction, savedChoices }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  
  // Toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId))
    } else {
      setCompletedTasks(prev => [...prev, taskId])
    }
  }

  // Generate tasks based on the selected action and saved choices
  const generateTasks = () => {
    if (!selectedAction || !savedChoices) return []

    const commonTasks = [
      {
        id: 'review_choices',
        text: `Review my selected choices for ${savedChoices.town}`,
        details: 'Take time to reflect on these choices and discuss with your family'
      },
      {
        id: 'create_calendar',
        text: 'Create a calendar with important dates and deadlines',
        details: 'Set reminders for application deadlines, school visits, and community program registrations'
      }
    ]

    if (selectedAction === 'stay') {
      return [
        {
          id: 'township_website',
          text: `Visit the ${savedChoices.town} township website`,
          details: 'Explore resources, community events, and local initiatives'
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? `Contact ${savedChoices.selectedSchool} about transfer options` 
            : 'Research school transfer options in your area',
          details: 'Prepare questions about curriculum, extracurricular activities, and the transfer process'
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Research enrollment details for ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Explore community programs in your area',
          details: 'Look for registration dates, costs, and program schedules'
        },
        {
          id: 'community_visit',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Schedule visits to ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Visit local community centers',
          details: 'Meet program coordinators and see facilities in person'
        },
        {
          id: 'parent_network',
          text: 'Connect with other parents in your community',
          details: 'Join local parent groups, school PTAs, or neighborhood associations'
        },
        {
          id: 'advocate',
          text: 'Identify ways to advocate for better opportunities',
          details: 'Attend town meetings, connect with local representatives, or join advocacy groups'
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
          details: 'Compare costs, neighborhoods, and proximity to schools and amenities'
        },
        {
          id: 'neighborhood_visit',
          text: savedChoices.selectedNeighborhood 
            ? `Schedule a visit to ${savedChoices.selectedNeighborhood} in ${savedChoices.town}`
            : `Schedule a visit to ${savedChoices.town}`,
          details: 'Explore the neighborhood, visit schools, and get a feel for the community'
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? `Contact ${savedChoices.selectedSchool} about enrollment` 
            : 'Research school enrollment procedures',
          details: 'Gather information about enrollment requirements, deadlines, and documentation needed'
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? `Research registration for ${savedChoices.selectedCommunityPrograms.join(', ')}`
            : 'Explore community programs in the new area',
          details: 'Look for registration dates, costs, and program schedules'
        },
        {
          id: 'moving_plans',
          text: 'Create a detailed moving plan and timeline',
          details: 'Include housing search, school transfers, and community program registrations'
        },
        {
          id: 'budget',
          text: 'Develop a budget for the move',
          details: 'Consider housing costs, moving expenses, and potential changes in cost of living'
        },
        {
          id: 'local_resources',
          text: 'Identify local resources for new families',
          details: 'Find welcome centers, family support services, and newcomer programs'
        },
        {
          id: 'housing_arrangement',
          text: savedChoices.selectedHousingType 
            ? `Contact real estate agents about ${savedChoices.selectedHousingType} options`
            : 'Contact real estate agents about housing options',
          details: 'Prepare questions about availability, pricing, and financing options'
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
      <section id="next-steps" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Next Steps</h1>
          <p className="text-xl">Complete the previous sections to see your personalized action plan</p>
        </div>
      </section>
    )
  }

  return (
    <section id="next-steps" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
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
              <div 
                className="flex items-start cursor-pointer group"
                onClick={() => toggleTaskCompletion(task.id)}
              >
                <div className="mt-1 text-primary">
                  {completedTasks.includes(task.id) 
                    ? <FaCheckCircle size={20} /> 
                    : <FaCircle size={20} className="text-gray-300 group-hover:text-primary-light" />
                  }
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-lg font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-500' : ''}`}>
                    {task.text}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {task.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NextSteps