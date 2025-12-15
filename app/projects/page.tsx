'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectList from '@/components/projects/ProjectList'
import ProjectDetail from '@/components/projects/ProjectDetail'
import GlobalStats from '@/components/projects/GlobalStats'
import RecentActivity from '@/components/projects/RecentActivity'
import { Project } from '@/types'

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <DashboardLayout>
      {selectedProject ? (
        <ProjectDetail 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all your projects and track team progress
              </p>
            </div>
          </div>
          
          <GlobalStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProjectList onSelectProject={setSelectedProject} />
            </div>
            
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
