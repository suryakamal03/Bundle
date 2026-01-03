# AI-Powered Task Assignment Feature

## Overview

The **Project Assigner AI** is an intelligent task generation and assignment system that uses Google Gemini to automatically create, distribute, and schedule tasks based on project requirements and team composition.

## Architecture

### 1. Frontend Component Structure

```
components/projects/ProjectAssignerAI.tsx
├── Text Input Area (with @ mention autocomplete)
├── AI Generation Trigger
├── Task Preview List
│   ├── Individual Task Cards
│   │   ├── Approve Button (✓)
│   │   └── Reject Button (✗)
│   └── Approve All Button
└── Final Assignment Action
```

### 2. Backend Services

```
backend/integrations/taskAssignerService.ts
├── generateTaskAssignments()
│   ├── Input: Project description with team info
│   ├── Process: Gemini AI analysis
│   └── Output: JSON array of tasks
└── Task Validation Logic
```

### 3. Integration Points

- **Task Creation**: Uses existing `taskService.createTask()`
- **Member Management**: Integrates with `inviteService.getProjectMembers()`
- **AI Service**: Extends existing Gemini integration pattern

## AI Task Generation Logic

### Gemini Prompt Strategy

The AI is instructed with specific rules:

1. **Task Title Format (Git Commit Style)**
   - All lowercase
   - Starts with action verb (add, implement, create, set up, etc.)
   - Short and clear (3-8 words)
   - No ending punctuation

2. **Deadline Estimation**
   - Based on task complexity and role type
   - Frontend: 1-5 days
   - Backend: 2-7 days
   - Design: 1-4 days
   - Integration: 3-7 days
   - Default project timeline: 7-14 days if not specified

3. **Smart Assignment**
   - Only assigns to mentioned team members
   - Matches task requirements to member roles
   - Balances workload distribution

### JSON Schema

```typescript
interface AIGeneratedTask {
  title: string           // lowercase, verb-first, no punctuation
  assignedTo: string      // member name from project description
  role: string           // frontend, backend, design, etc.
  deadlineInDays: number // AI-estimated based on complexity
  reasoning?: string     // optional explanation (not currently used)
}
```

### Example AI Input

```
Project: E-commerce Dashboard

Features:
- User authentication with JWT tokens
- Product catalog with search and filtering
- Shopping cart and checkout flow
- Admin analytics dashboard with charts
- Payment integration with Stripe

Team:
- @john (backend developer)
- @sarah (frontend developer)  
- @mike (UI/UX designer)

Deadline: Launch in 2 weeks
```

### Example AI Output

```json
[
  {
    "title": "set up express server with typescript",
    "assignedTo": "john",
    "role": "backend",
    "deadlineInDays": 2
  },
  {
    "title": "implement jwt authentication middleware",
    "assignedTo": "john",
    "role": "backend",
    "deadlineInDays": 3
  },
  {
    "title": "create user dashboard component",
    "assignedTo": "sarah",
    "role": "frontend",
    "deadlineInDays": 4
  },
  {
    "title": "design product catalog wireframes",
    "assignedTo": "mike",
    "role": "design",
    "deadlineInDays": 2
  },
  {
    "title": "build shopping cart ui with state management",
    "assignedTo": "sarah",
    "role": "frontend",
    "deadlineInDays": 5
  },
  {
    "title": "integrate stripe payment gateway",
    "assignedTo": "john",
    "role": "backend",
    "deadlineInDays": 4
  }
]
```

## User Flow

### Phase 1: Input & Generation

1. Project lead navigates to **Project Assigner AI** tab
2. Enters project details in large text area:
   - Project description
   - Features to build
   - Team members with roles
3. Uses `@` to mention team members (autocomplete dropdown appears)
4. Clicks "Generate Task Assignments"
5. AI analyzes and returns structured task list

### Phase 2: Preview & Approval

6. Generated tasks appear as preview cards
7. Each task shows:
   - Title (lowercase, git-style)
   - Assigned member (with avatar)
   - Role badge
   - Estimated deadline
   - Approve ✓ / Reject ✗ buttons

8. Project lead can:
   - Click ✓ to approve individual tasks (turns green)
   - Click ✗ to reject tasks (turns red, faded out)
   - Click "Approve All" to select all at once
   - Mix and match approvals

### Phase 3: Task Assignment

9. Click "Approve All & Assign N Tasks"
10. System creates tasks in Firestore via `taskService.createTask()`
11. Tasks appear immediately in **Tasks** tab
12. Assigned members receive tasks (with reminder enabled)

## Safety Features

### No Accidental Creation

- ✅ Tasks are **never** automatically saved to Firestore
- ✅ AI output is **only a preview** (in-memory state)
- ✅ Tasks only persist after explicit approval
- ✅ Individual reject/approve control per task
- ✅ Clear visual feedback (green = approved, red = rejected)

### Validation Layers

1. **Input Validation**
   - Requires non-empty project description
   - Checks for team member mentions

2. **AI Output Validation**
   - Ensures JSON format
   - Validates required fields (title, assignedTo, role, deadlineInDays)
   - Checks task title format (lowercase, no punctuation)

3. **Assignment Validation**
   - Verifies member exists in project
   - Confirms member UID from Firestore
   - Only creates approved tasks

## Integration with Existing Backend

### Task Creation Flow

```typescript
// AI generates preview tasks (not saved)
const previewTasks: TaskPreview[] = generatedTasks

// User approves tasks (still not saved)
const approvedTasks = previewTasks.filter(t => t.approved)

// ONLY on final action: Save to Firestore
for (const task of approvedTasks) {
  const member = projectMembers.find(m => m.name === task.assignedTo)
  
  await taskService.createTask({
    title: task.title,
    projectId: projectId,
    assignedTo: member.id,          // UID from Firestore
    assignedToName: member.name,
    deadlineInDays: task.deadlineInDays,
    reminderEnabled: true           // Auto-enable reminders
  })
}
```

### Firestore Schema (Unchanged)

Tasks are created using the **existing** schema:

```typescript
{
  title: string
  projectId: string
  assignedTo: string (UID)
  assignedToName: string
  status: 'To Do' | 'In Review' | 'Done'
  keywords: string[]
  createdAt: serverTimestamp()
  updatedAt: serverTimestamp()
  deadlineAt?: Date
  reminderEnabled: boolean
  reminderSent: boolean
}
```

**No new fields, no schema changes** — seamless integration.

## UI/UX Highlights

### @ Mention Autocomplete

- Triggered by typing `@` in textarea
- Shows dropdown of project members
- Filters by name as user types
- Click to insert name
- Auto-focuses back to textarea

### Task Preview Cards

- **Neutral state**: White background, gray border
- **Approved state**: Green background, green border
- **Rejected state**: Red background, faded, strikethrough

### Visual Feedback

- Loading states with spinners
- Error messages with alert icons
- Success confirmation with count
- Disabled states during processing

### Dark Mode Support

- All components fully dark-mode compatible
- Purple accent color for AI branding
- Proper contrast ratios maintained

## Production-Ready Patterns

### Error Handling

```typescript
try {
  const result = await generateTaskAssignments(description)
  
  if (!result.success) {
    setError(result.error || 'Failed to generate tasks')
    return
  }
  
  // Process tasks...
} catch (err) {
  // Graceful degradation
  setError('An error occurred. Please try again.')
}
```

### State Management

- No global state pollution
- Local component state for preview
- Clear state on success
- Proper cleanup on unmount

### Performance

- Lazy loading of members (useEffect)
- Debounced @ mention search (real-time filter)
- Batch task creation (Promise.all)
- No unnecessary re-renders

### Accessibility

- Semantic HTML
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus management on autocomplete

## Testing Strategy

### Manual Testing Checklist

1. **@ Mention System**
   - [ ] Type `@` shows dropdown
   - [ ] Filter works correctly
   - [ ] Clicking inserts name
   - [ ] Focus returns to textarea

2. **AI Generation**
   - [ ] Empty input shows error
   - [ ] Valid input generates tasks
   - [ ] Task titles are lowercase
   - [ ] No punctuation at end
   - [ ] Deadlines are reasonable

3. **Approval System**
   - [ ] Individual approve/reject works
   - [ ] "Approve All" selects all tasks
   - [ ] Visual feedback is clear
   - [ ] Count updates correctly

4. **Task Assignment**
   - [ ] Only approved tasks are saved
   - [ ] Tasks appear in Tasks tab
   - [ ] Member UIDs are correct
   - [ ] Deadlines are calculated properly

5. **Error Scenarios**
   - [ ] Network error is handled
   - [ ] Invalid member name shows error
   - [ ] Malformed AI response is caught
   - [ ] Firestore errors are graceful

## Future Enhancements

### Potential Features

1. **Edit Generated Tasks**
   - Allow editing title before approval
   - Reassign to different member
   - Adjust deadline

2. **Task Dependencies**
   - AI identifies task order
   - Shows prerequisite relationships
   - Gantt chart visualization

3. **Workload Balancing**
   - Show member task counts
   - Warn about overallocation
   - Suggest redistribution

4. **Learning from History**
   - Store task completion times
   - Improve deadline estimates
   - Personalize to team velocity

5. **Bulk Operations**
   - Export tasks to CSV
   - Import from external tools
   - Duplicate task sets across projects

## Cost Considerations

- Gemini API calls: ~$0.0001 per request (Flash model)
- Average task generation: 1-2 seconds
- Typical project: 5-15 tasks per generation
- Firestore writes: Standard pricing applies

## Security Notes

- API key stored in environment variables
- Server-side timestamp prevents time manipulation
- Member validation prevents unauthorized assignment
- Project ID required for all operations

---

**Built with care for production use** 🚀
