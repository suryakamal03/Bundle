'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface UserProfileModalProps {
  userId: string
  onComplete: () => void
}

export default function UserProfileModal({ userId, onComplete }: UserProfileModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    if (!githubUsername.trim()) {
      setError('GitHub username is required for task tracking')
      return
    }

    setLoading(true)

    try {
      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)
      const existingUserData = userSnapshot.exists() ? userSnapshot.data() : {}
      const normalizedDisplayName = displayName.trim()
      const normalizedGithubUsername = githubUsername.trim().toLowerCase()

      await updateDoc(userRef, {
        name: normalizedDisplayName,
        displayName: normalizedDisplayName,
        githubUsername: normalizedGithubUsername
      })

      await setDoc(doc(db, 'userSettings', userId), {
        userId,
        fullName: normalizedDisplayName,
        email: existingUserData?.email || '',
        githubUsername: normalizedGithubUsername,
        autoReminder: true,
        reminderTime: '09:00',
        theme: 'light',
        updatedAt: new Date()
      }, { merge: true })

      onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#171717] border border-[#2a2a2a] rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
          <p className="text-sm text-[#b0b0b0] mt-1">
            We need some additional information to set up your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            required
          />

          <div>
            <Input
              label="GitHub Username"
              type="text"
              placeholder="johndoe"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-[#9a9a9a] mt-1">
              Required for matching tasks with your GitHub commits
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
