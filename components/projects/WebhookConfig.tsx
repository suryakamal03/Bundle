'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Copy, Check, ExternalLink, Webhook, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'

interface WebhookConfigProps {
  githubOwner: string
  githubRepo: string
}

export default function WebhookConfig({ githubOwner, githubRepo }: WebhookConfigProps) {
  const [copied, setCopied] = useState(false)
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [loadingNgrok, setLoadingNgrok] = useState(false)
  const [ngrokDetected, setNgrokDetected] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      setIsLocalhost(localhost)
      if (localhost) {
        fetchNgrokUrl()
      }
    }
  }, [])

  const fetchNgrokUrl = async () => {
    setLoadingNgrok(true)
    try {
      const response = await fetch('/api/ngrok')
      if (response.ok) {
        const data = await response.json()
        setNgrokUrl(data.url)
        setNgrokDetected(true)
      } else {
        setNgrokDetected(false)
      }
    } catch (error) {
      setNgrokDetected(false)
    } finally {
      setLoadingNgrok(false)
    }
  }
  
  const webhookUrl = ngrokUrl 
    ? `${ngrokUrl}/api/webhooks/github`
    : typeof window !== 'undefined' 
      ? `${window.location.origin}/api/webhooks/github`
      : '/api/webhooks/github'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openGithubWebhooks = () => {
    window.open(`https://github.com/${githubOwner}/${githubRepo}/settings/hooks`, '_blank')
  }

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Webhook className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">GitHub Webhook Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure GitHub webhooks to receive real-time updates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLocalhost && (
          <div className={`border rounded-lg p-4 ${ngrokDetected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-start gap-2">
              {ngrokDetected ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-medium mb-2 text-sm ${ngrokDetected ? 'text-green-900' : 'text-orange-900'}`}>
                  {ngrokDetected ? 'ngrok Detected!' : 'Local Development Detected'}
                </h4>
                {ngrokDetected ? (
                  <div>
                    <p className="text-sm text-green-800 mb-2">
                      ngrok is running and your public URL has been detected automatically.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-white border border-green-300 rounded font-mono text-sm text-green-900 overflow-x-auto">
                        {ngrokUrl}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={fetchNgrokUrl}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-orange-800 mb-3">
                      GitHub cannot reach localhost. You need to use ngrok to expose your local server.
                    </p>
                    <div className="bg-white rounded border border-orange-300 p-3 mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Setup ngrok:</p>
                      <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Open a new terminal</li>
                        <li>Run: <code className="bg-gray-100 px-1 py-0.5 rounded">npx ngrok http 3000</code></li>
                        <li>Click the refresh button below to auto-detect</li>
                      </ol>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={fetchNgrokUrl}
                      disabled={loadingNgrok}
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingNgrok ? 'animate-spin' : ''}`} />
                      {loadingNgrok ? 'Checking...' : 'Detect ngrok URL'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook Payload URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 overflow-x-auto">
              {webhookUrl}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
              disabled={isLocalhost && !ngrokUrl}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          {isLocalhost && !ngrokUrl && (
            <p className="text-xs text-orange-600 mt-1">
              Start ngrok and click "Detect ngrok URL" to get the webhook URL
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">GitHub Setup Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy the webhook URL above</li>
            <li>Click "Open GitHub Webhook Settings" below</li>
            <li>Click "Add webhook"</li>
            <li>Paste the URL in "Payload URL"</li>
            <li>Set Content type to: <code className="bg-blue-100 px-1 rounded">application/json</code></li>
            <li>Select events: <strong>Pushes</strong>, <strong>Pull requests</strong>, <strong>Issues</strong></li>
            <li>Click "Add webhook"</li>
          </ol>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={openGithubWebhooks}
            disabled={!githubOwner || !githubRepo}
          >
            <ExternalLink className="w-4 h-4" />
            Open GitHub Webhook Settings
          </Button>
        </div>

        {isLocalhost && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            <p className="font-medium mb-1">Testing your webhook:</p>
            <p>After adding the webhook in GitHub, make a commit to test.</p>
            <p className="mt-1">View webhook deliveries at: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:4040</code> (ngrok web interface)</p>
          </div>
        )}
      </div>
    </Card>
  )
}
