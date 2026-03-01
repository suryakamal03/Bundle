import { collection, query, where, orderBy, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Task } from '@/types'

export interface UserTask extends Task {
  projectName?: string
}

export const userTaskService = {
  /**
   * Get user's project IDs (projects where they are a member)
   */
  async _getUserProjectIds(userId: string): Promise<Map<string, string>> {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', userId)
    )
    const projectsSnapshot = await getDocs(projectsQuery)
    const projectMap = new Map<string, string>()
    projectsSnapshot.docs.forEach(d => {
      projectMap.set(d.id, d.data()?.name || 'Unknown Project')
    })
    return projectMap
  },

  /**
   * Get all tasks assigned to a specific user, only from projects they belong to
   */
  async getUserTasks(userId: string): Promise<UserTask[]> {
    try {
      console.log(`[UserTaskService] Fetching all tasks for userId: ${userId}`)

      // Step 1: Get projects the user is a member of
      const userProjects = await this._getUserProjectIds(userId)
      console.log(`[UserTaskService] User is member of ${userProjects.size} projects`)

      if (userProjects.size === 0) return []
      
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId)
      )

      const snapshot = await getDocs(q)
      console.log(`[UserTaskService] Found ${snapshot.docs.length} tasks`)
      
      const tasks: UserTask[] = []

      for (const docSnap of snapshot.docs) {
        const taskData = docSnap.data() as Task
        const task: UserTask = { ...taskData, id: docSnap.id }

        // Only include tasks from projects the user is a member of
        if (task.projectId && userProjects.has(task.projectId)) {
          task.projectName = userProjects.get(task.projectId) || 'Unknown Project'
          tasks.push(task)
        } else if (!task.projectId) {
          tasks.push(task)
        } else {
          console.log(`[UserTaskService] Skipping task ${docSnap.id} - user is not a member of project ${task.projectId}`)
        }
      }

      console.log(`[UserTaskService] Returning ${tasks.length} tasks`)
      return tasks
    } catch (error) {
      console.error('[UserTaskService] Error fetching user tasks:', error)
      return []
    }
  },

  /**
   * Get tasks by status for a specific user
   */
  async getUserTasksByStatus(userId: string, status: 'To Do' | 'In Review'): Promise<UserTask[]> {
    try {
      console.log(`[UserTaskService] Fetching tasks for userId: ${userId}, status: ${status}`)

      // Get projects the user is a member of
      const userProjects = await this._getUserProjectIds(userId)
      if (userProjects.size === 0) return []
      
      const q = query(
        collection(db, 'tasks'),
        where('assignedTo', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      console.log(`[UserTaskService] Found ${snapshot.docs.length} tasks`)
      
      const tasks: UserTask[] = []

      for (const docSnap of snapshot.docs) {
        const taskData = docSnap.data() as Task
        const task: UserTask = { ...taskData, id: docSnap.id }

        // Only include tasks from projects the user is a member of
        if (task.projectId && userProjects.has(task.projectId)) {
          task.projectName = userProjects.get(task.projectId) || 'Unknown Project'
          tasks.push(task)
        } else if (!task.projectId) {
          tasks.push(task)
        } else {
          console.log(`[UserTaskService] Skipping task ${docSnap.id} - user is not a member of project ${task.projectId}`)
        }
      }

      return tasks
    } catch (error: any) {
      console.error('[UserTaskService] Error fetching user tasks by status:', error)
      
      if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
        console.error('[UserTaskService] FIRESTORE INDEX REQUIRED!')
        console.error('[UserTaskService] Collection: tasks, Fields: assignedTo, status, createdAt')
      }
      
      return []
    }
  },

  /**
   * Subscribe to real-time updates for user tasks
   */
  subscribeToUserTasks(
    userId: string,
    callback: (tasks: UserTask[]) => void,
    status?: 'To Do' | 'In Review'
  ): () => void {
    const baseQuery = collection(db, 'tasks')
    
    const q = status
      ? query(
          baseQuery,
          where('assignedTo', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        )
      : query(
          baseQuery,
          where('assignedTo', '==', userId),
          orderBy('createdAt', 'desc')
        )

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Get user's projects for membership filtering
        const userProjects = await userTaskService._getUserProjectIds(userId)
        const tasks: UserTask[] = []

        for (const docSnap of snapshot.docs) {
          const taskData = docSnap.data() as Task
          const task: UserTask = { ...taskData, id: docSnap.id }

          // Only include tasks from projects the user is a member of
          if (task.projectId && userProjects.has(task.projectId)) {
            task.projectName = userProjects.get(task.projectId) || 'Unknown Project'
            tasks.push(task)
          } else if (!task.projectId) {
            tasks.push(task)
          }
        }

        callback(tasks)
      },
      (error) => {
        console.error('[UserTaskService] Error in subscription:', error)
        callback([])
      }
    )

    return unsubscribe
  }
}
