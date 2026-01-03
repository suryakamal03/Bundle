'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProjectTasks from '@/components/projects/ProjectTasks'
import ProjectGitHub from '@/components/projects/ProjectGitHub'
import ProjectTeam from '@/components/projects/ProjectTeam'
import ProjectGroupChat from '@/components/projects/ProjectGroupChat'
import ProjectAssignerAI from '@/components/projects/ProjectAssignerAI'
import WebhookConfig from '@/components/projects/WebhookConfig'
import EditProjectModal from '@/components/projects/EditProjectModal'
import { ChevronLeft, MoreVertical, Users, GitBranch, MessageSquare, Bot, Webhook, Edit2, Trash2 } from 'lucide-react'
import { Project, User } from '@/types'
import { inviteService } from '@/backend/projects/inviteService'
import { useAuth } from '@/backend/auth/authContext'
import { doc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'>('tasks')
  const [projectMembers, setProjectMembers] = useState<User[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isLead, setIsLead] = useState(false)
  const [updatedProject, setUpdatedProject] = useState(project)

  // Load project members for AI task assignment
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const members = await inviteService.getProjectMembers(project.id)
        setProjectMembers(members as User[])
      } catch (error) {
        console.error('Failed to load project members:', error)
      }
    }
    loadMembers()
  }, [project.id])

  // Check if current user is project lead
  useEffect(() => {
    const checkLead = async () => {
      if (!user) return
      try {
        const projectDoc = await getDoc(doc(db, 'projects', project.id))
        if (projectDoc.exists()) {
          const projectData = projectDoc.data()
          setIsLead(user.uid === projectData.createdBy)
          setUpdatedProject({
            ...project,
            name: projectData.name || project.name,
            description: projectData.description || project.description
          })
        }
      } catch (error) {
        console.error('Failed to check project lead:', error)
      }
    }
    checkLead()
  }, [user, project.id])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false)
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  const handleDeleteProject = async () => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'projects', project.id))
      onBack()
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  const handleProjectUpdated = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', project.id))
      if (projectDoc.exists()) {
        const projectData = projectDoc.data()
        setUpdatedProject({
          ...updatedProject,
          name: projectData.name || updatedProject.name,
          description: projectData.description || updatedProject.description
        })
      }
    } catch (error) {
      console.error('Failed to reload project:', error)
    }
  }

  return (
    <div className="space-y-6">
      {showEditModal && (
        <EditProjectModal
          projectId={project.id}
          projectName={updatedProject.name}
          projectDescription={updatedProject.description || ''}
          onClose={() => {
            setShowEditModal(false)
            setMenuOpen(false)
          }}
          onSuccess={handleProjectUpdated}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Delete Project</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will remove all tasks, files, and data associated with this project.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    setDeleteConfirm(false)
                    setMenuOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={handleDeleteProject}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack} className="p-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{updatedProject.name}</h1>
        </div>
        
        {isLead && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              aria-label="Project options"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditModal(true)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(true)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'github'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          GitHub Activity
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'team'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Team
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Group Chat
        </button>
        <button
          onClick={() => setActiveTab('ai-assigner')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ai-assigner'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          Project Assigner AI
        </button>
        <button
          onClick={() => setActiveTab('webhook')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'webhook'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Webhook Setup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          {activeTab === 'tasks' && <ProjectTasks projectId={project.id} />}
          {activeTab === 'github' && <ProjectGitHub projectId={project.id} />}
          {activeTab === 'team' && <ProjectTeam projectId={project.id} />}
          {activeTab === 'chat' && <ProjectGroupChat projectId={project.id} />}
          {activeTab === 'ai-assigner' && (
            <ProjectAssignerAI 
              projectId={project.id}
              projectMembers={projectMembers}
            />
          )}
          {activeTab === 'webhook' && (
            <WebhookConfig 
              githubOwner={project.githubOwner || ''} 
              githubRepo={project.githubRepo || ''} 
            />
          )}
        </div>
      </div>
    </div>
  )
}
