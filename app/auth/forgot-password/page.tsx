'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl p-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Bundle</h1>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1 text-center">Forgot Password</h2>
          <p className="text-gray-300 text-sm text-center mb-4">
            Enter your registered email address below, and we'll send you a link to reset your password securely.
          </p>
          
          <div className="space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button className="w-full">
              Send reset link
            </Button>
            
            <p className="text-center text-sm text-gray-300 mt-3">
              <Link href="/auth/login" className="text-white hover:text-gray-300 font-medium">
                Remembered your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
