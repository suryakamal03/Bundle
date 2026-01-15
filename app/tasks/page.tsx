'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import TaskDetailsModal from '@/components/projects/TaskDetailsModal'
import { Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { taskManagementService, TaskManagementItem } from '@/backend/tasks/taskManagementService'
import { cn } from '@/lib/utils'
import { Task } from '@/types'

type FilterStatus = 'All' | 'To Do' | 'In Review'

export default function TaskManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskManagementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

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

  const handleTaskClick = (task: TaskManagementItem) => {
    // Convert TaskManagementItem to Task type for the modal
    const taskForModal: Task = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      assignedTo: task.assignedTo,
      assignedToName: task.assignedToName,
      projectId: task.projectId,
      deadlineAt: task.deadlineAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      projectName: task.projectName
    }
    setSelectedTask(taskForModal)
  }

  const handleCloseModal = () => {
    setSelectedTask(null)
  }

  const handleTaskUpdate = () => {
    setSelectedTask(null)
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#eaeaea]">Task Management</h1>
            <p className="text-sm text-gray-600 dark:text-[#9a9a9a] mt-1">
              {tasks.length > 0 ? `Managing ${tasks.length} tasks across your projects` : 'No tasks to display'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#26262a]">
          {(['All', 'To Do', 'In Review'] as FilterStatus[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeFilter === filter
                  ? 'text-gray-900 dark:text-[#eaeaea] border-blue-600 dark:border-white'
                  : 'text-gray-500 dark:text-[#9a9a9a] border-transparent hover:text-gray-900 dark:hover:text-[#eaeaea]'
              )}
            >
              {filter}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#1c1c1f] text-gray-900 dark:text-[#eaeaea] text-xs">
                {statusCounts[filter]}
              </span>
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 dark:text-[#9a9a9a] animate-spin" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-[#9a9a9a]">No tasks found</p>
            <p className="text-sm text-gray-500 dark:text-[#9a9a9a] mt-1">
              {user 
                ? activeFilter === 'All' 
                  ? 'Task Management is available for project leads only' 
                  : `No tasks in "${activeFilter}" status`
                : 'Please log in to view tasks'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0f0f10] rounded-lg border border-gray-200 dark:border-[#26262a]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr,100px,150px,120px] gap-4 px-6 py-3 border-b border-gray-200 dark:border-[#26262a] bg-gray-50 dark:bg-[#151517]">
              <div className="text-xs font-semibold text-gray-600 dark:text-[#9a9a9a] uppercase">Name</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-[#9a9a9a] uppercase">Status</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-[#9a9a9a] uppercase">Assignee</div>
              <div className="text-xs font-semibold text-gray-600 dark:text-[#9a9a9a] uppercase">Due date</div>
            </div>
            
            {/* Task Rows */}
            <div className="divide-y divide-gray-200 dark:divide-[#26262a]">
              {filteredTasks.map((task) => {
                const deadlineInfo = formatDeadline(task.deadlineAt)
                
                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr,100px,150px,120px] gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors group relative cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    {/* Task Title */}
                    <div className="flex-1 min-w-0 flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-[#eaeaea] group-hover:text-blue-600 dark:group-hover:text-white truncate">
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
                        className="text-xs bg-gray-100 dark:bg-[#1c1c1f] text-gray-600 dark:text-[#9a9a9a] border-gray-300 dark:border-[#26262a]"
                      >
                        {task.status}
                      </Badge>
                    </div>

                    {/* Assigned User - Show Name */}
                    <div className="flex items-center gap-2">
                      {task.assignedToName ? (
                        <>
                          <Avatar name={task.assignedToName} size="sm" />
                          <span className="text-sm text-gray-900 dark:text-[#eaeaea] truncate">
                            {task.assignedToName}
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1c1c1f] flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">?</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-[#9a9a9a]">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5">
                      {deadlineInfo ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-[#9a9a9a]" />
                          <span className={cn(
                            "text-xs font-medium",
                            deadlineInfo.isOverdue 
                              ? "text-red-400" 
                              : "text-gray-900 dark:text-[#eaeaea]"
                          )}>
                            {deadlineInfo.text}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-[#9a9a9a]">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-[#9a9a9a]">
          © 2025 Bundle. All rights reserved.
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={handleTaskUpdate}
        />
      )}
    </DashboardLayout>
  )
}
