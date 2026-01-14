'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { User } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { getUserSettings, updateProfile } from '@/backend/settings/userSettingsService'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import ChangePasswordModal from '@/components/settings/ChangePasswordModal'

interface UserSettings {
  fullName: string
  email: string
  githubUsername?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  
  useEffect(() => {
    if (user?.uid) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      const userSettings = await getUserSettings(user.uid)
      setSettings(userSettings)
      setFullName(userSettings.fullName)
      setGithubUsername(userSettings.githubUsername || '')
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.uid) return
    
    try {
      setSaving(true)
      await updateProfile(user.uid, { fullName, githubUsername })
      await loadSettings()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth)
        window.location.href = '/auth/login'
      } catch (error) {
        console.error('Logout error:', error)
        alert('Failed to logout')
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </DashboardLayout>
    )
  }
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings</p>
        </div>
        
        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal details and profile</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Input 
                label="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
                placeholder="Enter your full name"
              />
              
              <Input 
                label="Email Address" 
                type="email" 
                value={settings?.email || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
              />
              
              <Input 
                label="GitHub Username" 
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter your GitHub username"
                disabled={saving}
              />
              
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={saving} className="min-w-[140px]">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your password and account security</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setShowPasswordModal(true)} 
                variant="secondary"
                className="w-full justify-center"
              >
                Change Password
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="secondary" 
                className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      {showPasswordModal && settings && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)}
          userEmail={settings.email}
          userName={settings.fullName}
        />
      )}
    </DashboardLayout>
  )
}