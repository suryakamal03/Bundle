'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Plus } from 'lucide-react'
import { mockTasks } from '@/lib/mockData'

export default function ProjectTasks() {
  const taskGroups = {
    'To Do': mockTasks.filter(t => t.status === 'To Do'),
    'In Progress': mockTasks.filter(t => t.status === 'In Progress'),
    'In Review': mockTasks.filter(t => t.status === 'In Review'),
    'Done': mockTasks.filter(t => t.status === 'Done' || t.status === 'Completed'),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(taskGroups).map(([status, tasks]) => (
          <Card key={status} className="bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{status}</h3>
              <Badge variant="info">{tasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>
                  <div className="flex items-center justify-between">
                    {task.assignee ? (
                      <Avatar name={task.assignee.name} size="sm" />
                    ) : (
                      <div className="w-6 h-6" />
                    )}
                    <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No tasks</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
