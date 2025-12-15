'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Workflow } from 'lucide-react'

export default function ProjectDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
        
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ontrackr Core Development</h2>
            <p className="text-sm text-gray-600 mb-4">
              Develop and refine the core features of the Ontrackr SaaS platform, focusing on task management, GitHub integration, and AI-powered risk assessment for optimal team productivity.
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="warning">Project Health: Warning</Badge>
              <Button variant="ghost" size="sm" className="gap-2">
                <Workflow className="w-4 h-4" />
                View Flowchart
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: '75%' }}></div>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GitHub Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Refactored user authentication module for improved security.</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Merged PR #123: Implemented responsive sidebar layout.</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Opened Check #45: Bug in task filtering logic.</p>
                  <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Added AI chatbot integration for task assignment.</p>
                  <p className="text-xs text-gray-500 mt-1">4 days ago</p>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="w-full mt-4 text-primary-500">
              View all GitHub activity
            </Button>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Tasks</h3>
            
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button className="px-3 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500">
                To Do (2)
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                In Progress (2)
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Completed (2)
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Implement AI chatbot integration</h4>
                    <div className="flex items-center gap-2">
                      <Avatar name="Alice Smith" size="sm" />
                      <span className="text-xs text-gray-600">Alice Smith</span>
                    </div>
                  </div>
                  <Badge variant="danger">High</Badge>
                </div>
                <p className="text-xs text-gray-500">Due: 2024-08-15</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Develop GitHub API integration for monitoring</h4>
                    <div className="flex items-center gap-2">
                      <Avatar name="Bob White" size="sm" />
                      <span className="text-xs text-gray-600">Bob White</span>
                    </div>
                  </div>
                  <Badge variant="danger">High</Badge>
                </div>
                <p className="text-xs text-gray-500">Due: 2024-08-10</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Refactor task list component</h4>
                    <div className="flex items-center gap-2">
                      <Avatar name="Frank Johnson" size="sm" />
                      <span className="text-xs text-gray-600">Frank Johnson</span>
                    </div>
                  </div>
                  <Badge variant="warning">Medium</Badge>
                </div>
                <p className="text-xs text-gray-500">Due: 2024-08-20</p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Design responsive layout for project dashboard</h4>
                    <div className="flex items-center gap-2">
                      <Avatar name="Diana Green" size="sm" />
                      <span className="text-xs text-gray-600">Diana Green</span>
                    </div>
                  </div>
                  <Badge variant="warning">Medium</Badge>
                </div>
                <p className="text-xs text-gray-500">Due: 2024-08-12</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
