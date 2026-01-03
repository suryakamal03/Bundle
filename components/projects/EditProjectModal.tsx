'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { X } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface EditProjectModalProps {
  projectId: string
  projectName: string
  projectDescription: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditProjectModal({ 
  projectId, 
  projectName, 
  projectDescription, 
  onClose, 
  onSuccess 
}: EditProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: projectName,
    description: projectDescription
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)

    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        name: formData.name.trim(),
        description: formData.description.trim()
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Project</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Project Name"
              type="text"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter project description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
