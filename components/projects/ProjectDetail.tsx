'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProjectTasks from '@/components/projects/ProjectTasks'
import ProjectGitHub from '@/components/projects/ProjectGitHub'
import ProjectTeam from '@/components/projects/ProjectTeam'
import ProjectFlowchart from '@/components/projects/ProjectFlowchart'
import WebhookConfig from '@/components/projects/WebhookConfig'
import { ChevronLeft, MoreVertical, Users, GitBranch, Workflow, MessageSquare, Webhook } from 'lucide-react'
import { Project } from '@/types'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'flowchart' | 'webhook'>('tasks')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Projects
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
              <div className="flex items-center gap-3">
                {project.lead && (
                  <div className="flex items-center gap-2">
                    <Avatar name={project.lead.name} size="sm" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Project Lead</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.lead.name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'Active' ? 'success' : project.status === 'On Hold' ? 'warning' : 'info'}>
                    {project.status}
                  </Badge>
                  {project.health && (
                    <Badge variant={project.health === 'Healthy' ? 'success' : project.health === 'Warning' ? 'warning' : 'danger'}>
                      Health: {project.health}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" aria-label="More options">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{project.progress || 0}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

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
          onClick={() => setActiveTab('flowchart')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'flowchart'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Flowchart
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
          {activeTab === 'flowchart' && <ProjectFlowchart projectId={project.id} />}
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
