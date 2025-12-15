'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Download, Eye, Edit } from 'lucide-react'

export default function FlowchartPreview() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Flowchart</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 min-h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-lg shadow-md flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-2">Project Workflow Flowchart</p>
          <p className="text-sm text-gray-600 mb-4">Visual representation of project processes</p>
          <Button className="gap-2">
            <Eye className="w-4 h-4" />
            View Full Flowchart
          </Button>
        </div>
      </div>
    </Card>
  )
}
