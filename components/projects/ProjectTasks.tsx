'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import AddTaskModal from './AddTaskModal'
import TaskDetailsModal from './TaskDetailsModal'
import { Plus, Calendar } from 'lucide-react'
import { taskService } from '@/backend/tasks/taskService'
import { inviteService } from '@/backend/projects/inviteService'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectMember {
  id: string
  name: string
  email: string
  role?: string
}

interface ProjectTasksProps {
  projectId: string
}

// Simple in-memory cache for members to prevent re-fetching on tab switches
const membersCache = new Map<string, { data: ProjectMember[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [reminders, setReminders] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('All')

  useEffect(() => {
    loadMembers()
    
    const unsubscribe = taskService.subscribeToProjectTasks(projectId, (updatedTasks) => {
      setTasks(updatedTasks)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [projectId])

  const loadMembers = async () => {
    try {
      setLoadingMembers(true)
      
      // Check cache first
      const cached = membersCache.get(projectId)
      const now = Date.now()
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setMembers(cached.data)
        setLoadingMembers(false)
        return
      }
      
      // Fetch from server
      const membersData = await inviteService.getProjectMembers(projectId)
      setMembers(membersData)
      
      // Update cache
      membersCache.set(projectId, {
        data: membersData,
        timestamp: now
      })
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const filteredTasks = selectedMember
    ? tasks.filter(task => task.assignedTo === selectedMember)
    : tasks

  const statusFilteredTasks = statusFilter === 'All' 
    ? filteredTasks 
    : filteredTasks.filter(task => task.status === statusFilter)

  const taskGroups = {
    'To Do': statusFilteredTasks.filter(t => t.status === 'To Do'),
    'In Review': statusFilteredTasks.filter(t => t.status === 'In Review'),
    'Done': statusFilteredTasks.filter(t => t.status === 'Done')
  }

  const getMemberName = (userId: string) => {
    return members.find(m => m.id === userId)?.name || 'Unknown'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </select>
          <Button size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Member Filter */}
      {loadingMembers ? (
        <div className="flex gap-2 flex-wrap animate-pulse">
          <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      ) : members.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedMember === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMember(null)}
          >
            All Members ({tasks.length})
          </Button>
          {members.map((member) => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id)
            return (
              <Button
                key={member.id}
                variant={selectedMember === member.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMember(member.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Avatar name={member.name} size="sm" />
                {member.name} ({memberTasks.length})
              </Button>
            )
          })}
        </div>
      )}

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr,100px,150px,120px,100px] gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="text-xs font-semibold text-gray-600 uppercase">Name</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Status</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Assignee</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Due date</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Remind Me</div>
          </div>
          
          {/* Task Rows */}
          <div className="divide-y divide-gray-100">
            {statusFilteredTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No tasks</p>
            ) : (
              statusFilteredTasks.map((task) => {
                const deadlineInfo = formatDeadline(task.deadlineAt)
                // Default reminder to ON if not set
                const hasReminder = !reminders.has(task.id)
              
                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr,100px,150px,120px,100px] gap-4 px-6 py-3 hover:bg-gray-50 transition-colors group relative"
                  >
                    {/* Task Name */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer flex items-center"
                      onClick={() => setSelectedTask(task)}
                    >
                      <h4 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h4>
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
                      <Avatar 
                        name={task.assignedToName || getMemberName(task.assignedTo)} 
                        size="sm" 
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {task.assignedToName || getMemberName(task.assignedTo)}
                      </span>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-1.5">
                      {deadlineInfo ? (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className={cn(
                            "text-xs font-medium",
                            deadlineInfo.isOverdue 
                              ? "text-red-600" 
                              : "text-gray-600"
                          )}>
                            {deadlineInfo.text}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
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
                          hasReminder ? "bg-primary-500" : "bg-gray-300"
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
              })
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onTaskCreated={() => {}}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  )
}

