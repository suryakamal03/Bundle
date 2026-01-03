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
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
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
                    setDeleteConfirm(null)
                    setMenuOpen(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => handleDeleteProject(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Projects</h2>
            <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No projects found matching your search' : 'No projects yet. Create your first project!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const isLead = user && project.lead && user.uid === project.lead.id

                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-[#f5f5f5] dark:hover:bg-[#353535] transition-all cursor-pointer relative"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                    </div>
                    
                    {project.lead && (
                      <div className="flex items-center gap-2">
                        <Avatar name={project.lead.name} size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">{project.lead.name}</span>
                      </div>
                    )}

                    {isLead && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(menuOpen === project.id ? null : project.id)
                          }}
                          aria-label="Project options"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {menuOpen === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditProject(project)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(project.id)
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
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
