import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  StopIcon,
  PaperAirplaneIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useClerkAuth } from '../contexts/ClerkAuthContext'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const AIAssistant = () => {
  const { user, userRole, hasPermission, getApiToken } = useClerkAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your AI pharmacy assistant powered by Google Gemini. I can help you with inventory management, drug information, sales analytics, and more. What would you like to know?`,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [capabilities, setCapabilities] = useState({})
  const messagesEndRef = useRef(null)

  // Enhanced quick questions based on user role and capabilities
  const getQuickQuestions = () => {
    const baseQuestions = [
      {
        icon: MagnifyingGlassIcon,
        text: "What is the dosage for Paracetamol in children?",
        category: "Drug Info",
        capability: "drug_information"
      },
      {
        icon: LightBulbIcon,
        text: "Give me general pharmacy advice",
        category: "General",
        capability: "general_chat"
      }
    ]

    const roleSpecificQuestions = []

    if (capabilities.inventory_analysis) {
      roleSpecificQuestions.push({
        icon: ClipboardDocumentListIcon,
        text: "Analyze my current inventory levels",
        category: "Inventory",
        capability: "inventory_analysis"
      })
    }

    if (capabilities.sales_analysis) {
      roleSpecificQuestions.push({
        icon: ChartBarIcon,
        text: "Show me sales insights for this month",
        category: "Sales",
        capability: "sales_analysis"
      })
    }

    if (capabilities.workflow_optimization) {
      roleSpecificQuestions.push({
        icon: CogIcon,
        text: "How can I optimize my pharmacy workflow?",
        category: "Operations",
        capability: "workflow_optimization"
      })
    }

    if (capabilities.prescription_guidance) {
      roleSpecificQuestions.push({
        icon: ExclamationTriangleIcon,
        text: "Check drug interactions for Warfarin",
        category: "Clinical",
        capability: "drug_information"
      })
    }

    return [...baseQuestions, ...roleSpecificQuestions].slice(0, 6)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load AI capabilities on component mount
  useEffect(() => {
    loadCapabilities()
  }, [])

  const loadCapabilities = async () => {
    try {
      const token = await getApiToken()
      const response = await fetch('/api/ai/capabilities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCapabilities(data.capabilities || {})
      }
    } catch (error) {
      console.error('Failed to load AI capabilities:', error)
    }
  }

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const token = await getApiToken()
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: messageText,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          usage: data.usage
        }

        setMessages(prev => [...prev, aiMessage])
        
        // Text-to-speech for short responses
        if (data.response.length < 300) {
          speakText(data.response)
        }
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecializedQuery = async (type, data) => {
    setIsLoading(true)
    
    try {
      const token = await getApiToken()
      let endpoint = '/api/ai/chat'
      let body = { query: '', conversationHistory: [] }

      switch (type) {
        case 'inventory':
          endpoint = '/api/ai/analyze-inventory'
          body = { inventoryData: data }
          break
        case 'drug-info':
          endpoint = '/api/ai/drug-info'
          body = { drugName: data.drugName, query: data.query }
          break
        case 'sales':
          endpoint = '/api/ai/analyze-sales'
          body = { salesData: data.salesData, timeframe: data.timeframe }
          break
        case 'workflow':
          endpoint = '/api/ai/optimize-workflow'
          body = { currentWorkflow: data.workflow, challenges: data.challenges }
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (result.success) {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: result.analysis || result.drugInfo || result.recommendations || result.response,
          timestamp: new Date(),
          category: type,
          usage: result.usage
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Specialized query error:', error)
      toast.error(`Failed to process ${type} request`)
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = async (text) => {
    setIsSpeaking(true)
    
    try {
      // Use browser's speech synthesis (can be replaced with ElevenLabs)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Speech synthesis error:', error)
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => {
        setIsListening(false)
        toast.error('Voice recognition error')
      }
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleSendMessage(transcript)
      }
      
      recognition.start()
    } else {
      toast.error('Speech recognition is not supported in your browser')
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const quickQuestions = getQuickQuestions()

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="w-6 h-6" />
              <h1 className="text-2xl font-bold">AI Pharmacy Assistant</h1>
            </div>
            <p className="text-blue-100">Powered by Google Gemini • Role: {userRole?.replace('_', ' ')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isListening ? () => setIsListening(false) : startListening}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isSpeaking ? stopSpeaking : () => {}}
              className={`p-3 rounded-xl transition-all ${
                isSpeaking 
                  ? 'bg-red-500' 
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              {isSpeaking ? (
                <StopIcon className="w-6 h-6" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg"
          >
            <p className="text-sm">🎤 Listening... Speak your question now</p>
          </motion.div>
        )}
      </div>

      {/* Capabilities Badge */}
      {Object.keys(capabilities).length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available capabilities:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(capabilities).filter(([_, enabled]) => enabled).map(([capability, _]) => (
              <span 
                key={capability}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {capability.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quickQuestions.map((question, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSendMessage(question.text)}
            disabled={!capabilities[question.capability]}
            className={`p-4 rounded-xl border text-left transition-all ${
              capabilities[question.capability]
                ? 'border-gray-200 hover:shadow-md bg-white'
                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <question.icon className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">{question.category}</p>
            <p className="text-xs text-gray-600">{question.text}</p>
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.isError
                      ? 'bg-red-100 text-red-900 border border-red-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.usage && (
                      <div className="text-xs opacity-70 mt-2">
                        Tokens: {message.usage.promptTokens + message.usage.completionTokens}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center mt-1 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.category && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                        {message.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3 order-1 flex-shrink-0">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-3">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <LoadingSpinner size="small" text="Thinking..." />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about your pharmacy..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startListening}
              className={`p-3 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!inputText.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant