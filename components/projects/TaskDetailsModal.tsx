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
        </div>
      </div>
    </div>
  )
}
