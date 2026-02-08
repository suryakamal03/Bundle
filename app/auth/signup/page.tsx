'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Chrome } from 'lucide-react'
import { authService } from '@/backend/auth/authService'
import { validateEmail, validatePassword, validateFullName } from '@/backend/auth/authHelpers'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nameValidation = validateFullName(fullName)
    if (!nameValidation.isValid) {
      setError(nameValidation.message || 'Invalid name')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Invalid password')
      return
    }

    if (!agreed) {
      setError('Please accept the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      await authService.signUpWithEmail({ email, password, fullName })
      router.push('/projects')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
          
          <h2 className="text-xl font-bold text-white mb-1 text-center">Create your Bundle account</h2>
          <p className="text-gray-300 text-sm text-center mb-4">Unlock seamless project management and AI-powered insights.</p>
          
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              type="button"
              variant="secondary" 
              className="w-full gap-2" 
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <Chrome className="w-4 h-4" />
              Sign up with Google
            </Button>
            
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1c1c1c] text-gray-300">OR</span>
              </div>
            </div>
            
            <form onSubmit={handleEmailSignup} className="space-y-3">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-white bg-[#1c1c1c] border-[#2a2a2a] rounded focus:ring-white"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-white hover:text-gray-300 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-white hover:text-gray-300 underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              
              <Button type="submit" className="w-full" disabled={!agreed || loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-300 mt-3">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-white hover:text-gray-300 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
