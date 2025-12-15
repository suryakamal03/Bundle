'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ontrackr</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Forgot Password</h2>
          <p className="text-gray-600 text-center mb-6">
            Enter your registered email address below, and we'll send you a link to reset your password securely.
          </p>
          
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button className="w-full" size="lg">
              Send reset link
            </Button>
            
            <p className="text-center text-sm text-gray-600 mt-6">
              <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Remembered your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
