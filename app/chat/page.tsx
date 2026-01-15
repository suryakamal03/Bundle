'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { Send, Smile, Paperclip, ChevronDown, Plus } from 'lucide-react'
import { mockChannels, mockChatMessages } from '@/lib/mockData'

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <Card className="h-full flex" padding={false}>
          <div className="w-64 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Channels</h3>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  {mockChannels.map((channel) => (
                    <button
                      key={channel.id}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        channel.name === 'general'
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>#</span>
                      <span className="flex-1 text-left">{channel.name}</span>
                      {channel.memberCount && (
                        <span className="text-xs text-gray-400">{channel.memberCount}</span>
                      )}
                    </button>
                  ))}
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Channel</span>
                </button>
              </div>
              
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Direct Messages</h3>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Avatar name="John Doe" size="sm" status />
                    <span>John Doe</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Avatar name="Jane Smith" size="sm" status />
                    <span>Jane Smith</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Avatar name="Robert Johnson" size="sm" />
                    <span>Robert Johnson</span>
                  </button>
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Message</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">#general</h2>
                  <span className="text-sm text-gray-500">3 members</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockChatMessages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar name={message.sender.name} size="md" />
                  <div className="flex-1">
                    {message.isBot ? (
                      <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{message.sender.name}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-primary-500 p-3 rounded-r-lg">
                          <p className="text-sm text-gray-900">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{message.sender.name}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={1}
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex items-center justify-center text-sm text-gray-600 mt-4">
          © 2025 Bundle. All rights reserved.
        </div>
      </div>
    </DashboardLayout>
  )
}
