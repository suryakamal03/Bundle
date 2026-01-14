'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Task } from '@/types'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TaskDetailsModalProps {
  task: Task
  onClose: () => void
  onUpdate: () => void
}

export default function TaskDetailsModal({ task, onClose, onUpdate }: TaskDetailsModalProps) {
  const [reminderEnabled, setReminderEnabled] = useState(task.reminderEnabled ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (date: any) => {
    if (!date) return 'No deadline set'
    
    let dateObj: Date
    if (date.toDate) {
      dateObj = date.toDate()
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleReminderToggle = async (enabled: boolean) => {
    setLoading(true)
    setError('')

    try {
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        reminderEnabled: enabled,
        reminderSent: false
      })
      setReminderEnabled(enabled)
      
      // Clear dashboard cache for the assigned user
      const cacheKey = `dashboard_cache_${task.assignedTo}`
      sessionStorage.removeItem(cacheKey)
      
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#151517] rounded-lg shadow-xl max-w-lg w-full p-6 border border-[#26262a]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#eaeaea]">Task Details</h2>
          <button
            onClick={onClose}
            className="text-[#9a9a9a] hover:text-[#eaeaea]"
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1">
              Task Title
            </label>
            <p className="text-[#eaeaea]">{task.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1">
              Assigned To
            </label>
            <p className="text-[#eaeaea]">{task.assignedToName || 'Unassigned'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1">
              Status
            </label>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
              task.status === 'Done' ? 'bg-green-500/10 text-green-400' :
              task.status === 'In Review' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {task.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1">
              Deadline
            </label>
            <p className="text-[#eaeaea]">{formatDate(task.deadlineAt)}</p>
          </div>

          {task.deadlineAt && (
            <div className="border-t border-[#26262a] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[#eaeaea]">
                    Remind Me
                  </label>
                  <p className="text-xs text-[#9a9a9a] mt-1">
                    Get an email reminder one day before the deadline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReminderToggle(!reminderEnabled)}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderEnabled ? 'bg-white' : 'bg-[#26262a]'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Toggle reminder"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
