'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectList from '@/components/projects/ProjectList'
import ProjectDetail from '@/components/projects/ProjectDetail'
import RecentActivity from '@/components/projects/RecentActivity'
import CreateProjectModal from '@/components/projects/CreateProjectModal'
import { Project } from '@/types'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'>('tasks')
  const [showCreateModal, setShowCreateModal] = useState(false)

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
        setActiveTab('github') // Switch to GitHub tab
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-full">
        {/* Left Sidebar - Projects & Activity */}
        <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
          <ProjectList onSelectProject={setSelectedProject} selectedProject={selectedProject} />
          <RecentActivity onActivityClick={handleActivityClick} />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </DashboardLayout>
  )
}
