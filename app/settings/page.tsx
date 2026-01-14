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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Update your personal details here.</p>
              
              <div className="space-y-4">
                <Input 
                  label="Full Name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saving}
                />
                
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={settings?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-900"
                />
                
                <Input 
                  label="GitHub Username" 
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  disabled={saving}
                />
                
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
            
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Security</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Manage your password and account security.</p>
              
              <div className="space-y-3">
                <Button onClick={() => setShowPasswordModal(true)} variant="secondary">
                  Change Password
                </Button>
                
                <Button onClick={handleLogout} variant="secondary" className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Logout
                </Button>
              </div>
            </Card>
          </div>
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