'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import AddTaskModal from './AddTaskModal'
import TaskDetailsModal from './TaskDetailsModal'
import { Plus, Calendar, Filter, Users, ChevronDown, MoreHorizontal, MessageSquare, Circle, CheckCircle2, Flag, Edit2 } from 'lucide-react'
import { taskService } from '@/backend/tasks/taskService'
import { inviteService } from '@/backend/projects/inviteService'
import { Task } from '@/types'
import { cn } from '@/lib/utils'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ProjectMember {
  id: string
  name: string
  email: string
  role?: string
}

interface ProjectTasksProps {
  projectId: string
  showAddTaskModal: boolean
  setShowAddTaskModal: (show: boolean) => void
}

// Simple in-memory cache for members to prevent re-fetching on tab switches
const membersCache = new Map<string, { data: ProjectMember[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export default function ProjectTasks({ projectId, showAddTaskModal, setShowAddTaskModal }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [reminders, setReminders] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [editingPriority, setEditingPriority] = useState<string | null>(null)
  const [editingTaskName, setEditingTaskName] = useState<string | null>(null)
  const [taskNameValue, setTaskNameValue] = useState('')
  const [showTaskMenu, setShowTaskMenu] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [creatingInlineTask, setCreatingInlineTask] = useState<string | null>(null)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('')
  const [newTaskAssigneeName, setNewTaskAssigneeName] = useState<string>('')
  const [newTaskDate, setNewTaskDate] = useState<string>('')
  const [newTaskPriority, setNewTaskPriority] = useState<string>('')
  const [showNewAssigneeDropdown, setShowNewAssigneeDropdown] = useState(false)
  const [showNewDatePicker, setShowNewDatePicker] = useState(false)
  const [showNewPriorityDropdown, setShowNewPriorityDropdown] = useState(false)
  const [assigneeSelected, setAssigneeSelected] = useState(false)

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  useEffect(() => {
    loadMembers()
    
    const unsubscribe = taskService.subscribeToProjectTasks(projectId, (updatedTasks) => {
      setTasks(updatedTasks)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [projectId])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setEditingAssignee(null)
        setEditingDate(null)
        setEditingPriority(null)
        setShowTaskMenu(null)
        setShowNewAssigneeDropdown(false)
        setShowNewDatePicker(false)
        setShowNewPriorityDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const updateTaskAssignee = async (taskId: string, memberId: string, memberName: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        assignedTo: memberId,
        assignedToName: memberName
      })
      
      // Clear dashboard cache for both old and new assignee
      const task = tasks.find(t => t.id === taskId)
      if (task?.assignedTo) {
        sessionStorage.removeItem(`dashboard_cache_${task.assignedTo}`)
      }
      sessionStorage.removeItem(`dashboard_cache_${memberId}`)
      
      setEditingAssignee(null)
    } catch (error) {
      console.error('Failed to update assignee:', error)
    }
  }

  const updateTaskDeadline = async (taskId: string, date: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        deadlineAt: new Date(date)
      })
      
      // Clear dashboard cache for assigned user
      const task = tasks.find(t => t.id === taskId)
      if (task?.assignedTo) {
        sessionStorage.removeItem(`dashboard_cache_${task.assignedTo}`)
      }
      
      setEditingDate(null)
    } catch (error) {
      console.error('Failed to update deadline:', error)
    }
  }

  const updateTaskPriority = async (taskId: string, priority: string) => {
    try {
      // Close dropdown immediately
      setEditingPriority(null)
      
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        priority: priority
      })
      
      // Clear dashboard cache for assigned user
      const task = tasks.find(t => t.id === taskId)
      if (task?.assignedTo) {
        sessionStorage.removeItem(`dashboard_cache_${task.assignedTo}`)
      }
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const updateTaskName = async (taskId: string, newName: string) => {
    if (!newName.trim()) return
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        title: newName.trim()
      })
      
      // Clear dashboard cache for assigned user
      const task = tasks.find(t => t.id === taskId)
      if (task?.assignedTo) {
        sessionStorage.removeItem(`dashboard_cache_${task.assignedTo}`)
      }
      
      setEditingTaskName(null)
      setTaskNameValue('')
    } catch (error) {
      console.error('Failed to update task name:', error)
    }
  }

  const createInlineTask = async (status: string) => {
    if (!newTaskName.trim() || !newTaskAssignee) return
    
    try {
      const taskData: any = {
        title: newTaskName.trim(),
        status: status,
        projectId: projectId,
        assignedTo: newTaskAssignee,
        assignedToName: newTaskAssigneeName,
        createdAt: new Date(),
        reminderEnabled: true,
        reminderSent: false
      }
      
      if (newTaskDate) {
        taskData.deadlineAt = new Date(newTaskDate)
      }
      
      if (newTaskPriority) {
        taskData.priority = newTaskPriority
      }
      
      await taskService.createTask(taskData)
      
      // Clear dashboard cache for the assigned user
      sessionStorage.removeItem(`dashboard_cache_${newTaskAssignee}`)
      
      // Reset form but keep creation mode and assignee for next task
      setNewTaskName('')
      setNewTaskDate('')
      setNewTaskPriority('')
      setShowNewDatePicker(false)
      setShowNewPriorityDropdown(false)
      setAssigneeSelected(true)
      // Keep the same assignee and show dropdown again for next task
      setShowNewAssigneeDropdown(true)
    } catch (error) {
      console.error('Failed to create task:', error)
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
      {/* Member Pills (Secondary Filter) */}
      {!loadingMembers && members.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedMember(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedMember === null 
                ? 'bg-white text-black' 
                : 'bg-[#0f0f10] border border-[#26262a] text-[#9a9a9a] hover:bg-[#1c1c1f]'
            }`}
          >
            All ({tasks.length})
          </button>
          {members.map((member) => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id)
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedMember === member.id 
                    ? 'bg-white text-black' 
                    : 'bg-[#0f0f10] border border-[#26262a] text-[#9a9a9a] hover:bg-[#1c1c1f]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                {member.name} ({memberTasks.length})
              </button>
            )
          })}
        </div>
      )}

      {/* ClickUp-style Task Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Task Groups */}
          {Object.entries(taskGroups).map(([status, groupTasks]) => {
            const isCollapsed = collapsedSections.has(status)
            return (
              <div key={status} className="space-y-2">
                {/* Group Header */}
                <button 
                  onClick={() => toggleSection(status)}
                  className="flex items-center gap-2 px-2 w-full hover:bg-[#1c1c1f] rounded-md transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-[#9a9a9a] transition-transform ${
                    isCollapsed ? '-rotate-90' : ''
                  }`} />
                  <h3 className="text-sm font-semibold text-[#eaeaea] uppercase tracking-wide">{status}</h3>
                  <span className="text-xs text-[#9a9a9a]">{groupTasks.length}</span>
                </button>

                {!isCollapsed && (
                  <>
                    {/* Task List Header */}
                    <div className="grid grid-cols-[1fr_120px_120px_100px_100px_40px] gap-4 px-4 py-2 text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">
                      <div>Name</div>
                      <div>Assignee</div>
                      <div>Due date</div>
                      <div>Status</div>
                      <div>Priority</div>
                      <div></div>
                    </div>

              {/* Task Rows */}
              {groupTasks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[#9a9a9a]">No tasks</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {groupTasks.map((task) => {
                    const deadlineInfo = formatDeadline(task.deadlineAt)
                    
                    return (
                      <div
                        key={task.id}
                        className="grid grid-cols-[1fr_120px_120px_100px_100px_40px] gap-4 px-4 py-2.5 hover:bg-[#1c1c1f] transition-colors group rounded-md relative"
                      >
                        {/* Task Name */}
                        <div className="flex items-center min-w-0">
                          {editingTaskName === task.id ? (
                            <input
                              type="text"
                              value={taskNameValue}
                              onChange={(e) => setTaskNameValue(e.target.value)}
                              onBlur={() => updateTaskName(task.id, taskNameValue)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateTaskName(task.id, taskNameValue)
                                if (e.key === 'Escape') {
                                  setEditingTaskName(null)
                                  setTaskNameValue('')
                                }
                              }}
                              className="w-full bg-[#0f0f10] border border-[#26262a] rounded px-2 py-1 text-sm text-[#eaeaea] focus:outline-none focus:border-white"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm text-[#eaeaea] truncate group-hover:text-white">
                              {task.title}
                            </span>
                          )}
                        </div>

                        {/* Assignee - Click to edit */}
                        <div className="flex items-center gap-2 relative" data-dropdown>
                          {editingAssignee === task.id ? (
                            <div className="absolute left-0 top-0 z-10 bg-[#151517] border border-[#26262a] rounded-md shadow-lg min-w-[180px]">
                              {members.map((member) => (
                                <button
                                  key={member.id}
                                  onClick={() => updateTaskAssignee(task.id, member.id, member.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors first:rounded-t-md last:rounded-b-md"
                                >
                                  <Avatar name={member.name} size="sm" />
                                  <span className="text-sm text-[#eaeaea]">{member.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingAssignee(task.id)
                              }}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              {task.assignedTo ? (
                                <>
                                  <Avatar 
                                    name={task.assignedToName || getMemberName(task.assignedTo)} 
                                    size="sm" 
                                  />
                                  <span className="text-xs text-[#9a9a9a] truncate">
                                    {task.assignedToName || getMemberName(task.assignedTo)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-[#9a9a9a]">Unassigned</span>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Due Date - Click to edit */}
                        <div className="flex items-center gap-1.5 relative" data-dropdown>
                          {editingDate === task.id ? (
                            <div className="absolute left-0 top-0 z-10">
                              <input
                                type="date"
                                defaultValue={task.deadlineAt ? new Date(task.deadlineAt.seconds * 1000).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateTaskDeadline(task.id, e.target.value)
                                  }
                                }}
                                onBlur={(e) => {
                                  // Small delay to allow onChange to fire
                                  setTimeout(() => setEditingDate(null), 100)
                                }}
                                onClick={(e) => {
                                  const input = e.currentTarget
                                  try {
                                    input.showPicker()
                                  } catch (err) {
                                    // Fallback for browsers that don't support showPicker
                                  }
                                }}
                                className="bg-[#0f0f10] border border-[#26262a] rounded px-2 py-1 text-xs text-[#eaeaea] focus:outline-none focus:border-white cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingDate(task.id)
                              }}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            >
                              {deadlineInfo ? (
                                <>
                                  <Calendar className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                  <span className={cn(
                                    "text-xs",
                                    deadlineInfo.isOverdue 
                                      ? "text-red-400 font-medium" 
                                      : "text-[#9a9a9a]"
                                  )}>
                                    {deadlineInfo.text}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Calendar className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                  <span className="text-xs text-[#9a9a9a]">Set date</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            task.status === 'Done' ? 'bg-green-500/10 text-green-400' :
                            task.status === 'In Review' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-gray-500/10 text-gray-400'
                          )}>
                            {task.status}
                          </span>
                        </div>

                        {/* Priority - Click to edit */}
                        <div className="flex items-center relative" data-dropdown>
                          {editingPriority === task.id ? (
                            <div className="absolute left-0 top-0 z-10 bg-[#151517] border border-[#26262a] rounded-md shadow-lg min-w-[120px]">
                              <button
                                onClick={() => updateTaskPriority(task.id, 'High')}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors first:rounded-t-md"
                              >
                                <Flag className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-sm text-red-400">High</span>
                              </button>
                              <button
                                onClick={() => updateTaskPriority(task.id, 'Normal')}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors"
                              >
                                <Flag className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-sm text-blue-400">Normal</span>
                              </button>
                              <button
                                onClick={() => updateTaskPriority(task.id, 'Low')}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors last:rounded-b-md"
                              >
                                <Flag className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm text-gray-400">Low</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingPriority(task.id)
                              }}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            >
                              <Flag className={cn(
                                "w-3.5 h-3.5",
                                (task as any).priority === 'High' ? 'text-red-400' :
                                (task as any).priority === 'Normal' ? 'text-blue-400' :
                                (task as any).priority === 'Low' ? 'text-gray-400' :
                                'text-[#9a9a9a]'
                              )} />
                              <span className={cn(
                                "text-xs",
                                (task as any).priority === 'High' ? 'text-red-400' :
                                (task as any).priority === 'Normal' ? 'text-blue-400' :
                                (task as any).priority === 'Low' ? 'text-gray-400' :
                                'text-[#9a9a9a]'
                              )}>
                                {(task as any).priority || 'None'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* More Options Menu */}
                        <div className="flex items-center justify-center relative" data-dropdown>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowTaskMenu(showTaskMenu === task.id ? null : task.id)
                            }}
                            className="p-1 hover:bg-[#26262a] rounded transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-[#9a9a9a]" />
                          </button>
                          {showTaskMenu === task.id && (
                            <div className="absolute right-0 top-8 z-10 bg-[#151517] border border-[#26262a] rounded-md shadow-lg min-w-[140px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTaskMenu(null)
                                  setEditingTaskName(task.id)
                                  setTaskNameValue(task.title)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors first:rounded-t-md"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                <span className="text-sm text-[#eaeaea]">Rename</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTaskMenu(null)
                                  setSelectedTask(task)
                                  setShowDetailsModal(true)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors last:rounded-b-md"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#9a9a9a]" />
                                <span className="text-sm text-[#eaeaea]">Details</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add Task in Group - Inline Creation */}
              {creatingInlineTask === status ? (
                <div className="grid grid-cols-[1fr_120px_120px_100px_100px_40px] gap-4 px-4 py-2.5 bg-[#1c1c1f] rounded-md relative" data-dropdown>
                  {/* Task Name Input */}
                  <div className="flex items-center min-w-0">
                    {assigneeSelected ? (
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newTaskName.trim() && newTaskAssignee) {
                              createInlineTask(status)
                            }
                          }
                          if (e.key === 'Escape') {
                            setCreatingInlineTask(null)
                            setNewTaskName('')
                            setNewTaskAssignee('')
                            setNewTaskAssigneeName('')
                            setNewTaskDate('')
                            setNewTaskPriority('')
                            setAssigneeSelected(false)
                          }
                        }}
                        placeholder="Task name"
                        className="w-full bg-[#0f0f10] border border-[#26262a] rounded px-2 py-1 text-sm text-[#eaeaea] placeholder:text-[#9a9a9a] focus:outline-none focus:border-white"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm text-[#9a9a9a]">Select assignee first...</span>
                    )}
                  </div>

                  {/* Assignee Icon */}
                  <div className="flex items-center gap-2 relative">
                    {showNewAssigneeDropdown ? (
                      <div className="absolute left-0 top-0 z-10 bg-[#151517] border border-[#26262a] rounded-md shadow-lg min-w-[180px]">
                        {members.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => {
                              setNewTaskAssignee(member.id)
                              setNewTaskAssigneeName(member.name)
                              setShowNewAssigneeDropdown(false)
                              setAssigneeSelected(true)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors first:rounded-t-md last:rounded-b-md"
                          >
                            <Avatar name={member.name} size="sm" />
                            <span className="text-sm text-[#eaeaea]">{member.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewAssigneeDropdown(true)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        {newTaskAssignee ? (
                          <>
                            <Avatar name={newTaskAssigneeName} size="sm" />
                            <span className="text-xs text-[#9a9a9a] truncate">{newTaskAssigneeName}</span>
                          </>
                        ) : (
                          <Users className="w-4 h-4 text-[#9a9a9a]" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Due Date Icon */}
                  <div className="flex items-center gap-1.5 relative">
                    {showNewDatePicker ? (
                      <div className="absolute left-0 top-0 z-10">
                        <input
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => {
                            setNewTaskDate(e.target.value)
                            setShowNewDatePicker(false)
                          }}
                          onBlur={() => setShowNewDatePicker(false)}
                          onClick={(e) => {
                            const input = e.currentTarget
                            try {
                              input.showPicker()
                            } catch (err) {}
                          }}
                          className="bg-[#0f0f10] border border-[#26262a] rounded px-2 py-1 text-xs text-[#eaeaea] focus:outline-none focus:border-white cursor-pointer"
                          style={{ colorScheme: 'dark' }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewDatePicker(true)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        <Calendar className="w-4 h-4 text-[#9a9a9a]" />
                        {newTaskDate && (
                          <span className="text-xs text-[#9a9a9a]">
                            {new Date(newTaskDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-500/10 text-gray-400">
                      {status}
                    </span>
                  </div>

                  {/* Priority Icon */}
                  <div className="flex items-center relative">
                    {showNewPriorityDropdown ? (
                      <div className="absolute left-0 top-0 z-10 bg-[#151517] border border-[#26262a] rounded-md shadow-lg min-w-[120px]">
                        <button
                          onClick={() => {
                            setNewTaskPriority('High')
                            setShowNewPriorityDropdown(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors first:rounded-t-md"
                        >
                          <Flag className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-sm text-red-400">High</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskPriority('Normal')
                            setShowNewPriorityDropdown(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors"
                        >
                          <Flag className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-sm text-blue-400">Normal</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskPriority('Low')
                            setShowNewPriorityDropdown(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1c1c1f] text-left transition-colors last:rounded-b-md"
                        >
                          <Flag className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-400">Low</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewPriorityDropdown(true)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        <Flag className={`w-4 h-4 ${
                          newTaskPriority === 'High' ? 'text-red-400' :
                          newTaskPriority === 'Normal' ? 'text-blue-400' :
                          newTaskPriority === 'Low' ? 'text-gray-400' :
                          'text-[#9a9a9a]'
                        }`} />
                      </button>
                    )}
                  </div>

                  {/* Save/Cancel */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => createInlineTask(status)}
                      className="p-1 hover:bg-[#26262a] rounded transition-colors"
                      disabled={!newTaskName.trim()}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setCreatingInlineTask(status)
                    setShowNewAssigneeDropdown(true)
                    setAssigneeSelected(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#9a9a9a] hover:text-[#eaeaea] hover:bg-[#1c1c1f] rounded-md transition-colors w-full text-left"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              )}
              </>
            )}
          </div>
        )}
        )}
        </div>
      )}

      {showAddTaskModal && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setShowAddTaskModal(false)}
          onTaskCreated={() => {}}
        />
      )}

      {showDetailsModal && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedTask(null)
          }}
          onUpdate={() => {}}
        />
      )}
    </div>
  )
}

