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

      onTaskCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            {loadingMembers ? (
              <div className="text-sm text-gray-500">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-red-500">No project members found</div>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={loading}
                required
                aria-label="Assign task to team member"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              aria-label="Select task deadline date"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || loadingMembers}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
