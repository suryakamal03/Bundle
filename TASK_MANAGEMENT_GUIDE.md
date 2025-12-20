# Task Management Quick Reference

## Usage Guide

### For Project Managers

**Creating Tasks**
1. Navigate to Projects → Select Project → Tasks tab
2. Click "Add Task" button
3. Enter task title (e.g., "Implement user authentication")
4. Select team member from dropdown
5. Click "Create Task"
6. Task appears in "To Do" column

**Viewing Tasks**
- Click "All Members" to see all tasks
- Click a member name to filter their tasks only
- Tasks are organized in 3 columns: To Do, In Review, Done

### For Developers

**Setting Up Your Profile**
1. Sign up or log in to Ontrackr
2. Enter your Display Name when prompted
3. Enter your GitHub Username (must match your GitHub account exactly)
4. Click "Complete Profile"

**Task Workflow**

Your tasks will automatically progress through stages based on your GitHub activity:

**Stage 1: To Do**
- Task is assigned to you
- You begin working on it
- Write code that relates to the task

**Stage 2: In Review**
- Commit your code with a message containing task keywords
- Example: Task "Design dashboard UI" → Commit "Updated dashboard design layout"
- System matches "dashboard" keyword
- Task automatically moves to In Review

**Stage 3: Done**
- Create a Pull Request with keywords in title or description
- Merge PR to main or master branch
- System detects merge and matches keywords
- Task automatically moves to Done

### For Administrators

**Firestore Collections Setup**

Required collections:
- `tasks` - Stores all tasks
- `users` - Stores user profiles with GitHub usernames
- `project_members` - Maps users to projects
- `github_events` - Stores webhook events

**GitHub Webhook Setup**
1. Go to GitHub repository Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/github`
3. Content type: `application/json`
4. Select events: Push, Pull requests
5. Save webhook

**Testing Task Automation**
1. Create a test task with title "Test feature implementation"
2. Assign to yourself
3. Make a commit with message "Implemented test feature"
4. Check if task moved to In Review
5. Create PR with "test feature" in title
6. Merge to main branch
7. Check if task moved to Done

## API Reference

### Task Service Methods

```typescript
taskService.createTask(data: CreateTaskData): Promise<string>
taskService.getTasksByProject(projectId: string): Promise<Task[]>
taskService.getTasksByMember(projectId: string, memberId: string): Promise<Task[]>
taskService.subscribeToProjectTasks(projectId: string, callback: (tasks: Task[]) => void): Unsubscribe
taskService.updateTaskStatus(taskId: string, status: 'To Do' | 'In Review' | 'Done'): Promise<void>
taskService.matchTaskForCommit(projectId: string, commitMessage: string, githubUsername: string): Promise<void>
taskService.matchTaskForMerge(projectId: string, prTitle: string, prBody: string, githubUsername: string): Promise<void>
```

### Component Props

**ProjectTasks**
```typescript
<ProjectTasks projectId={string} />
```

**AddTaskModal**
```typescript
<AddTaskModal 
  projectId={string}
  onClose={() => void}
  onTaskCreated={() => void}
/>
```

**UserProfileModal**
```typescript
<UserProfileModal 
  userId={string}
  onComplete={() => void}
/>
```

## Troubleshooting

### Task Not Moving to In Review
- Verify GitHub username in Ontrackr matches GitHub commit author
- Check commit message contains at least one keyword from task title
- Keywords must be 3+ characters, not common words (the, and, etc.)
- User must be member of the project in `project_members` collection

### Task Not Moving to Done
- PR must be merged (not just closed)
- PR must target main or master branch
- PR title or body must contain task keywords
- GitHub username must match assigned team member

### User Profile Modal Not Showing
- Check if user document exists in Firestore
- Verify `displayName` or `githubUsername` fields are empty
- Ensure `AuthProvider` wraps the entire app
- Check browser console for errors

### Real-time Updates Not Working
- Verify Firestore rules allow read access
- Check network tab for WebSocket connections
- Ensure component properly subscribes to task changes
- Confirm project ID is passed correctly

## Best Practices

### Task Naming
- Use descriptive titles: "Implement user login" not "Login"
- Include key technical terms: "Add Redis caching layer"
- Avoid generic words: Use "authentication" not "stuff"

### Commit Messages
- Reference task keywords explicitly
- Example: Task "Add email notifications" → Commit "Implemented email notification service"
- Multiple keywords increase match probability

### PR Descriptions
- Include context from task title
- List implemented features
- Mention related tasks

### GitHub Username
- Use exact GitHub username (case-insensitive)
- Don't use display name or email
- Verify in GitHub profile settings

## Security Considerations

- GitHub usernames are stored as lowercase
- Keyword matching is case-insensitive
- No auto-assignment prevents unauthorized task changes
- Webhook signature validation recommended (not implemented)
- Firestore security rules should restrict write access
