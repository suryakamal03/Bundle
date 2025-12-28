'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { taskManagementService, TaskManagementItem } from '@/backend/tasks/taskManagementService'
import { cn } from '@/lib/utils'

type FilterStatus = 'All' | 'To Do' | 'In Review'

export default function TaskManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskManagementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All')
  const [reminders, setReminders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    // Subscribe to real-time task updates
    const unsubscribe = taskManagementService.subscribeToTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleTaskClick = (projectId: string) => {
    router.push(`/projects?project=${projectId}`)
  }

  const formatDeadline = (deadline: any) => {
    if (!deadline) return null
    try {
      const date = deadline.toDate ? deadline.toDate() : new Date(deadline)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return { text: 'Overdue', isOverdue: true }
      if (diffDays === 0) return { text: 'Today', isOverdue: false }
      if (diffDays === 1) return { text: 'Tomorrow', isOverdue: false }
      if (diffDays < 7) return { text: `${diffDays}d`, isOverdue: false }
      
      return { 
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        isOverdue: false 
      }
    } catch (error) {
      return null
    }
  }

  const toggleReminder = (taskId: string) => {
    setReminders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'All') return true
    return task.status === activeFilter
  })

  const statusCounts = {
    'All': tasks.length,
    'To Do': tasks.filter(t => t.status === 'To Do').length,
    'In Review': tasks.filter(t => t.status === 'In Review').length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tasks.length > 0 ? `Managing ${tasks.length} tasks across your projects` : 'No tasks to display'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          {(['All', 'To Do', 'In Review'] as FilterStatus[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeFilter === filter
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {filter}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                {statusCounts[filter]}
              </span>
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {user 
                ? activeFilter === 'All' 
                  ? 'Task Management is available for project leads only' 
                  : `No tasks in "${activeFilter}" status`
                : 'Please log in to view tasks'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr,100px,150px,120px,100px] gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Name</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Assignee</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Due date</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Remind Me</div>
            </div>
            
            {/* Task Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTasks.map((task) => {
                const deadlineInfo = formatDeadline(task.deadlineAt)
                const hasReminder = !reminders.has(task.id)
                
                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr,100px,150px,120px,100px] gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#353535] transition-colors group relative"
                  >
                    {/* Task Title */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer flex items-center"
                      onClick={() => handleTaskClick(task.projectId)}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                        {task.title}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <Badge 
                        variant={
                          task.status === 'Done' ? 'success' : 
                          task.status === 'In Review' ? 'warning' : 
                          'info'
                        }
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                    </div>

                    {/* Assigned User - Show Name */}
                    <div className="flex items-center gap-2">
                      {task.assignedToName ? (
                        <>
                          <Avatar name={task.assignedToName} size="sm" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {task.assignedToName}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500">?</span>
                          </div>
                          <span className="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5">
                      {deadlineInfo ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <span className={cn(
                            "text-xs font-medium",
                            deadlineInfo.isOverdue 
                              ? "text-red-600 dark:text-red-400" 
                              : "text-gray-600 dark:text-gray-300"
                          )}>
                            {deadlineInfo.text}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </div>

                    {/* Toggle Button */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleReminder(task.id)
                        }}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative",
                          hasReminder ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5",
                          hasReminder ? "translate-x-5" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 Ontrackr. All rights reserved.
        </div>
      </div>
    </DashboardLayout>
  )
}
