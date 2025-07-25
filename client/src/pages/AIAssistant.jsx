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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI pharmacy assistant. I can help you with inventory queries, product information, sales data, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickQuestions = [
    {
      icon: ClipboardDocumentListIcon,
      text: "Show me low stock items",
      category: "Inventory"
    },
    {
      icon: MagnifyingGlassIcon,
      text: "What are today's top selling products?",
      category: "Sales"
    },
    {
      icon: ExclamationTriangleIcon,
      text: "Which products are expiring soon?",
      category: "Alerts"
    },
    {
      icon: LightBulbIcon,
      text: "Give me sales recommendations",
      category: "Analytics"
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      // Simulate AI response - replace with actual Gemini API call
      const response = await simulateAIResponse(messageText)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Text-to-speech using ElevenLabs API (placeholder)
      if (response.length < 200) { // Only speak short responses
        speakText(response)
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('low stock') || lowerQuery.includes('inventory')) {
      return `Based on your current inventory, here are the low stock items:

• Paracetamol 500mg - 5 units remaining
• Amoxicillin 250mg - 8 units remaining  
• Vitamin C tablets - 12 units remaining
• Ibuprofen 400mg - 7 units remaining

I recommend reordering these items soon. Would you like me to generate purchase orders for these products?`
    }
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('selling')) {
      return `Today's top selling products:

1. Paracetamol 500mg - 45 units (KSh 4,500)
2. Amoxicillin 250mg - 38 units (KSh 7,600)
3. Ibuprofen 400mg - 32 units (KSh 3,200)
4. Vitamin C - 28 units (KSh 2,800)

Total sales today: KSh 24,500 (+12% vs yesterday). The prescription medications are performing particularly well.`
    }
    
    if (lowerQuery.includes('expir')) {
      return `Products expiring in the next 30 days:

⚠️ Urgent (7 days):
• Cough Syrup - Batch CS001 (5 units) - Expires in 3 days
• Antiseptic cream - Batch AC002 (8 units) - Expires in 6 days

📋 Monitor (30 days):
• Multivitamins - Batch MV003 (15 units) - Expires in 18 days
• Eye drops - Batch ED001 (12 units) - Expires in 25 days

Consider running promotions on these items to move them quickly.`
    }
    
    if (lowerQuery.includes('recommend')) {
      return `Based on your sales data and inventory analysis, here are my recommendations:

💰 Revenue Opportunities:
• Promote seasonal items (cold medicine, vitamins)
• Bundle slow-moving items with popular products
• Implement loyalty program for regular customers

📦 Inventory Optimization:
• Increase stock of Paracetamol and Amoxicillin
• Consider reducing orders for slow-moving supplements
• Set up automated reorder alerts for fast-moving items

📈 Sales Strategy:
• Morning rush: Focus on quick OTC medicines
• Afternoon: Promote wellness and supplements
• Evening: Target chronic medication refills`
    }
    
    return `I understand you're asking about "${query}". As your AI pharmacy assistant, I can help you with:

• Inventory management and stock levels
• Sales analytics and trends
• Product information and interactions
• Expiry date tracking
• Customer management
• Financial reports and insights

Could you please be more specific about what you'd like to know?`
  }

  const speakText = async (text) => {
    setIsSpeaking(true)
    
    try {
      // Placeholder for ElevenLabs API integration
      // const response = await fetch('/api/text-to-speech', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text, voice: 'pharmacy-assistant' })
      // })
      
      // For now, use browser's speech synthesis
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
      recognition.onerror = () => setIsListening(false)
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleSendMessage(transcript)
      }
      
      recognition.start()
    } else {
      alert('Speech recognition is not supported in your browser')
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI Pharmacy Assistant</h1>
            <p className="text-blue-100">Ask questions in natural language or use voice commands</p>
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

      {/* Quick Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickQuestions.map((question, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSendMessage(question.text)}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all text-left"
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
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.type === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 order-1 flex-shrink-0">
                    <span className="text-white text-sm font-medium">AI</span>
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
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
              placeholder="Type your question or use voice command..."
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