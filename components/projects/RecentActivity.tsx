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
  onActivityClick?: (projectId: string) => void
}

export default function RecentActivity({ projectId, projectName, onActivityClick }: RecentActivityProps) {
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

  const handleActivityClick = (activity: GitHubActivity) => {
    if (onActivityClick && activity.projectId) {
      onActivityClick(activity.projectId)
    } else {
      window.open(activity.githubUrl, '_blank', 'noopener,noreferrer')
    }
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
      <div className="bg-white dark:bg-[#151517] border border-gray-200 dark:border-[#26262a] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#eaeaea] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          GitHub Activity
        </h3>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-2.5">
              <div className="w-7 h-7 bg-gray-200 dark:bg-[#1c1c1f] rounded"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-[#1c1c1f] rounded w-3/4 mb-1.5"></div>
                <div className="h-2.5 bg-gray-200 dark:bg-[#1c1c1f] rounded w-2/3 mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-[#1c1c1f] rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#151517] border border-gray-200 dark:border-[#26262a] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-[#eaeaea] mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        GitHub Activity
      </h3>
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <Activity className="w-8 h-8 text-gray-300 dark:text-[#26262a] mx-auto mb-2" />
          <p className="text-xs text-gray-500 dark:text-[#9a9a9a]">No activity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity) => {
            const { icon: Icon, color } = getActivityIcon(activity.activityType)
            const displayProjectName = projectName || projectNames[activity.projectId] || 'Project'
            
            return (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="flex gap-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1c1c1f] p-2 rounded-md transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className={`w-7 h-7 rounded flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 dark:text-[#eaeaea] leading-tight font-medium truncate">
                    {truncateMessage(activity.title, 35)}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-[#9a9a9a] mt-1 truncate">
                    {displayProjectName}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-[#9a9a9a] mt-0.5">
                    {activity.githubUsername} · {getRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
