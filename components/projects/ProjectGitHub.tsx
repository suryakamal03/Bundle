'use client'

import Card from '@/components/ui/Card'
import { GitCommit, GitPullRequest, GitMerge, AlertCircle } from 'lucide-react'

export default function ProjectGitHub() {
  const activities = [
    {
      id: '1',
      type: 'commit',
      message: 'Refactored user authentication module for improved security',
      author: 'Alice Johnson',
      time: '2 hours ago',
      icon: GitCommit,
      color: 'purple',
    },
    {
      id: '2',
      type: 'merge',
      message: 'Merged PR #123: Implemented responsive sidebar layout',
      author: 'Bob Smith',
      time: 'Yesterday',
      icon: GitMerge,
      color: 'green',
    },
    {
      id: '3',
      type: 'pr',
      message: 'Opened PR #124: Add dark mode support',
      author: 'Charlie Brown',
      time: '2 days ago',
      icon: GitPullRequest,
      color: 'blue',
    },
    {
      id: '4',
      type: 'issue',
      message: 'Opened issue #45: Bug in task filtering logic',
      author: 'Diana Prince',
      time: '3 days ago',
      icon: AlertCircle,
      color: 'red',
    },
    {
      id: '5',
      type: 'commit',
      message: 'Added AI chatbot integration for task assignment',
      author: 'Eve Adams',
      time: '4 days ago',
      icon: GitCommit,
      color: 'purple',
    },
  ]

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">GitHub Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {activity.author} • {activity.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
