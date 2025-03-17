'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Interface for the saved message in localStorage (timestamps are stored as strings)
interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  
  // Show popup after a delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 3000) // Show popup after 3 seconds
    
    return () => clearTimeout(timer)
  }, [])
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load messages from localStorage
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chat-messages')
      if (savedMessages) {
        try {
          // Parse the saved messages and convert string timestamps back to Date objects
          const parsedMessages = JSON.parse(savedMessages) as StoredMessage[];
          return parsedMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant', // Ensure the role is properly typed
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (e) {
          console.error('Failed to parse saved messages', e)
        }
      }
    }
    // Default initial message
    return [
      {
        role: 'assistant' as const,
        content: 'Hi there! 👋 How can I help you with your family\'s opportunities today?',
        timestamp: new Date()
      }
    ]
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to the bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-messages', JSON.stringify(messages))
    }
  }, [messages])
  
  // Focus the input when the chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(prev => !prev)
    setShowPopup(false) // Hide popup when chat is toggled
  }
  
  // Clear chat history
  const clearChatHistory = () => {
    const initialMessage: Message = {
      role: 'assistant',
      content: 'Hi there! 👋 How can I help you with your family\'s opportunities today?',
      timestamp: new Date()
    }
    setMessages([initialMessage])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!inputMessage.trim()) return

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Prepare message history (excluding the welcome message)
      const messageHistory = messages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          history: messageHistory
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp to show time only (e.g., "2:30 PM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button with Popup */}
      <div className="relative">
        {/* Popup */}
        {showPopup && !isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-md px-4 py-3 mb-2 animate-fadeIn">
            <div className="relative">
              {/* Close button for popup */}
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-300"
                aria-label="Close popup"
              >
                <FaTimes size={12} />
              </button>
              
              <p className="text-gray-800 font-medium whitespace-nowrap">Chat with me! 👋</p>
              <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-white border-r-8 border-r-transparent"></div>
            </div>
          </div>
        )}
        
        {/* Chat Button */}
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg flex items-center justify-center"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <FaTimes size={20} /> : <FaComments size={20} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Opportunity AI Assistant</h3>
            <div className="flex space-x-2">
              <button
                onClick={clearChatHistory}
                className="text-white hover:text-gray-200 text-xs"
                aria-label="Clear chat"
              >
                Clear
              </button>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.role === 'assistant' ? 'pr-12' : 'pl-12'}`}
              >
                <div 
                  className={`p-3 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-gray-100 rounded-bl-none' 
                      : 'bg-primary text-white rounded-br-none ml-auto'
                  }`}
                >
                  {message.content}
                </div>
                <div 
                  className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'assistant' ? '' : 'text-right'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-4 pr-12">
                <div className="p-3 bg-gray-100 rounded-lg rounded-bl-none inline-block">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 flex items-end">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={!inputMessage.trim() || isLoading}
              className={`ml-2 p-2 rounded-full ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              aria-label="Send message"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget