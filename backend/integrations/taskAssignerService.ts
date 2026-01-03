import { GoogleGenAI } from '@google/genai'

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables')
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

export interface AIGeneratedTask {
  title: string
  assignedTo: string
  role: string
  deadlineInDays: number
  reasoning?: string
}

export interface TaskGenerationResult {
  success: boolean
  tasks?: AIGeneratedTask[]
  error?: string
}

/**
 * Generate task assignments using Gemini AI
 * @param projectDescription Full project details, features, and team member information
 * @returns Array of AI-generated tasks with assignments
 */
export async function generateTaskAssignments(
  projectDescription: string
): Promise<TaskGenerationResult> {
  try {
    if (!projectDescription || projectDescription.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide project details, features, and team information'
      }
    }

    const systemPrompt = `You are an expert project manager and task assignment specialist.
Your job is to analyze project descriptions and intelligently assign tasks to team members.

CRITICAL RULES FOR TASK TITLES:
1. ALL task titles MUST be lowercase
2. ALL task titles MUST start with a verb (add, implement, create, set up, connect, refactor, fix, update, build, design, etc.)
3. Task titles MUST be short and clear (3-8 words maximum)
4. NO punctuation at the end
5. Write like Git commit messages

GOOD EXAMPLES:
✅ "add user authentication flow"
✅ "set up websocket server"
✅ "implement payment gateway integration"
✅ "create dashboard analytics component"
✅ "refactor database connection logic"
✅ "design landing page wireframes"

BAD EXAMPLES:
❌ "Added user authentication" (not lowercase, past tense)
❌ "Work on backend" (not specific, no clear verb)
❌ "Authentication." (has punctuation)
❌ "Backend tasks" (too vague)

DEADLINE ESTIMATION RULES:
- Analyze task complexity and role type
- Frontend tasks: 1-5 days (UI components are typically faster)
- Backend tasks: 2-7 days (APIs, databases need more time)
- Design tasks: 1-4 days (wireframes, mockups)
- Integration tasks: 3-7 days (connecting systems takes time)
- Simple tasks: 1-2 days
- Medium tasks: 3-5 days
- Complex tasks: 5-7 days
- If no project deadline mentioned, spread tasks logically over 7-14 days

ASSIGNMENT RULES:
- ONLY assign tasks to team members mentioned in the description
- Match task requirements to member roles
- Balance workload across team members
- Frontend tasks → frontend developers
- Backend tasks → backend developers
- UI/UX tasks → designers
- Full-stack tasks → can go to either frontend or backend devs

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown, no explanations, no code blocks.
Each task must have: title, assignedTo, role, deadlineInDays

Example output:
[
  {
    "title": "set up express server with typescript",
    "assignedTo": "john",
    "role": "backend",
    "deadlineInDays": 3
  },
  {
    "title": "create user dashboard component",
    "assignedTo": "sarah",
    "role": "frontend",
    "deadlineInDays": 4
  }
]

Now analyze the following project and generate tasks:`

    const fullPrompt = `${systemPrompt}\n\n${projectDescription}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    })

    const text = response.text?.trim() || ''

    if (!text) {
      return {
        success: false,
        error: 'AI returned empty response. Please try again.'
      }
    }

    // Extract JSON (remove markdown code blocks if present)
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Parse JSON
    const tasks: AIGeneratedTask[] = JSON.parse(jsonText)

    // Validate tasks
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return {
        success: false,
        error: 'No tasks were generated. Please provide more details.'
      }
    }

    // Validate each task has required fields
    const invalidTasks = tasks.filter(
      task => !task.title || !task.assignedTo || !task.role || !task.deadlineInDays
    )

    if (invalidTasks.length > 0) {
      return {
        success: false,
        error: 'Some generated tasks are missing required fields'
      }
    }

    // Validate task title format (lowercase, starts with verb, no ending punctuation)
    const invalidTitles = tasks.filter(task => {
      const title = task.title.trim()
      const hasUppercase = /[A-Z]/.test(title)
      const endsWithPunctuation = /[.!?;,]$/.test(title)
      return hasUppercase || endsWithPunctuation
    })

    if (invalidTitles.length > 0) {
      return {
        success: false,
        error: `Invalid task titles detected. All titles must be lowercase and have no ending punctuation.`
      }
    }

    return {
      success: true,
      tasks
    }
  } catch (error: any) {
    console.error('[TaskAssignerService] Error generating tasks:', error)
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Failed to parse AI response. Please try rephrasing your project description.'
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to generate task assignments. Please try again.'
    }
  }
}
