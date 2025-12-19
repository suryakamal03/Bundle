'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { ListTodo, Users, AlertTriangle, FolderGit2 } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { projectService } from '@/backend/projects/projectService'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function GlobalStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalMembers: 0,
    totalTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        const projects = await projectService.getUserProjects(user.uid)
        const activeProjects = projects.filter(p => p.status === 'Active')

        const allMembers = new Set<string>()
        projects.forEach(project => {
          project.members.forEach(memberId => allMembers.add(memberId))
        })

        let totalTasks = 0
        for (const project of projects) {
          const tasksRef = collection(db, 'tasks')
          const q = query(tasksRef, where('projectId', '==', project.id))
          const taskSnapshot = await getDocs(q)
          totalTasks += taskSnapshot.size
        }

        setStats({
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          totalMembers: allMembers.size,
          totalTasks
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  const statsDisplay = [
    {
      label: 'Total Projects',
      value: loading ? '...' : stats.totalProjects.toString(),
      change: `${stats.activeProjects} active`,
      icon: FolderGit2,
      color: 'blue',
    },
    {
      label: 'Total Tasks',
      value: loading ? '...' : stats.totalTasks.toString(),
      change: 'Across all projects',
      icon: ListTodo,
      color: 'green',
    },
    {
      label: 'Team Members',
      value: loading ? '...' : stats.totalMembers.toString(),
      change: 'Collaborating',
      icon: Users,
      color: 'purple',
    },
    {
      label: 'GitHub Events',
      value: '0',
      change: 'Webhook active',
      icon: AlertTriangle,
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsDisplay.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
