'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Chrome } from 'lucide-react'
import { authService } from '@/backend/auth/authService'
import { validateEmail } from '@/backend/auth/authHelpers'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)

    try {
      await authService.signInWithEmail({ email, password })
      router.push('/projects')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await authService.signInWithGoogle()
      router.push('/projects')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
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
          
          <h2 className="text-xl font-bold text-white mb-1 text-center">Welcome to Bundle</h2>
          <p className="text-gray-300 text-sm text-center mb-4">Log in to continue</p>
          
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="text-right mt-2">
                <Link href="/auth/forgot-password" className="text-sm text-white hover:text-gray-300">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
            
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1c1c1c] text-gray-300">OR</span>
            </div>
          </div>
          
          <Button 
            type="button"
            variant="secondary" 
            className="w-full gap-2" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="w-4 h-4" />
            Sign in with Google
          </Button>
          
          <p className="text-center text-sm text-gray-300 mt-3">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-white hover:text-gray-300 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
