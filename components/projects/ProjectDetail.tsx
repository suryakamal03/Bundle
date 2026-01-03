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
import { ChevronLeft, MoreVertical, Users, GitBranch, MessageSquare, Bot, Webhook } from 'lucide-react'
import { Project, User } from '@/types'
import { inviteService } from '@/backend/projects/inviteService'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'github' | 'team' | 'chat' | 'ai-assigner' | 'webhook'>('tasks')
  const [projectMembers, setProjectMembers] = useState<User[]>([])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={onBack} className="p-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        </div>
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
