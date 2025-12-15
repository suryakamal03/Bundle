'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Plus, ListTodo, CheckCircle, AlertTriangle, Activity } from 'lucide-react'
import { mockTasks, mockDevelopers, mockActivityItems, mockRiskAlerts } from '@/lib/mockData'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const taskProgressData = [
  { day: 'Mon', current: 15, projected: 16 },
  { day: 'Tue', current: 18, projected: 19 },
  { day: 'Wed', current: 22, projected: 24 },
  { day: 'Thu', current: 25, projected: 27 },
  { day: 'Fri', current: 27, projected: 29 },
  { day: 'Sat', current: 28, projected: 31 },
  { day: 'Sun', current: 29, projected: 32 },
]

const githubActivityData = [
  { day: 'Mon', commits: 4, prs: 1, issues: 2 },
  { day: 'Tue', commits: 7, prs: 2, issues: 3 },
  { day: 'Wed', commits: 5, prs: 1, issues: 2 },
  { day: 'Thu', commits: 10, prs: 4, issues: 3 },
  { day: 'Fri', commits: 6, prs: 0, issues: 4 },
]

const tasksByAssignee = [
  { name: 'John Doe', count: 9 },
  { name: 'Jane Smith', count: 7 },
  { name: 'Alex Lee', count: 5 },
  { name: 'Unassigned', count: 3 },
]

export default function DashboardPage() {
  const tasksDue = 12
  const tasksCompleted = 3
  const tasksThisWeek = 8
  const risksDetected = 3
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Main Dashboard</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasks Due</p>
                <p className="text-3xl font-bold text-gray-900">{tasksDue}</p>
                <p className="text-xs text-gray-500 mt-1">tasks due today & tomorrow</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ListTodo className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-900">{tasksCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">needing immediate attention</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Risks Detected</p>
                <p className="text-3xl font-bold text-gray-900">{risksDetected}</p>
                <p className="text-xs text-gray-500 mt-1">this week so far</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Progress Overview</h2>
            <p className="text-sm text-gray-600 mb-4">Cumulative trends over the last 7 days</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
            <p className="text-sm text-gray-600 mb-4">Distribution of current tasks</p>
            <div className="flex items-center justify-center h-64">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="75.4 251.2" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="50.3 251.2" strokeDashoffset="-75.4" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-125.7" transform="rotate(-90 50 50)" />
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">On Hold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Archived</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">GitHub Activity Overview</h2>
            <p className="text-sm text-gray-600 mb-4">Daily commits, PRs, and issues this week</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={githubActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="commits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prs" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Assignee</h2>
            <div className="space-y-3">
              {tasksByAssignee.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.name} size="sm" />
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <Badge variant="primary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Risk Alerts</h2>
            <p className="text-sm text-gray-600 mb-4">Critical issues detected by AI</p>
            <div className="space-y-3">
              {mockRiskAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`mt-0.5 ${alert.type === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900">{alert.title.split(':')[1]?.trim() || alert.title}</p>
                      <Badge variant={alert.type === 'critical' ? 'danger' : 'warning'} className="flex-shrink-0">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{alert.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary-500 p-0 h-auto hover:bg-transparent">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {mockActivityItems.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
