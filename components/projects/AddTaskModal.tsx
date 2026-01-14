'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { taskService } from '@/backend/tasks/taskService'
import { inviteService } from '@/backend/projects/inviteService'
import { getUserSettings } from '@/backend/settings/userSettingsService'
import { useAuth } from '@/backend/auth/authContext'

interface AddTaskModalProps {
  projectId: string
  onClose: () => void
  onTaskCreated: () => void
}

interface ProjectMember {
  id: string
  name: string
  email: string
  role?: string
}

export default function AddTaskModal({ projectId, onClose, onTaskCreated }: AddTaskModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [error, setError] = useState('')
  const [autoReminder, setAutoReminder] = useState(true)

  useEffect(() => {
    loadProjectMembers()
    loadUserSettings()
  }, [projectId])

  const loadUserSettings = async () => {
    if (!user?.uid) return
    try {
      const settings = await getUserSettings(user.uid)
      setAutoReminder(settings.autoReminder)
    } catch (err) {
      console.error('Failed to load user settings:', err)
    }
  }

  const loadProjectMembers = async () => {
    try {
      setLoadingMembers(true)
      const membersData = await inviteService.getProjectMembers(projectId)
      setMembers(membersData)
    } catch (err) {
      setError('Failed to load project members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    if (!assignedTo) {
      setError('Please assign the task to a team member')
      return
    }

    setLoading(true)

    try {
      const selectedMember = members.find(m => m.id === assignedTo)
      
      // Calculate days from now if deadline is set
      let deadlineInDays: number | undefined
      if (deadline) {
        const selectedDate = new Date(deadline)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)
        const diffTime = selectedDate.getTime() - today.getTime()
        deadlineInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      await taskService.createTask({
        title: title.trim(),
        projectId,
        assignedTo,
        assignedToName: selectedMember?.name || '',
        deadlineInDays,
        reminderEnabled: autoReminder
      })

      // Clear dashboard cache so new task appears immediately
      const cacheKey = `dashboard_cache_${assignedTo}`
      sessionStorage.removeItem(cacheKey)

      onTaskCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#151517] rounded-lg shadow-xl max-w-md w-full p-5 border border-[#26262a]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#eaeaea]">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-[#9a9a9a] hover:text-[#eaeaea] transition-colors"
            disabled={loading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            type="text"
            placeholder="Design dashboard UI"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1.5">
              Assign To
            </label>
            {loadingMembers ? (
              <div className="text-sm text-[#9a9a9a]">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-red-400">No project members found</div>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={loading}
                required
                aria-label="Assign task to team member"
                className="w-full px-3 py-2 border border-[#26262a] bg-[#0f0f10] text-[#eaeaea] rounded-md focus:outline-none focus:border-[#26262a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-[#0f0f10]">Select a member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id} className="bg-[#0f0f10]">
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1.5">
              Task Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-[#26262a] bg-[#0f0f10] text-[#eaeaea] rounded-md focus:outline-none focus:border-[#26262a] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select task deadline date"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0f0f10] hover:bg-[#1c1c1f] border border-[#26262a] text-[#eaeaea] text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingMembers}
              className="flex-1 px-4 py-2 bg-[#1c1c1f] hover:bg-[#26262a] border border-[#26262a] text-[#eaeaea] text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
