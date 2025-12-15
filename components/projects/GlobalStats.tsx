'use client'

import Card from '@/components/ui/Card'
import { ListTodo, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

export default function GlobalStats() {
  const stats = [
    {
      label: 'Total Projects',
      value: '12',
      change: '+2 this month',
      icon: ListTodo,
      color: 'blue',
    },
    {
      label: 'Active Tasks',
      value: '48',
      change: '23 in progress',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Overdue Tasks',
      value: '7',
      change: 'Needs attention',
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Risk Alerts',
      value: '3',
      change: '2 critical',
      icon: AlertTriangle,
      color: 'red',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
