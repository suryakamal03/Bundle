'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { X } from 'lucide-react'
import { projectService } from '@/backend/projects/projectService'
import { useAuth } from '@/backend/auth/authContext'

interface CreateProjectModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubRepoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('User not authenticated')
      return
    }

    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }

    if (!formData.githubRepoUrl.trim()) {
      setError('GitHub repository URL is required')
      return
    }

    const githubDetails = projectService.parseGithubUrl(formData.githubRepoUrl)
    if (!githubDetails) {
      setError('Invalid GitHub URL. Use format: https://github.com/owner/repo')
      return
    }

    setLoading(true)

    try {
      const result = await projectService.createProject({
        name: formData.name,
        description: formData.description,
        githubRepoUrl: formData.githubRepoUrl,
        memberEmails: [],
        createdBy: user.uid
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#151517] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#26262a]">
        <div className="p-5 border-b border-[#26262a] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#eaeaea]">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-[#9a9a9a] hover:text-[#eaeaea] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Project Name"
            type="text"
            placeholder="My Awesome Project"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#eaeaea] mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-[#26262a] bg-[#0f0f10] text-[#eaeaea] placeholder:text-[#9a9a9a] rounded-md focus:outline-none focus:border-[#26262a] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <Input
            label="GitHub Repository URL"
            type="url"
            placeholder="https://github.com/owner/repository"
            value={formData.githubRepoUrl}
            onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
            disabled={loading}
            required
          />

          <div className="flex items-center gap-3 pt-2">
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1c1c1f] hover:bg-[#26262a] border border-[#26262a] text-[#eaeaea] text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
