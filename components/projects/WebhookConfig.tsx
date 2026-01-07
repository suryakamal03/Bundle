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
        <div className="p-2 bg-gray-100 dark:bg-[#1c1c1f] rounded-lg border border-gray-200 dark:border-[#26262a]">
          <Webhook className="w-5 h-5 text-gray-900 dark:text-[#eaeaea]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#eaeaea] mb-1">GitHub Webhook Configuration</h3>
          <p className="text-sm text-[#9a9a9a]">
            Configure GitHub webhooks to receive real-time updates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLocalhost && (
          <div className="border border-gray-200 dark:border-[#26262a] rounded-lg p-4 bg-gray-50 dark:bg-[#151517]">
            <div className="flex items-start gap-2">
              {ngrokDetected ? (
                <CheckCircle className="w-5 h-5 text-[#eaeaea] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#9a9a9a] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-medium mb-2 text-sm text-[#eaeaea]">
                  {ngrokDetected ? 'ngrok Detected!' : 'Local Development Detected'}
                </h4>
                {ngrokDetected ? (
                  <div>
                    <p className="text-sm text-[#9a9a9a] mb-2">
                      ngrok is running and your public URL has been detected automatically.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#0f0f10] border border-gray-200 dark:border-[#26262a] rounded font-mono text-sm text-gray-900 dark:text-[#eaeaea] overflow-x-auto">
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
                    <p className="text-sm text-[#9a9a9a] mb-3">
                      GitHub cannot reach localhost. You need to use ngrok to expose your local server.
                    </p>
                    <div className="bg-gray-50 dark:bg-[#0f0f10] rounded border border-gray-200 dark:border-[#26262a] p-3 mb-3">
                      <p className="text-xs font-medium text-[#eaeaea] mb-2">Setup ngrok:</p>
                      <ol className="text-xs text-[#9a9a9a] space-y-1 list-decimal list-inside">
                        <li>Open a new terminal</li>
                        <li>Run: <code className="bg-gray-100 dark:bg-[#1c1c1f] px-1 py-0.5 rounded">npx ngrok http 3000</code></li>
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
          <label className="block text-sm font-medium text-[#eaeaea] mb-2">
            Webhook Payload URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#0f0f10] border border-gray-200 dark:border-[#26262a] rounded-lg font-mono text-sm text-gray-900 dark:text-[#eaeaea] overflow-x-auto">
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
            <p className="text-xs text-[#9a9a9a] mt-1">
              Start ngrok and click "Detect ngrok URL" to get the webhook URL
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-[#151517] border border-gray-200 dark:border-[#26262a] rounded-lg p-4">
          <h4 className="font-medium text-[#eaeaea] mb-2 text-sm">GitHub Setup Instructions:</h4>
          <ol className="text-sm text-[#9a9a9a] space-y-1 list-decimal list-inside">
            <li>Copy the webhook URL above</li>
            <li>Click "Open GitHub Webhook Settings" below</li>
            <li>Click "Add webhook"</li>
            <li>Paste the URL in "Payload URL"</li>
            <li>Set Content type to: <code className="bg-gray-100 dark:bg-[#0f0f10] px-1 rounded">application/json</code></li>
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
      </div>
    </Card>
  )
}
