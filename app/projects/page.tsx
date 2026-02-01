'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectList from '@/components/projects/ProjectList'
import ProjectDetail from '@/components/projects/ProjectDetail'
import RecentActivity from '@/components/projects/RecentActivity'
import CreateProjectModal from '@/components/projects/CreateProjectModal'
import { Project } from '@/types'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Plus } from 'lucide-react'

import ProjectsSkeleton from '@/components/ui/ProjectsSkeleton'

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get cached project data from sessionStorage
  const getCachedProject = () => {
    if (typeof window === 'undefined') return null
    const cached = sessionStorage.getItem('project_cache')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        // Use cache if less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data
        }
      } catch (e) {
        return null
      }
    }
    return null
  }
  
  const cachedProject = getCachedProject()
  const [selectedProject, setSelectedProject] = useState<Project | null>(cachedProject)
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'>('tasks')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(!cachedProject)

  // Load project from URL or localStorage on mount and refresh
  useEffect(() => {
    const loadProject = async () => {
      // First check URL params
      let projectId = searchParams.get('projectId')
      let tab = searchParams.get('tab') as typeof activeTab
      
      // If not in URL, check localStorage
      if (!projectId) {
        const savedProjectId = localStorage.getItem('lastSelectedProjectId')
        const savedTab = localStorage.getItem('lastSelectedProjectTab') as typeof activeTab
        
        if (savedProjectId) {
          projectId = savedProjectId
          tab = savedTab || 'tasks'
        }
      }
      
      if (projectId) {
        try {
          const projectDoc = await getDoc(doc(db, 'projects', projectId))
          if (projectDoc.exists()) {
            const projectData = projectDoc.data()
            const project: Project = {
              id: projectDoc.id,
              name: projectData.name,
              description: projectData.description,
              status: projectData.status,
              progress: projectData.progress,
              githubOwner: projectData.githubOwner,
              githubRepo: projectData.githubRepo,
              githubRepoUrl: projectData.githubRepoUrl,
              lead: null
            }
            setSelectedProject(project)
            
            // Cache the project data
            sessionStorage.setItem('project_cache', JSON.stringify({
              data: project,
              timestamp: Date.now()
            }))
            
            // Restore tab if specified
            if (tab && ['tasks', 'github', 'team', 'chat', 'ai-assigner', 'webhook'].includes(tab)) {
              setActiveTab(tab)
            }
            
            // Update URL to reflect the state
            const params = new URLSearchParams()
            params.set('projectId', project.id)
            params.set('tab', tab || 'tasks')
            router.replace(`/projects?${params.toString()}`, { scroll: false })
          }
        } catch (error) {
          console.error('Failed to load project:', error)
        }
      }
      setIsLoading(false)
    }
    
    loadProject()
  }, [searchParams])

  // Update URL when project or tab changes
  const handleSelectProject = (project: Project | null) => {
    setSelectedProject(project)
    
    if (project) {
      // Save to localStorage
      localStorage.setItem('lastSelectedProjectId', project.id)
      localStorage.setItem('lastSelectedProjectTab', activeTab)
      
      // Update URL with project ID and current tab
      const params = new URLSearchParams()
      params.set('projectId', project.id)
      params.set('tab', activeTab)
      router.push(`/projects?${params.toString()}`, { scroll: false })
    } else {
      // Clear localStorage and URL params when no project selected
      localStorage.removeItem('lastSelectedProjectId')
      localStorage.removeItem('lastSelectedProjectTab')
      router.push('/projects', { scroll: false })
    }
  }

  // Update URL when tab changes
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    
    if (selectedProject) {
      // Save to localStorage
      localStorage.setItem('lastSelectedProjectTab', tab)
      
      const params = new URLSearchParams()
      params.set('projectId', selectedProject.id)
      params.set('tab', tab)
      router.push(`/projects?${params.toString()}`, { scroll: false })
    }
  }

  const handleActivityClick = async (projectId: string) => {
    try {
      // Fetch the project data
      const projectDoc = await getDoc(doc(db, 'projects', projectId))
      if (projectDoc.exists()) {
        const projectData = projectDoc.data()
        const project: Project = {
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          progress: projectData.progress,
          githubOwner: projectData.githubOwner,
          githubRepo: projectData.githubRepo,
          githubRepoUrl: projectData.githubRepoUrl,
          lead: null
        }
        setSelectedProject(project)
        setActiveTab('github')
        
        // Save to localStorage
        localStorage.setItem('lastSelectedProjectId', project.id)
        localStorage.setItem('lastSelectedProjectTab', 'github')
        
        // Update URL
        const params = new URLSearchParams()
        params.set('projectId', project.id)
        params.set('tab', 'github')
        router.push(`/projects?${params.toString()}`, { scroll: false })
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <ProjectsSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-7rem)] overflow-hidden">
        {/* Left Sidebar - Projects & Activity - Fixed, no scroll on parent */}
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          <ProjectList onSelectProject={handleSelectProject} selectedProject={selectedProject} />
          <RecentActivity onActivityClick={handleActivityClick} />
        </div>

        {/* Right Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onBack={() => handleSelectProject(null)}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-[#eaeaea] mb-2">Select a project</h2>
                <p className="text-sm text-gray-600 dark:text-[#9a9a9a] mb-6">Choose a project from the left to view details</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#151517] hover:bg-gray-200 dark:hover:bg-[#1c1c1f] border border-gray-300 dark:border-[#26262a] text-gray-900 dark:text-[#eaeaea] text-sm font-medium rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            // Optionally reload projects list here
          }}
        />
      )}
    </DashboardLayout>
  )
}
