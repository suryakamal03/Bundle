'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Plus, Eye } from 'lucide-react'
import { mockTasks } from '@/lib/mockData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const performanceData = [
  { week: 'Week 28', value: 45 },
  { week: 'Week 29', value: 55 },
  { week: 'Week 30', value: 60 },
  { week: 'Week 31', value: 75 },
]

const activityLog = [
  { id: '1', time: '5 mins ago', action: 'Committed "feat: add AI integration" to ontrackr/backend', source: 'Github' },
  { id: '2', time: '12 mins ago', action: 'Marked "Refactor authentication module" as in progress', source: 'Task' },
  { id: '3', time: '1 hour ago', action: 'Opened pull request #45 for "UI improvements"', source: 'Github' },
  { id: '4', time: '2 hours ago', action: 'Commented on task "Implement user profile feature"', source: 'Task' },
  { id: '5', time: 'Yesterday', action: 'Pushed <boro> update dependencies</boro> to ontrackr/frontend', source: 'Github' },
]

export default function MyDashboardPage() {
  const myTasks = mockTasks.filter(task => task.assignee?.name === 'Jane Doe' || task.assignee?.name === 'Alice Johnson').slice(0, 4)
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Personal Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Task
            </Button>
            <Button variant="secondary" className="gap-2">
              <Eye className="w-4 h-4" />
              View Projects
            </Button>
            <Button variant="secondary">Open Chat</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
              <Button variant="ghost" size="sm" className="text-primary-500">
                View All Tasks →
              </Button>
            </div>
            
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button className="px-4 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500">
                All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Due Soon
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Completed
              </button>
            </div>
            
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}>
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">Due: {task.deadline}</span>
                    </div>
                  </div>
                  <Badge variant={
                    task.status === 'Completed' ? 'success' :
                    task.status === 'In Progress' ? 'warning' :
                    task.status === 'Pending' ? 'purple' : 'info'
                  }>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Overview</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name="Jane Doe" size="lg" status />
                <div>
                  <p className="font-medium text-gray-900">Jane Doe</p>
                  <p className="text-sm text-gray-600">Senior Frontend</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="font-semibold text-gray-900">10/20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold text-gray-900">5 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Projects Active</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary-500">
                View Full Profile →
              </Button>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Contributions</h3>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Chart data</p>
                  <p className="text-sm text-gray-600">coming</p>
                  <p className="text-sm text-gray-600">soon!</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Rate</h2>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Chart data</p>
                <p className="text-sm text-gray-600">coming</p>
                <p className="text-sm text-gray-600">soon!</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
          <div className="space-y-4">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <div className="w-px h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <Badge variant="info" className="text-xs">{activity.source}</Badge>
                  </div>
                  <p className="text-sm text-gray-900">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
