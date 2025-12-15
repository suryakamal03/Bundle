'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { mockRiskAlerts } from '@/lib/mockData'

export default function ProjectRisks() {
  const projectRisks = mockRiskAlerts.slice(0, 4)

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Risk Alerts</h2>
      <div className="space-y-4">
        {projectRisks.map((risk) => (
          <div key={risk.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                risk.type === 'critical' ? 'bg-red-50' :
                risk.type === 'warning' ? 'bg-yellow-50' :
                'bg-green-50'
              }`}>
                {risk.type === 'healthy' ? (
                  <CheckCircle className={`w-5 h-5 ${
                    risk.type === 'critical' ? 'text-red-600' :
                    risk.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                ) : (
                  <AlertTriangle className={`w-5 h-5 ${
                    risk.type === 'critical' ? 'text-red-600' :
                    risk.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                  <Badge variant={risk.type === 'critical' ? 'danger' : risk.type === 'warning' ? 'warning' : 'success'}>
                    {risk.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                {risk.assignee && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar name={risk.assignee.name} size="sm" />
                    <span className="text-sm text-gray-600">{risk.assignee.name}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="text-primary-500">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
