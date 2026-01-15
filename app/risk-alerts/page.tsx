'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Search, Mail } from 'lucide-react'
import { mockRiskAlerts } from '@/lib/mockData'

export default function RiskAlertsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Risk Alerts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Centralized view of all detected project risks and AI-driven mitigation suggestions.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Alert Type: all</option>
            <option>Critical</option>
            <option>Warning</option>
            <option>Healthy</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Status: all</option>
            <option>Open</option>
            <option>Resolved</option>
          </select>
          <Button className="gap-2">
            <Mail className="w-4 h-4" />
            Send Alert Email Now
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {mockRiskAlerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${
                  alert.type === 'critical' ? 'bg-red-50' :
                  alert.type === 'warning' ? 'bg-yellow-50' :
                  'bg-green-50'
                }`}>
                  {alert.type === 'critical' ? (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : alert.type === 'warning' ? (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.type === 'critical' ? 'danger' : alert.type === 'warning' ? 'warning' : 'success'}>
                        {alert.type}
                      </Badge>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                  
                  {alert.assignee && (
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={alert.assignee.name} size="sm" />
                      <span className="text-sm text-gray-600">{alert.assignee.name}</span>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-r-lg mb-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">AI Suggestion:</p>
                        <ul className="space-y-1">
                          {alert.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-primary-500">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Detected: {alert.detected}</p>
                    <Button variant="ghost" size="sm" className="text-primary-500">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex items-center justify-center text-sm text-gray-600">
          © 2025 Bundle. All rights reserved.
        </div>
      </div>
    </DashboardLayout>
  )
}
