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
import { ChevronLeft, MoreVertical, Users, GitBranch, MessageSquare, Bot, Webhook, Edit2, Trash2, List, LayoutGrid, Calendar as CalendarIcon, BarChart3, Table, Filter, UserCircle, ChevronDown, Plus } from 'lucide-react'
import { Project, User } from '@/types'
import { inviteService } from '@/backend/projects/inviteService'
import { useAuth } from '@/backend/auth/authContext'
import { doc, deleteDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  activeTab?: 'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'
  onTabChange?: (tab: 'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook') => void
}

export default function ProjectDetail({ project, onBack, activeTab: externalActiveTab, onTabChange }: ProjectDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'>(externalActiveTab || externalActiveTab || 'tasks')
  const [projectMembers, setProjectMembers] = useState<User[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [isLead, setIsLead] = useState(false)
  const [updatedProject, setUpdatedProject] = useState(project)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)

  // Sync external activeTab changes
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab)
    }
  }, [externalActiveTab])

  // Handle tab change
  const handleTabChange = (tab: 'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook') => {
    setActiveTab(tab)
    if (onTabChange) {
      onTabChange(tab)
    }
  }

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
      // Delete all related data in batches
      const batch = writeBatch(db)
      
      // Delete all tasks associated with this project
      const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', project.id))
      const tasksSnapshot = await getDocs(tasksQuery)
      tasksSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Delete all project members
      const membersQuery = query(collection(db, 'projectMembers'), where('projectId', '==', project.id))
      const membersSnapshot = await getDocs(membersQuery)
      membersSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Delete all GitHub activities
      const activitiesQuery = query(collection(db, 'githubActivity'), where('projectId', '==', project.id))
      const activitiesSnapshot = await getDocs(activitiesQuery)
      activitiesSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Commit all deletions
      await batch.commit()
      
      // Finally delete the project itself
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
    <div className="flex flex-col h-full">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#151517] border border-[#26262a] rounded-xl p-6">
            <div>
              <h2 className="text-xl font-semibold text-[#eaeaea] mb-4">Delete Project</h2>
              <p className="text-[#9a9a9a] mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will remove all tasks, files, and data associated with this project.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1 bg-[#1c1c1f] border-[#26262a] text-[#eaeaea] hover:bg-[#26262a]"
                  onClick={() => {
                    setDeleteConfirm(false)
                    setMenuOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteProject}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-4 pb-4">
        {/* Top Bar with Project Name */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#eaeaea]">{updatedProject.name}</h1>
          
          {isLead && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                aria-label="Project options"
                className="p-2 hover:bg-[#1c1c1f] rounded-md transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#9a9a9a]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#151517] border border-[#26262a] rounded-lg shadow-xl z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEditModal(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#eaeaea] hover:bg-[#1c1c1f] transition-colors first:rounded-t-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 hover:bg-[#1c1c1f] transition-colors last:rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Switcher Bar (ClickUp style) - Now in same line with Add Task button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-[#0f0f10] border border-[#26262a] rounded-lg p-1">
            <button
              onClick={() => handleTabChange('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'tasks'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => handleTabChange('github')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'github'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              GitHub
            </button>
            <button
              onClick={() => handleTabChange('team')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'team'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <Users className="w-4 h-4" />
              Team
            </button>
            <button
              onClick={() => handleTabChange('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => handleTabChange('ai-assigner')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'ai-assigner'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI
            </button>
            <button
              onClick={() => handleTabChange('webhook')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'webhook'
                  ? 'bg-[#151517] text-[#eaeaea]'
                  : 'text-[#9a9a9a] hover:text-[#eaeaea]'
              }`}
            >
              <Webhook className="w-4 h-4" />
              Webhook
            </button>
          </div>
          
          {/* Add Task Button - Only visible on tasks tab */}
          {activeTab === 'tasks' && (
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tasks' && <ProjectTasks projectId={project.id} showAddTaskModal={showAddTaskModal} setShowAddTaskModal={setShowAddTaskModal} />}
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
  )
}
