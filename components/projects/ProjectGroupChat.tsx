'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/backend/auth/authContext'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Loading from '@/components/ui/Loading'

interface ChatMessage {
  id: string
  projectId: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  time24h: string
}

interface ProjectGroupChatProps {
  projectId: string
}

export default function ProjectGroupChat({ projectId }: ProjectGroupChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket.IO connection and event handlers
  useEffect(() => {
    if (!user) return

    const socket = getSocket()
    socketRef.current = socket

    // Join as user
    socket.emit('user:join', {
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous'
    })

    // Join project room
    socket.emit('project:join', {
      projectId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous'
    })

    // Listen for connection status
    const handleConnect = () => {
      setIsConnected(true)
      console.log('📱 Connected to chat server')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      console.log('📱 Disconnected from chat server')
    }

    // Listen for message history
    const handleMessagesHistory = (history: ChatMessage[]) => {
      console.log('📜 Received message history:', history.length)
      setMessages(history)
    }

    // Listen for new messages
    const handleMessageReceived = (message: ChatMessage) => {
      console.log('💬 New message received:', message)
      setMessages(prev => [...prev, message])
    }

    // Listen for errors
    const handleError = (error: { message: string }) => {
      console.error('❌ Chat error:', error.message)
      alert(`Chat error: ${error.message}`)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('messages:history', handleMessagesHistory)
    socket.on('message:received', handleMessageReceived)
    socket.on('error', handleError)

    // Set initial connection status
    setIsConnected(socket.connected)

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('messages:history', handleMessagesHistory)
      socket.off('message:received', handleMessageReceived)
      socket.off('error', handleError)

      socket.emit('project:leave', {
        projectId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous'
      })
    }
  }, [user, projectId])

  const handleSendMessage = () => {
    if (!messageText.trim() || !user || !socketRef.current || isSending) return

    setIsSending(true)

    const message = {
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous',
      text: messageText.trim()
    }

    socketRef.current.emit('message:send', {
      projectId,
      message
    })

    setMessageText('')
    setIsSending(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  const formatTime = (timestamp: string, time24h?: string) => {
    if (time24h) return time24h
    
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const isOwnMessage = (senderId: string) => {
    return user && senderId === user.uid
  }

  if (!user) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Please log in to access the chat
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#26262a]">
        <div>
          <h3 className="font-semibold text-[#eaeaea]">Project Group Chat</h3>
          <p className="text-xs text-[#9a9a9a]">Team collaboration</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f0f10]">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9a9a9a] text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = isOwnMessage(message.senderId)
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isOwn && (
                    <Avatar 
                      name={message.senderName} 
                      size="sm" 
                      className="flex-shrink-0"
                    />
                  )}
                  
                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Sender Name (only for received messages) */}
                    {!isOwn && (
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    
                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                    
                    {/* Timestamp */}
                    <p className={`text-xs mt-1 ${
                      isOwn 
                        ? 'text-primary-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.timestamp, message.time24h)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            disabled={!isConnected || isSending}
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !isConnected || isSending}
            className="p-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            {isSending ? (
              <Loading size={20} />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  )
}
