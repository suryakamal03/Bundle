'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { GitCommit, GitPullRequest, GitMerge, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot, where, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { GitHubActivity } from '@/types'
import { getRelativeTime } from '@/lib/utils'

interface RecentActivityProps {
  projectId?: string
  projectName?: string
}

export default function RecentActivity({ projectId, projectName }: RecentActivityProps) {
  const [activities, setActivities] = useState<GitHubActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log('[RecentActivity] Setting up subscription', { projectId, projectName })
    setLoading(true)

    // Build query based on whether we have a specific project
    const baseQuery = collection(db, 'githubActivity')
    const q = projectId
      ? query(baseQuery, where('projectId', '==', projectId), orderBy('createdAt', 'desc'), limit(4))
      : query(baseQuery, orderBy('createdAt', 'desc'), limit(4))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[RecentActivity] Received', snapshot.docs.length, 'activities')
        const fetchedActivities = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as GitHubActivity))
        setActivities(fetchedActivities)
        
        // Fetch project names if showing activities from multiple projects
        if (!projectId && fetchedActivities.length > 0) {
          fetchProjectNames(fetchedActivities)
        }
        
        setLoading(false)
      },
      (error) => {
        console.error('[RecentActivity] Error:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  const fetchProjectNames = async (activities: GitHubActivity[]) => {
    const uniqueProjectIds = [...new Set(activities.map(a => a.projectId))]
    const names: Record<string, string> = {}
    
    for (const pid of uniqueProjectIds) {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', pid))
        if (projectDoc.exists()) {
          names[pid] = projectDoc.data()?.name || 'Unknown Project'
        }
      } catch (err) {
        console.error('[RecentActivity] Error fetching project name:', err)
      }
    }
    
    setProjectNames(names)
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'commit':
        return { icon: GitCommit, color: 'purple' }
      case 'pull_request_opened':
        return { icon: GitPullRequest, color: 'blue' }
      case 'pull_request_merged':
        return { icon: GitMerge, color: 'green' }
      case 'issue_opened':
        return { icon: AlertCircle, color: 'red' }
      case 'issue_closed':
        return { icon: CheckCircle, color: 'green' }
      default:
        return { icon: Activity, color: 'gray' }
    }
  }

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'commit':
        return 'committed'
      case 'pull_request_opened':
        return 'opened PR'
      case 'pull_request_merged':
        return 'merged PR'
      case 'issue_opened':
        return 'opened issue'
      case 'issue_closed':
        return 'closed issue'
      default:
        return 'activity'
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50): string => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength).trim() + '...'
  }

  const handleActivityClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const colorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }

  if (loading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">GitHub activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const { icon: Icon, color } = getActivityIcon(activity.activityType)
            const displayProjectName = projectName || projectNames[activity.projectId] || 'Project'
            
            return (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity.githubUrl)}
                className="flex gap-3 cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#353535] -mx-3 px-3 py-2 rounded-lg transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white leading-tight mb-1">
                    <span className="font-medium">{displayProjectName}</span>
                    <span className="text-gray-500 dark:text-gray-400"> · </span>
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{activity.githubUsername}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {getActivityLabel(activity.activityType)}</span>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                    {truncateMessage(activity.title)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{getRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
