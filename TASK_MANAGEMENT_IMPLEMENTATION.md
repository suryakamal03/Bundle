# Task Management System Implementation

## Overview
This implementation adds a complete task management system with GitHub integration to the Bundle application. Tasks can be created, assigned to project members, and automatically progress through workflow stages based on verified GitHub commits and merges.

## Implementation Summary

### 1. Updated Type Definitions

**File: `types/index.ts`**
- Updated `User` interface to include `githubUsername` and `displayName`
- Completely rewrote `Task` interface with new schema:
  - `status`: Limited to 'To Do', 'In Review', 'Done'
  - `assignedTo`: User ID of assigned member
  - `assignedToName`: Display name for quick reference
  - `projectId`: Link to parent project
  - `keywords`: Extracted from task title for matching
  - `createdAt`, `updatedAt`: Timestamp fields

### 2. Task Service

**File: `backend/tasks/taskService.ts`**

Core functionality for task management:

**Create Task**
- Accepts title, projectId, assignedTo, assignedToName
- Automatically extracts keywords from title
- Stores task with initial status 'To Do'

**Keyword Extraction**
- Removes common stop words
- Converts to lowercase
- Filters words longer than 2 characters
- Returns unique keywords for matching

**Real-time Subscriptions**
- `subscribeToProjectTasks()`: Real-time listener for all project tasks
- Automatically updates UI when tasks change

**GitHub Integration**
- `matchTaskForCommit()`: Matches commits to tasks and moves To Do → In Review
- `matchTaskForMerge()`: Matches PR merges to tasks and moves In Review → Done
- Both require GitHub username match AND keyword match

### 3. User Profile Collection

**File: `components/auth/UserProfileModal.tsx`**
- Modal prompts users for Display Name and GitHub Username
- Enforces GitHub username requirement for task tracking
- Updates user document in Firestore

**File: `backend/auth/authContext.tsx`**
- Enhanced context to detect missing profile data
- Exposes `needsProfileSetup` flag
- Checks for `displayName` and `githubUsername` on auth state change

**File: `backend/auth/authService.ts`**
- Updated signup/login to store `displayName` and `githubUsername`
- Initializes fields as empty strings if not provided

**File: `components/layout/DashboardLayout.tsx`**
- Shows UserProfileModal when `needsProfileSetup` is true
- Prevents access until profile is complete
- Reloads page after profile completion

### 4. Add Task Modal

**File: `components/projects/AddTaskModal.tsx`**
- Form with two inputs: Task Title and Assign To dropdown
- Loads project members from `project_members` collection
- Validates inputs before submission
- Calls `taskService.createTask()` on submit

### 5. Updated Tasks Component

**File: `components/projects/ProjectTasks.tsx`**

Complete rewrite with:
- Real-time Firestore integration via `subscribeToProjectTasks()`
- Member filter buttons (All Members + individual members)
- Three-column kanban board: To Do, In Review, Done
- Task cards display assigned member name and avatar
- Add Task button opens modal
- No mock data or placeholders

### 6. GitHub Webhook Integration

**File: `backend/integrations/githubService.ts`**

Enhanced webhook handlers:

**Push Event Handler**
- Extracts GitHub username from commit author or sender
- Extracts commit message
- Calls `taskService.matchTaskForCommit()` for each commit
- Moves matching tasks from To Do → In Review

**Pull Request Event Handler**
- Detects merged PRs to main/master branch
- Extracts PR title and body
- Calls `taskService.matchTaskForMerge()`
- Moves matching tasks from In Review → Done

### 7. Project Detail Integration

**File: `components/projects/ProjectDetail.tsx`**
- Updated to pass `projectId` prop to `ProjectTasks` component
- Enables task filtering and real-time updates per project

## Firestore Data Structure

### Tasks Collection
```
tasks/{taskId}
  - title: string
  - projectId: string
  - assignedTo: string (userId)
  - assignedToName: string
  - status: 'To Do' | 'In Review' | 'Done'
  - keywords: string[]
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Users Collection
```
users/{userId}
  - uid: string
  - email: string
  - name: string
  - displayName: string
  - githubUsername: string
  - createdAt: timestamp
```

### Project Members Collection
```
project_members/{memberId}
  - projectId: string
  - userId: string
  - userName: string
  - userEmail: string
  - githubUsername: string (optional)
```

## User Flow

### First-time User
1. User signs up or logs in
2. AuthContext detects missing displayName/githubUsername
3. UserProfileModal appears automatically
4. User enters Display Name and GitHub Username
5. Profile is saved to Firestore
6. User can now create and be assigned tasks

### Task Creation
1. Project member clicks "Add Task" button
2. Modal opens with task title input and member dropdown
3. Member selects assignee from project members
4. Task is created with status 'To Do'
5. Task appears immediately in real-time UI

### Task Progression via GitHub

**Commit → In Review**
1. Developer commits code to GitHub
2. Webhook sends push event to `/api/webhooks/github`
3. System extracts commit author's GitHub username
4. System extracts commit message keywords
5. System queries project members to match GitHub username
6. If match found, compares commit keywords with task keywords
7. If keywords match, task moves To Do → In Review

**PR Merge → Done**
1. Developer merges PR to main/master branch
2. Webhook sends pull_request event with action='closed' and merged=true
3. System extracts PR author's GitHub username
4. System extracts PR title and body keywords
5. System matches GitHub username to project member
6. If match found, compares PR keywords with task keywords
7. If keywords match, task moves In Review → Done

## Key Features

### Identity Verification
- No auto-assignment of tasks
- Requires explicit GitHub username match
- Prevents false positives from similar usernames

### Keyword Matching
- Intelligent keyword extraction
- Removes stop words and short words
- Case-insensitive matching
- Must match at least one keyword

### Real-time Updates
- Tasks update instantly across all connected clients
- No manual refresh required
- Firestore listeners ensure data consistency

### Member Filtering
- View all tasks or filter by specific member
- Easy navigation between team members
- Visual indication of selected filter

### Clean Architecture
- Separation of concerns (UI, logic, data)
- TypeScript typing throughout
- Scalable service patterns
- No comments or emojis in code

## GitHub Webhook Configuration

Required webhook events:
- Push events (for commit tracking)
- Pull request events (for merge detection)

Webhook URL: `https://your-domain.com/api/webhooks/github`

The system automatically:
- Identifies project by repository owner/name
- Processes events in real-time
- Stores events for audit trail
- Updates tasks based on matching logic

## Testing Checklist

- [ ] User signup/login prompts for GitHub username
- [ ] Add Task button opens modal
- [ ] Task appears in To Do column after creation
- [ ] Member filter buttons work correctly
- [ ] Commit with matching keywords moves task to In Review
- [ ] PR merge with matching keywords moves task to Done
- [ ] Real-time updates work across multiple browser windows
- [ ] GitHub username mismatch prevents task movement
- [ ] Keyword mismatch prevents task movement
