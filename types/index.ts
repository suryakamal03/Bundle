export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: 'Active' | 'Inactive'
  githubUsername?: string
  displayName?: string
}

export interface Developer extends User {
  githubUrl?: string
  skills?: string[]
  preferredWorkTypes?: string[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'To Do' | 'In Review' | 'Done'
  assignedTo: string
  assignedToName?: string
  projectId: string
  keywords: string[]
  createdAt: any
  updatedAt: any
}

export interface Project {
  id: string
  name: string
  description?: string
  lead?: User
  status: 'Active' | 'On Hold' | 'Archived'
  progress?: number
  health?: 'Warning' | 'Healthy' | 'Critical'
  githubOwner?: string
  githubRepo?: string
  githubRepoUrl?: string
}

export interface RiskAlert {
  id: string
  type: 'critical' | 'warning' | 'healthy'
  title: string
  description: string
  assignee?: User
  detected: string
  suggestions: string[]
}

export interface ChatMessage {
  id: string
  sender: User
  content: string
  timestamp: string
  isBot?: boolean
}

export interface Channel {
  id: string
  name: string
  memberCount?: number
}

export interface ActivityItem {
  id: string
  type: 'commit' | 'pr' | 'issue' | 'task' | 'chat'
  description: string
  timestamp: string
  user?: User
  metadata?: Record<string, unknown>
}

export interface Flowchart {
  id: string
  name: string
  preview?: string
  createdAt?: string
}
