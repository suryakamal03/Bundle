'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-white mb-1 text-center">Check your email</h2>
          <p className="text-gray-300 text-sm text-center mb-4">
            We've sent a verification link to{' '}
            <span className="font-medium text-white">user@bundle.com</span>. Please click the link in the email to confirm your account.
          </p>
          
          <div className="bg-[#242424] rounded-lg p-3 mb-4">
            <h3 className="font-medium text-white text-sm mb-2">How to verify:</h3>
            <ol className="space-y-1 text-xs text-gray-300">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>Look for an email from Bundle in your inbox.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>Check your spam or junk folder if you don't see it.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>Click on the verification link provided in the email.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">4.</span>
                <span>You'll be redirected to your Bundle dashboard upon successful verification.</span>
              </li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <Button className="w-full">
              Resend verification email
            </Button>
            
            <Link href="/auth/login" className="block text-center text-sm text-white hover:text-gray-300 font-medium">
              Change email address
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
