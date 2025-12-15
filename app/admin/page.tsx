'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Plus, Search, MoreVertical, Trash2 } from 'lucide-react'
import { mockDevelopers, mockProjects } from '@/lib/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const teamMetrics = [
  { name: 'Alice', tasks: 9 },
  { name: 'Bob', tasks: 7 },
  { name: 'Diana', tasks: 10 },
  { name: 'Eve', tasks: 5 },
]

export default function AdminPanelPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage developers, projects, and access system-wide administrative actions.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Manage Developers</h2>
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Invite New Developer
              </Button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search developers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option>Filter by Role</option>
                <option>Frontend Dev</option>
                <option>Backend Dev</option>
                <option>DevOps Engineer</option>
              </select>
              <Button variant="secondary" size="sm">
                Invite Developer
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Developer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projects</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDevelopers.map((dev) => (
                    <tr key={dev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={dev.name} size="sm" />
                          <span className="text-sm font-medium text-gray-900">{dev.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{dev.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={dev.status === 'Active' ? 'success' : 'danger'}>
                          {dev.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-sm text-gray-600 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {dev.status === 'Inactive' && (
                            <Button variant="danger" size="sm">
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Configuration</h2>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option>Filter by Status</option>
                <option>Active</option>
                <option>On Hold</option>
                <option>Archived</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        {project.lead && (
                          <div className="flex items-center gap-2">
                            <Avatar name={project.lead.name} size="sm" />
                            <span className="text-sm text-gray-900">{project.lead.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={project.status === 'Active' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                          {project.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Workload Metrics</h2>
            <p className="text-sm text-gray-600 mb-4">Tasks Assigned by Developer</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">View Audit Log</p>
                  <p className="text-sm text-gray-600">Review system activity and changes</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Manage Integrations</p>
                  <p className="text-sm text-gray-600">Configure third-party services</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Backup Database Now</p>
                  <p className="text-sm text-gray-600">Create a manual backup snapshot</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
        
        <div className="flex items-center justify-center text-sm text-gray-600">
          © 2025 Ontrackr. All rights reserved.
        </div>
      </div>
    </DashboardLayout>
  )
}
