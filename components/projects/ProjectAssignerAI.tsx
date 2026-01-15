'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Check, X, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { generateTaskAssignments, AIGeneratedTask } from '@/backend/integrations/taskAssignerService'
import { taskService } from '@/backend/tasks/taskService'
import { User } from '@/types'
import Loading from '@/components/ui/Loading'

interface ProjectAssignerAIProps {
  projectId: string
  projectMembers: User[]
}

interface TaskPreview extends AIGeneratedTask {
  id: string
  approved: boolean
  rejected: boolean
}

export default function ProjectAssignerAI({ projectId, projectMembers }: ProjectAssignerAIProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState('')
  const [generatedTasks, setGeneratedTasks] = useState<TaskPreview[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter members based on @ mention search
  const filteredMembers = projectMembers.filter(member =>
    member.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    member.email.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  // Handle textarea change and detect @ mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    
    setDescription(value)
    setCursorPosition(cursorPos)

    // Check if @ was just typed
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      
      // Show mentions if @ is at start or preceded by space, and followed by word chars
      if (
        (lastAtIndex === 0 || /\s/.test(value[lastAtIndex - 1])) &&
        !/\s/.test(textAfterAt)
      ) {
        setShowMentions(true)
        setMentionFilter(textAfterAt)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Insert member name at cursor position
  const insertMention = (memberName: string) => {
    const textBeforeCursor = description.substring(0, cursorPosition)
    const textAfterCursor = description.substring(cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    const newText = 
      description.substring(0, lastAtIndex) + 
      memberName + ' ' + 
      textAfterCursor
    
    setDescription(newText)
    setShowMentions(false)
    setMentionFilter('')
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus()
      const newCursorPos = lastAtIndex + memberName.length + 1
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Generate tasks using AI
  const handleGenerateTasks = async () => {
    if (!description.trim()) {
      setError('Please enter project details, features, and team information')
      return
    }

    setError('')
    setIsGenerating(true)
    setGeneratedTasks([])

    try {
      const result = await generateTaskAssignments(description)

      if (!result.success) {
        setError(result.error || 'Failed to generate tasks')
        return
      }

      // Convert to preview format with unique IDs
      const tasks: TaskPreview[] = (result.tasks || []).map((task, index) => ({
        ...task,
        id: `preview-${Date.now()}-${index}`,
        approved: false,
        rejected: false
      }))

      setGeneratedTasks(tasks)
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating tasks')
    } finally {
      setIsGenerating(false)
    }
  }

  // Toggle task approval
  const handleToggleApprove = (taskId: string) => {
    setGeneratedTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, approved: !task.approved, rejected: false }
          : task
      )
    )
  }

  // Toggle task rejection
  const handleToggleReject = (taskId: string) => {
    setGeneratedTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, rejected: !task.rejected, approved: false }
          : task
      )
    )
  }

  // Approve all tasks at once
  const handleApproveAll = () => {
    setGeneratedTasks(tasks =>
      tasks.map(task => ({ ...task, approved: true, rejected: false }))
    )
  }

  // Assign approved tasks to Firestore
  const handleAssignTasks = async () => {
    const approvedTasks = generatedTasks.filter(task => task.approved && !task.rejected)

    if (approvedTasks.length === 0) {
      setError('Please approve at least one task before assigning')
      return
    }

    setError('')
    setIsAssigning(true)

    try {
      // Find member UIDs for assignment
      const taskPromises = approvedTasks.map(async task => {
        const member = projectMembers.find(
          m => m.name.toLowerCase() === task.assignedTo.toLowerCase()
        )

        if (!member) {
          throw new Error(`Member "${task.assignedTo}" not found in project team`)
        }

        return taskService.createTask({
          title: task.title,
          projectId,
          assignedTo: member.id,
          assignedToName: member.name,
          deadlineInDays: task.deadlineInDays,
          reminderEnabled: true
        })
      })

      await Promise.all(taskPromises)

      // Clear form and tasks on success
      setDescription('')
      setGeneratedTasks([])
      alert(`✅ Successfully assigned ${approvedTasks.length} tasks!`)
    } catch (err: any) {
      setError(err.message || 'Failed to assign tasks. Please try again.')
    } finally {
      setIsAssigning(false)
    }
  }

  const approvedCount = generatedTasks.filter(t => t.approved).length
  const rejectedCount = generatedTasks.filter(t => t.rejected).length

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Task Assignment
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Describe your project, features, and team. AI will generate and assign tasks automatically.
              </p>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Details & Team Information
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={handleTextChange}
              placeholder={`Example:

Project: E-commerce Dashboard
Features:
- User authentication with JWT
- Product catalog with search
- Shopping cart and checkout
- Admin analytics dashboard

Team:
- @john (backend developer)
- @sarah (frontend developer)
- @mike (UI/UX designer)

Use @ to mention team members...`}
              rows={12}
              disabled={isGenerating || isAssigning}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
            />

            {/* @ Mention Autocomplete Dropdown */}
            {showMentions && filteredMembers.length > 0 && (
              <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 
                dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member.name)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                      flex items-center gap-2 transition-colors"
                  >
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role || 'Team Member'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 
              dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerateTasks}
            disabled={isGenerating || isAssigning || !description.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loading size={16} />
                <span className="ml-2">Generating Tasks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Task Assignments
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated Tasks Preview */}
      {generatedTasks.length > 0 && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Tasks ({generatedTasks.length})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {approvedCount} approved · {rejectedCount} rejected
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleApproveAll}
                  disabled={isAssigning}
                >
                  Approve All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {generatedTasks.map(task => {
                const member = projectMembers.find(
                  m => m.name.toLowerCase() === task.assignedTo.toLowerCase()
                )

                return (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg transition-all ${
                      task.approved
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                        : task.rejected
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 opacity-50'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium ${
                            task.rejected 
                              ? 'text-gray-500 dark:text-gray-500 line-through' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleToggleApprove(task.id)}
                              disabled={isAssigning}
                              className={`p-1.5 rounded-md transition-colors ${
                                task.approved
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              }`}
                              title="Approve task"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleReject(task.id)}
                              disabled={isAssigning}
                              className={`p-1.5 rounded-md transition-colors ${
                                task.rejected
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                              }`}
                              title="Reject task"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {member && (
                            <div className="flex items-center gap-2">
                              <Avatar name={member.name} size="sm" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {member.name}
                              </span>
                            </div>
                          )}
                          <Badge variant="info" size="sm">
                            {task.role}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            📅 {task.deadlineInDays} {task.deadlineInDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              onClick={handleAssignTasks}
              disabled={isAssigning || approvedCount === 0}
              className="w-full"
            >
              {isAssigning ? (
                <>
                  <Loading size={16} />
                  <span className="ml-2">Assigning Tasks...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Approve All & Assign {approvedCount} {approvedCount === 1 ? 'Task' : 'Tasks'}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
