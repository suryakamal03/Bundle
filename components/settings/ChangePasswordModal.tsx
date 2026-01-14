'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { auth } from '@/lib/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

interface ChangePasswordModalProps {
  onClose: () => void
  userEmail: string
  userName: string
}

export default function ChangePasswordModal({ onClose, userEmail, userName }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password')
      return
    }

    setLoading(true)

    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error('No authenticated user found')
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      // Send confirmation email
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email: userEmail,
          name: userName
        })
      })

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Password change error:', err)
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect')
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak')
      } else {
        setError(err.message || 'Failed to change password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-lg">
            Password changed successfully! Confirmation email sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />

            <Input
              label="Re-enter New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
