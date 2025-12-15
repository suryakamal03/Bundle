'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Settings } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const commitActivity = [
  { date: 'Jun 27', commits: 4 },
  { date: 'Jun 29', commits: 7 },
  { date: 'Jul 01', commits: 5 },
  { date: 'Aug 02', commits: 10 },
  { date: 'Aug 04', commits: 6 },
  { date: 'Aug 06', commits: 13 },
  { date: 'Aug 08', commits: 8 },
]

const weeklyPerformance = [
  { week: 'Week 28', value: 45 },
  { week: 'Week 29', value: 52 },
  { week: 'Week 30', value: 67 },
  { week: 'Week 31', value: 78 },
]

const skills = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker', 'AWS', 'UI/UX', 'Frontend Development', 'System Design', 'Mentorship', 'Code Review']
const workTypes = ['Frontend Development', 'System Design', 'Mentorship', 'Code Review']

const tasks = [
  { id: '1', title: 'Implement user profile editing feature', dueDate: '2024-08-15', priority: 'High', status: 'In Progress' },
  { id: '2', title: 'Refactor authentication module to use JWT', dueDate: '2024-08-20', priority: 'High', status: 'Pending' },
  { id: '3', title: 'Review PR for dashboard UI improvements', dueDate: '2024-08-10', priority: 'Medium', status: 'Pending' },
  { id: '4', title: 'Fix bug with project sorting on main dashboard', dueDate: '2024-08-05', priority: 'Low', status: 'Completed' },
]

const emailReminders = [
  { id: '1', message: 'Your task "Implement user profile editing" is due in 7 days.', date: '2024-08 09:30 AM' },
  { id: '2', message: 'Weekly performance summary for Week 30 is available.', date: '2024-08 10:30 AM' },
  { id: '3', message: 'Meeting reminder: Project Sync at 2:00 PM today.', date: '2024-08 08:00 AM' },
]

export default function DeveloperProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Developer Profile</h1>
            <Button variant="secondary" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
          
          <div className="relative h-32 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg mb-16">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <Avatar name="Jane Doe" size="xl" className="w-24 h-24 border-4 border-white" />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">Jane Doe</h2>
            <p className="text-gray-600">Senior Full Stack Developer</p>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="primary">{skill}</Badge>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">jane.doe@ontrackr.com</p>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Work Types</h3>
            <div className="flex flex-wrap gap-2">
              {workTypes.map((type) => (
                <Badge key={type} variant="success">{type}</Badge>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub</h3>
              <a href="#" className="text-primary-500 hover:text-primary-600">→ janedoe-dev</a>
            </div>
          </Card>
        </div>
        
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Tasks</h3>
            <Button variant="ghost" size="sm" className="text-primary-500">
              View All Tasks →
            </Button>
          </div>
          
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <input type="checkbox" className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}>
                    {task.priority}
                  </Badge>
                  <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'purple'}>
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GitHub Commit Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commitActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="commits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyPerformance}>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Reminder History</h3>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Manage Reminders
            </Button>
          </div>
          
          <div className="space-y-3">
            {emailReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{reminder.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{reminder.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
