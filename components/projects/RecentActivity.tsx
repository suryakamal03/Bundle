'use client'

import Card from '@/components/ui/Card'
import { Activity, GitCommit, GitPullRequest, AlertCircle } from 'lucide-react'
import { mockActivityItems } from '@/lib/mockData'

export default function RecentActivity() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {mockActivityItems.map((activity) => {
          const icons = {
            commit: GitCommit,
            pr: GitPullRequest,
            issue: AlertCircle,
            task: Activity,
            chat: Activity,
          }
          const Icon = icons[activity.type as keyof typeof icons] || Activity

          return (
            <div key={activity.id} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
