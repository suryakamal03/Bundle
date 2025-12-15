'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { X, Send, Maximize2, Minimize2 } from 'lucide-react'

interface AIAssistantProps {
  onClose: () => void
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'AI Assistant',
      content: 'Hello! I\'m your AI Project Assistant. I can help you with task assignments, risk analysis, and project insights. How can I assist you today?',
      isBot: true,
      timestamp: '10:00 AM',
    },
  ])

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: message,
      isBot: false,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages([...messages, newMessage])
    setMessage('')

    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'AI Assistant',
        content: 'I\'m analyzing your request. Based on the current project status, I recommend focusing on the high-priority tasks first. Would you like me to create a detailed action plan?',
        isBot: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  return (
    <Card className={`sticky top-6 ${isExpanded ? 'fixed inset-4 z-50' : 'h-[calc(100vh-12rem)]'} flex flex-col`} padding={false}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Project Assistant</h3>
            <p className="text-xs text-gray-500">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            {msg.isBot ? (
              <>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-primary-500 p-3 rounded-r-lg">
                    <p className="text-sm text-gray-900">{msg.content}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex justify-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                    </div>
                    <div className="bg-primary-500 text-white p-3 rounded-lg">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
                <Avatar name="You" size="sm" />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask me anything about this project..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
          />
          <Button onClick={handleSend} className="gap-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </Card>
  )
}
