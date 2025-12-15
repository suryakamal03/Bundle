'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { mockDevelopers } from '@/lib/mockData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProjectTeam() {
  const teamMembers = mockDevelopers.slice(0, 4).map((dev, index) => ({
    ...dev,
    tasks: [9, 7, 5, 6][index],
    completed: [6, 5, 3, 4][index],
  }))

  const workloadData = teamMembers.map(member => ({
    name: member.name.split(' ')[0],
    tasks: member.tasks,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors">
              <Avatar name={member.name} size="lg" status />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{member.tasks} tasks</p>
                <p className="text-xs text-gray-500">{member.completed} completed</p>
              </div>
              <Badge variant={member.status === 'Active' ? 'success' : 'danger'}>
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workload Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
