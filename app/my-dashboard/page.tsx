'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import TaskDetailsModal from '@/components/projects/TaskDetailsModal'
import { CheckSquare, GitBranch, AlertCircle, ExternalLink, Bell } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { userTaskService, UserTask } from '@/backend/tasks/userTaskService'
import { userGitHubService, UserGitHubActivity, GitHubIssue } from '@/backend/integrations/userGitHubService'
import { getRelativeTime, cn } from '@/lib/utils'
import { getDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Task } from '@/types'

type TabType = 'todo' | 'in-review' | 'issues'

// ==================== SKELETON LOADERS ====================
// These show only on first load, matching actual content layout
const TaskSkeleton = memo(() => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border border-gray-200 dark:border-[#26262a] bg-white dark:bg-[#151517] rounded-lg">
        <div className="h-4 bg-gray-200 dark:bg-[#26262a] rounded w-3/4 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 dark:bg-[#26262a] rounded w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-[#26262a] rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
))
TaskSkeleton.displayName = 'TaskSkeleton'

const IssueSkeleton = memo(() => (
  <div className="space-y-3 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="p-4 border border-gray-200 dark:border-[#26262a] bg-white dark:bg-[#151517] rounded-lg">
        <div className="h-4 bg-gray-200 dark:bg-[#26262a] rounded w-2/3 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 dark:bg-[#26262a] rounded w-20"></div>
          <div className="h-5 bg-gray-200 dark:bg-[#26262a] rounded w-16"></div>
          <div className="h-5 bg-gray-200 dark:bg-[#26262a] rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
))
IssueSkeleton.displayName = 'IssueSkeleton'

// ==================== MEMOIZED TAB CONTENT COMPONENTS ====================
// These prevent unnecessary re-renders on tab switches
const TodoTab = memo(({ 
  tasks, 
  loading, 
  onTaskClick
}: { 
  tasks: UserTask[]
  loading: boolean
  onTaskClick: (task: UserTask) => void
}) => {
  if (loading) return <TaskSkeleton />
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-12 h-12 text-gray-300 dark:text-[#26262a] mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-[#9a9a9a]">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        return (
          <div
            key={task.id}
            className="p-4 border border-gray-200 dark:border-[#26262a] bg-white dark:bg-[#151517] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-[#eaeaea] mb-1">{task.title}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info" className="text-xs bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9a9a9a] border-gray-300 dark:border-[#26262a]">
                {task.projectName || 'Unknown Project'}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">{task.status}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
TodoTab.displayName = 'TodoTab'

const InReviewTab = memo(({ 
  tasks, 
  loading, 
  onTaskClick 
}: { 
  tasks: UserTask[]
  loading: boolean
  onTaskClick: (task: UserTask) => void
}) => {
  if (loading) return <TaskSkeleton />
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-12 h-12 text-gray-300 dark:text-[#26262a] mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-[#9a9a9a]">No tasks in review</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className="p-4 border border-gray-200 dark:border-[#26262a] bg-white dark:bg-[#151517] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors cursor-pointer"
        >
          <p className="text-sm font-medium text-gray-900 dark:text-[#eaeaea] mb-1">{task.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info" className="text-xs bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9a9a9a] border-gray-300 dark:border-[#26262a]">
              {task.projectName || 'Unknown Project'}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">{task.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
})
InReviewTab.displayName = 'InReviewTab'

const IssuesTab = memo(({ 
  issues, 
  loading, 
  githubUsername, 
  onOpenGitHub 
}: { 
  issues: GitHubIssue[]
  loading: boolean
  githubUsername: string
  onOpenGitHub: (url: string) => void
}) => {
  if (loading) return <IssueSkeleton />
  
  if (!githubUsername) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-[#26262a] mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-[#9a9a9a]">No GitHub username configured</p>
        <p className="text-xs text-gray-400 dark:text-[#9a9a9a] mt-1">Add your GitHub username in settings</p>
      </div>
    )
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-[#26262a] mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-[#9a9a9a]">No open issues found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div
          key={issue.id}
          onClick={() => onOpenGitHub(issue.githubUrl)}
          className="p-4 border border-gray-200 dark:border-[#26262a] bg-white dark:bg-[#151517] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors cursor-pointer"
        >
          <p className="text-sm font-medium text-gray-900 dark:text-[#eaeaea] mb-1">{issue.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info" className="text-xs bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9a9a9a] border-gray-300 dark:border-[#26262a]">
              {issue.projectName || 'Unknown Project'}
            </Badge>
            <Badge variant={issue.state === 'open' ? 'danger' : 'success'} className="text-xs bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9a9a9a] border-gray-300 dark:border-[#26262a]">
              {issue.state}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">
              #{issue.number} · {getRelativeTime(issue.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
})
IssuesTab.displayName = 'IssuesTab'

// ==================== MAIN COMPONENT ====================
export default function MyDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Check cache immediately during initialization
  const getInitialData = () => {
    if (!user) return { loading: true, data: null }
    
    const cacheKey = `dashboard_cache_${user.uid}`
    const cachedData = sessionStorage.getItem(cacheKey)
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsed.timestamp
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          return { loading: false, data: parsed }
        }
      } catch (e) {
        // Invalid cache
      }
    }
    return { loading: true, data: null }
  }
  
  const initialState = getInitialData()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('todo')
  
  // Data states - initialize with cached data if available
  const [todoTasks, setTodoTasks] = useState<UserTask[]>(initialState.data?.todoTasks || [])
  const [inReviewTasks, setInReviewTasks] = useState<UserTask[]>(initialState.data?.inReviewTasks || [])
  const [issues, setIssues] = useState<GitHubIssue[]>(initialState.data?.issues || [])
  const [activities, setActivities] = useState<UserGitHubActivity[]>(initialState.data?.activities || [])
  const [githubUsername, setGithubUsername] = useState<string>(initialState.data?.githubUsername || '')
  
  // UI states - start as false if we have cached data
  const [loading, setLoading] = useState(initialState.loading)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Cache ref to prevent re-fetching
  const hasLoadedData = useRef(!!initialState.data)

  // Load data only if not cached
  useEffect(() => {
    if (!user || hasLoadedData.current) return
    hasLoadedData.current = true
    loadUserData()
  }, [user])

  const loadUserData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      const username = userData?.githubUsername || ''
      setGithubUsername(username)

      const allUserTasks = await userTaskService.getUserTasks(user.uid)
      const todo = allUserTasks.filter(task => task.status === 'To Do')
      const inReview = allUserTasks.filter(task => task.status === 'In Review')
      
      setTodoTasks(todo)
      setInReviewTasks(inReview)

      let userIssues: GitHubIssue[] = []
      let userActivities: UserGitHubActivity[] = []
      
      if (username) {
        [userIssues, userActivities] = await Promise.all([
          userGitHubService.getUserGitHubIssues(username, user.uid),
          userGitHubService.getUserGitHubActivities(username, 10, user.uid)
        ])
        setIssues(userIssues)
        setActivities(userActivities)
      }
      
      // Cache the data in sessionStorage
      const cacheKey = `dashboard_cache_${user.uid}`
      sessionStorage.setItem(cacheKey, JSON.stringify({
        todoTasks: todo,
        inReviewTasks: inReview,
        issues: userIssues,
        activities: userActivities,
        githubUsername: username,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Memoized handlers
  const handleTaskClick = useCallback((task: UserTask) => {
    const taskForModal: Task = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'Medium',
      assignedTo: task.assignedTo,
      assignedToName: task.assignedToName,
      projectId: task.projectId,
      createdAt: task.createdAt,
      deadlineAt: task.deadlineAt,
      reminderEnabled: task.reminderEnabled,
      reminderSent: task.reminderSent
    }
    setSelectedTask(taskForModal)
  }, [])

  const handleOpenGitHub = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleTaskUpdate = useCallback(async () => {
    if (user) {
      // Clear cache when task is updated
      const cacheKey = `dashboard_cache_${user.uid}`
      sessionStorage.removeItem(cacheKey)
      
      const allUserTasks = await userTaskService.getUserTasks(user.uid)
      const todo = allUserTasks.filter(task => task.status === 'To Do')
      const inReview = allUserTasks.filter(task => task.status === 'In Review')
      
      setTodoTasks(todo)
      setInReviewTasks(inReview)
      
      // Re-cache the updated data
      sessionStorage.setItem(cacheKey, JSON.stringify({
        todoTasks: todo,
        inReviewTasks: inReview,
        issues,
        activities,
        githubUsername,
        timestamp: Date.now()
      }))
    }
    setSelectedTask(null)
  }, [user, issues, activities, githubUsername])

  return (
    <DashboardLayout>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#eaeaea]">My Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-[#9a9a9a] mt-1">Your personal command center</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white dark:bg-[#0f0f10] border-gray-200 dark:border-[#26262a]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#eaeaea] mb-4">My Tasks</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-[#26262a]">
              <button
                onClick={() => setActiveTab('todo')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'todo'
                    ? 'text-gray-900 dark:text-[#eaeaea] border-b-2 border-blue-600 dark:border-white'
                    : 'text-gray-500 dark:text-[#9a9a9a] hover:text-gray-900 dark:hover:text-[#eaeaea]'
                }`}
              >
                To Do ({todoTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('in-review')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'in-review'
                    ? 'text-gray-900 dark:text-[#eaeaea] border-b-2 border-blue-600 dark:border-white'
                    : 'text-gray-500 dark:text-[#9a9a9a] hover:text-gray-900 dark:hover:text-[#eaeaea]'
                }`}
              >
                In Review ({inReviewTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'issues'
                    ? 'text-gray-900 dark:text-[#eaeaea] border-b-2 border-blue-600 dark:border-white'
                    : 'text-gray-500 dark:text-[#9a9a9a] hover:text-gray-900 dark:hover:text-[#eaeaea]'
                }`}
              >
                Issues ({issues.length})
              </button>
            </div>

            {/* Tab Content - All rendered but hidden based on activeTab */}
            <div className="mt-4 max-h-[calc(100vh-280px)] overflow-y-auto hide-scrollbar">
              <div style={{ display: activeTab === 'todo' ? 'block' : 'none' }}>
                <TodoTab 
                  tasks={todoTasks} 
                  loading={loading} 
                  onTaskClick={handleTaskClick}
                />
              </div>
              <div style={{ display: activeTab === 'in-review' ? 'block' : 'none' }}>
                <InReviewTab 
                  tasks={inReviewTasks} 
                  loading={loading} 
                  onTaskClick={handleTaskClick}
                />
              </div>
              <div style={{ display: activeTab === 'issues' ? 'block' : 'none' }}>
                <IssuesTab 
                  issues={issues} 
                  loading={loading} 
                  githubUsername={githubUsername}
                  onOpenGitHub={handleOpenGitHub}
                />
              </div>
            </div>
          </Card>

          {/* GitHub Activity Sidebar */}
          {githubUsername && (
            <Card className="bg-white dark:bg-[#0f0f10] border-gray-200 dark:border-[#26262a]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#eaeaea] mb-4">Recent GitHub Activity</h2>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GitBranch className="w-12 h-12 text-gray-300 dark:text-[#3a3a3d] mb-3" />
                  <p className="text-sm text-gray-500 dark:text-[#9a9a9a] mb-1">No recent activity</p>
                  <p className="text-xs text-gray-400 dark:text-[#6e6e73]">GitHub activity from the last 7 days will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto hide-scrollbar pr-2">
                  {activities.slice(0, 8).map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleOpenGitHub(activity.githubUrl)}
                      className="flex gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#151517] border border-gray-200 dark:border-[#26262a] hover:bg-gray-100 dark:hover:bg-[#1c1c1f] transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-[#1c1c1f] border border-gray-300 dark:border-[#26262a]">
                        <GitBranch className="w-4 h-4 text-gray-600 dark:text-[#9a9a9a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-[#eaeaea] mb-0.5">
                          {activity.activityType}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-[#9a9a9a] line-clamp-1 mb-1">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">{activity.projectName}</span>
                          <span className="text-xs text-gray-400 dark:text-[#9a9a9a]">·</span>
                          <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">{getRelativeTime(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
