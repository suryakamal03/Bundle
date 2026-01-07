'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Plus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Project } from '@/types'
import { projectService, ProjectData } from '@/backend/projects/projectService'
import { useAuth } from '@/backend/auth/authContext'
import CreateProjectModal from './CreateProjectModal'
import EditProjectModal from './EditProjectModal'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
  selectedProject?: Project | null
}

export default function ProjectList({ onSelectProject, selectedProject }: ProjectListProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Array<Project>>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadProjects = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userProjects = await projectService.getUserProjects(user.uid)
      
      const projectsWithLeads = await Promise.all(
        userProjects.map(async (proj) => {
          let leadUser = null
          if (proj.createdBy) {
            const userDoc = await getDoc(doc(db, 'users', proj.createdBy))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              leadUser = {
                id: userDoc.id,
                name: userData.name,
                email: userData.email,
                role: 'Project Lead'
              }
            }
          }

          return {
            id: proj.id,
            name: proj.name,
            description: proj.description,
            lead: leadUser,
            status: proj.status,
            progress: proj.progress,
            githubOwner: proj.githubOwner,
            githubRepo: proj.githubRepo,
            githubRepoUrl: proj.githubRepoUrl
          }
        })
      )

      setProjects(projectsWithLeads)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [user])

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(null)
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProjectCreated = () => {
    loadProjects()
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, 'projects', projectId))
      setDeleteConfirm(null)
      setMenuOpen(null)
      loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  return (
    <>
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {editProject && (
        <EditProjectModal
          projectId={editProject.id}
          projectName={editProject.name}
          projectDescription={editProject.description || ''}
          onClose={() => {
            setEditProject(null)
            setMenuOpen(null)
          }}
          onSuccess={() => {
            loadProjects()
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151517] border border-gray-300 dark:border-[#26262a] rounded-xl p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-[#eaeaea] mb-4">Delete Project</h2>
              <p className="text-gray-600 dark:text-[#9a9a9a] mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will remove all tasks, files, and data associated with this project.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  className="flex-1 bg-gray-100 dark:bg-[#1c1c1f] border-gray-300 dark:border-[#26262a] text-gray-900 dark:text-[#eaeaea] hover:bg-gray-200 dark:hover:bg-[#26262a]"
                  onClick={() => {
                    setDeleteConfirm(null)
                    setMenuOpen(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleDeleteProject(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between px-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-[#eaeaea]">Projects</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#1c1c1f] rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-[#9a9a9a]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-[#9a9a9a]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-[#26262a] bg-white dark:bg-[#0f0f10] text-gray-900 dark:text-[#eaeaea] placeholder:text-gray-500 dark:placeholder:text-[#9a9a9a] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-white/20 focus:border-transparent transition-all text-xs"
            />
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-gray-600 dark:text-[#9a9a9a]">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {filteredProjects.map((project) => {
              const isLead = user && project.lead && user.uid === project.lead.id
              const isSelected = selectedProject?.id === project.id

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all group relative ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-white/10 text-gray-900 dark:text-[#eaeaea]' 
                      : 'hover:bg-gray-50 dark:hover:bg-[#1c1c1f] text-gray-700 dark:text-[#9a9a9a]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{project.name}</h3>
                  </div>
                  
                  {isLead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(menuOpen === project.id ? null : project.id)
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-[#26262a] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isLead && menuOpen === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#151517] border border-gray-200 dark:border-[#26262a] rounded-lg shadow-xl z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditProject(project)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-900 dark:text-[#eaeaea] hover:bg-gray-100 dark:hover:bg-[#1c1c1f] transition-colors text-xs rounded-t-lg"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(project.id)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1c1c1f] transition-colors text-xs rounded-b-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
