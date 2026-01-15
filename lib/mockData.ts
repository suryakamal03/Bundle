import { Developer, Project, Task, RiskAlert, ChatMessage, Channel, ActivityItem, Flowchart } from '@/types'

export const mockDevelopers: Developer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@bundle.com',
    role: 'Frontend Dev',
    status: 'Active',
    avatar: '/avatars/alice.jpg',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@bundle.com',
    role: 'Backend Dev',
    status: 'Active',
    avatar: '/avatars/bob.jpg',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie.brown@bundle.com',
    role: 'DevOps Engineer',
    status: 'Inactive',
    avatar: '/avatars/charlie.jpg',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana.prince@bundle.com',
    role: 'Fullstack Dev',
    status: 'Active',
    avatar: '/avatars/diana.jpg',
  },
  {
    id: '5',
    name: 'Eve Adams',
    email: 'eve.adams@bundle.com',
    role: 'QA Engineer',
    status: 'Active',
    avatar: '/avatars/eve.jpg',
  },
]

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bundle Frontend',
    description: 'Frontend application for Bundle',
    lead: mockDevelopers[0],
    status: 'Active',
    progress: 75,
  },
  {
    id: '2',
    name: 'Bundle Backend',
    description: 'Backend API for Bundle',
    lead: mockDevelopers[1],
    status: 'Active',
    progress: 60,
  },
  {
    id: '3',
    name: 'AI Chatbot Integration',
    description: 'AI-powered chatbot for task assignment',
    lead: mockDevelopers[0],
    status: 'On Hold',
  },
  {
    id: '4',
    name: 'Deployment Pipeline Refactor',
    description: 'Refactor CI/CD pipeline',
    lead: mockDevelopers[3],
    status: 'Archived',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement user profile editing feature',
    status: 'In Progress',
    priority: 'High',
    assignee: mockDevelopers[0],
    deadline: '2024-08-15',
    dueDate: '2024-08-15',
  },
  {
    id: '2',
    title: 'Refactor authentication module to use JWT',
    status: 'Pending',
    priority: 'High',
    assignee: mockDevelopers[1],
    deadline: '2024-08-20',
    dueDate: '2024-08-20',
  },
  {
    id: '3',
    title: 'Review PR for dashboard UI improvements',
    status: 'Pending',
    priority: 'Medium',
    assignee: mockDevelopers[2],
    deadline: '2024-08-10',
    dueDate: '2024-08-10',
  },
  {
    id: '4',
    title: 'Fix critical bug in payment gateway',
    status: 'Completed',
    priority: 'Low',
    assignee: mockDevelopers[4],
    deadline: '2024-08-05',
    dueDate: '2024-08-05',
  },
  {
    id: '5',
    title: 'Update documentation for API endpoints',
    status: 'To Do',
    priority: 'Low',
    assignee: mockDevelopers[3],
    deadline: '2023-11-05',
    dueDate: '2023-11-05',
  },
  {
    id: '6',
    title: 'Refactor old CSS to TailwindCSS',
    status: 'To Do',
    priority: 'Medium',
    deadline: '2023-11-10',
  },
  {
    id: '7',
    title: 'Prepare Project Demo Presentation',
    status: 'In Review',
    priority: 'High',
    assignee: mockDevelopers[3],
    deadline: '2023-11-03',
  },
  {
    id: '8',
    title: 'Optimize Database Queries for Dashboard',
    status: 'To Do',
    priority: 'High',
    assignee: mockDevelopers[2],
    deadline: '2023-11-18',
  },
]

export const mockRiskAlerts: RiskAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'High Risk: Feature X Deadline Approaching',
    description: 'Task "Implement Feature X" is critical and due in 2 days with no recent activity. This could block the release milestone.',
    assignee: mockDevelopers[0],
    detected: '2023-10-25 10:30 AM',
    suggestions: [
      'Complete remaining parts of the task or reassign the deadline.',
      'Check if team members are blocked or require additional resources for current tasks.',
    ],
  },
  {
    id: '2',
    type: 'warning',
    title: 'Developer Inactivity Detected: Bob Smith',
    description: 'Bob Smith has no logged commit activity or updated tasks for 3 days. This might indicate a blocker or absence.',
    assignee: mockDevelopers[1],
    detected: '2023-10-25 09:00 AM',
    suggestions: [
      'Initiate a check-in with Bob to understand current challenges or roadblocks.',
      'Review recent project activity. Offer assistance or additional resources for current tasks.',
    ],
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Commit Activity: Project Alpha',
    description: 'Project Alpha has significantly lower commit activity compared to previous weeks. Possible slowdown in development progress.',
    detected: '2023-10-24 04:30 PM',
    suggestions: [
      'Review recent tasks and code reviews.',
      'Ensure team members are blocked or require additional resources for current tasks.',
    ],
  },
  {
    id: '4',
    type: 'healthy',
    title: 'Design Review for UI/UX complete',
    description: 'The design review for the new UI/UX module has been successfully completed ahead of schedule.',
    assignee: mockDevelopers[3],
    detected: '2023-10-23 02:00 PM',
    suggestions: ['No immediate action required. Monitor integration tasks for the module. Consider starting the implementation phase.'],
  },
  {
    id: '5',
    type: 'critical',
    title: 'Critical Inactivity: Database Migration',
    description: 'No progress recorded on the Critical Database Migration project for 6 days. This is a severe blocker.',
    assignee: mockDevelopers[1],
    detected: '2023-10-22 11:00 AM',
    suggestions: [
      'Immediate intervention needed. Assemble core team to identify and escalate to project lead.',
    ],
  },
  {
    id: '6',
    type: 'warning',
    title: 'Stagnant Branch: Bug Fixes',
    description: 'The "bug-fixes-issue-branch" branch has now commits in 48 hours. This fix is pending deployment.',
    assignee: mockDevelopers[4],
    detected: '2023-10-21 05:00 PM',
    suggestions: [
      'Contact the assigned developer to check status. Offer assistance or additional resources if required for additional resources for current tasks.',
    ],
  },
]

export const mockChannels: Channel[] = [
  { id: '1', name: 'general', memberCount: 3 },
  { id: '2', name: 'dev-updates', memberCount: 5 },
  { id: '3', name: 'ai-support', memberCount: 2 },
  { id: '4', name: 'random', memberCount: 4 },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: mockDevelopers[0],
    content: 'Good morning team! Any updates on the backend API integration for the user profiles module?',
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    sender: mockDevelopers[1],
    content: "Good morning! I finished the initial setup. Robert is reviewing the PR now. Should be merged by noon.",
    timestamp: '10:02 AM',
  },
  {
    id: '3',
    sender: mockDevelopers[2],
    content: 'Confirming, just started the review. Looking good so far, Jane!',
    timestamp: '10:05 AM',
  },
  {
    id: '4',
    sender: mockDevelopers[0],
    content: 'Excellent, thanks for the quick turnaround! @AI Assistant, can you summarize the current sprint velocity based on completed tasks this week?',
    timestamp: '10:08 AM',
  },
  {
    id: '5',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      email: 'ai@bundle.com',
      role: 'AI Assistant',
    },
    content: "Based on tasks marked as 'completed' this week, the team's sprint velocity is currently tracking at 85% of the projected target. Key contributors are John and Jane with 5 and 4 completed tasks respectively. There are 2 overdue tasks that might impact the final velocity.",
    timestamp: '10:10 AM',
    isBot: true,
  },
]

export const mockActivityItems: ActivityItem[] = [
  {
    id: '1',
    type: 'task',
    description: 'John Doe updated task "Implement user profile" to Completed.',
    timestamp: '2 hours ago',
    user: mockDevelopers[0],
  },
  {
    id: '2',
    type: 'commit',
    description: 'Jane Doe pushed 3 commits to feature/dashboard v2.',
    timestamp: '3 hours ago',
    user: mockDevelopers[1],
  },
  {
    id: '3',
    type: 'issue',
    description: 'AI detected a potential risk in project Bundle Core.',
    timestamp: 'Yesterday',
  },
  {
    id: '4',
    type: 'task',
    description: 'Admin assigned "Review PR #123" to Alex Smith.',
    timestamp: '2 days ago',
  },
]

export const mockFlowcharts: Flowchart[] = [
  { id: '1', name: 'User Onboard' },
  { id: '2', name: 'Payment Gate' },
  { id: '3', name: 'Bug Reporting' },
  { id: '4', name: 'Feature Relea' },
]
