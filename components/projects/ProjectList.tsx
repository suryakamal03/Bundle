'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Plus, Search, Grid, List, MoreVertical } from 'lucide-react'
import { Project } from '@/types'
import { projectService, ProjectData } from '@/backend/projects/projectService'
import { useAuth } from '@/backend/auth/authContext'
import CreateProjectModal from './CreateProjectModal'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Array<Project>>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProjectCreated = () => {
    loadProjects()
  }

  return (
    <>
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
      
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No projects found matching your search' : 'No projects yet. Create your first project!'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {project.lead && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar name={project.lead.name} size="sm" />
                    <span className="text-sm text-gray-600">{project.lead.name}</span>
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={project.status === 'Active' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                    {project.status}
                  </Badge>
                  {project.health && (
                    <Badge variant={project.health === 'Healthy' ? 'success' : project.health === 'Warning' ? 'warning' : 'danger'}>
                      {project.health}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                
                {project.lead && (
                  <div className="flex items-center gap-2">
                    <Avatar name={project.lead.name} size="sm" />
                    <span className="text-sm text-gray-600 hidden md:block">{project.lead.name}</span>
                  </div>
                )}

                <div className="w-32 hidden lg:block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <Badge variant={project.status === 'Active' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </>
  )
}
