'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { User, Github, Bell, Palette } from 'lucide-react'
import { useAuth } from '@/backend/auth/authContext'
import { getUserSettings, updateProfile, updateNotificationSettings } from '@/backend/settings/userSettingsService'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import ChangePasswordModal from '@/components/settings/ChangePasswordModal'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

interface UserSettings {
  fullName: string
  email: string
  githubUsername?: string
  autoReminder: boolean
  reminderTime: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [autoReminder, setAutoReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('09:00')
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'github', name: 'GitHub Management', icon: Github },
    { id: 'notifications', name: 'Notification Preferences', icon: Bell },
    { id: 'theme', name: 'Theme', icon: Palette },
  ]
  
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
      setAutoReminder(userSettings.autoReminder)
      setReminderTime(userSettings.reminderTime)
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

  const handleAutoReminderToggle = async (checked: boolean) => {
    setAutoReminder(checked)
    if (!user?.uid) return
    
    try {
      await updateNotificationSettings(user.uid, { autoReminder: checked })
    } catch (error) {
      console.error('Error updating auto reminder:', error)
      // Revert on error
      setAutoReminder(!checked)
      alert('Failed to update auto reminder')
    }
  }

  const handleReminderTimeChange = async (time: string) => {
    setReminderTime(time)
    if (!user?.uid) return
    
    try {
      await updateNotificationSettings(user.uid, { reminderTime: time })
    } catch (error) {
      console.error('Error updating reminder time:', error)
      alert('Failed to update reminder time')
    }
  }

  const handleSaveNotifications = async () => {
    if (!user?.uid) return
    
    try {
      setSaving(true)
      await updateNotificationSettings(user.uid, { autoReminder, reminderTime })
      await loadSettings()
      alert('Notification preferences updated successfully!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      alert('Failed to update notification preferences')
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </Card>
          
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <>
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
              </>
            )}
            
            {activeTab === 'github' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">GitHub Management</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">View your connected GitHub account and repositories.</p>
                
                <div className="space-y-4">
                  {githubUsername ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                          <Github className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-900 dark:text-green-100">Connected to GitHub</p>
                          <p className="text-sm text-green-700 dark:text-green-300">@{githubUsername}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">No GitHub username configured. Add your username in the Profile section.</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Connected Repositories</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your repositories will appear here once webhook integration is configured for your projects.</p>
                  </div>
                </div>
              </Card>
            )}
            
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Reminder Settings</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Customize your email notification preferences for tasks.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Auto Reminder</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically enable reminders when creating new tasks</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={autoReminder}
                        onChange={(e) => handleAutoReminderToggle(e.target.checked)}
                        disabled={saving}
                        aria-label="Enable auto reminder for new tasks"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Schedule Reminder Time</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Set your preferred time for daily reminder notifications.</p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Time</label>
                      <select 
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={reminderTime}
                        onChange={(e) => handleReminderTimeChange(e.target.value)}
                        disabled={saving}
                        aria-label="Select preferred reminder time"
                      >
                        <option value="06:00">06:00 AM</option>
                        <option value="07:00">07:00 AM</option>
                        <option value="08:00">08:00 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Changes are saved automatically</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {activeTab === 'theme' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Theme Settings</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Customize how Ontrackr looks for you.</p>
                
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">Select Theme</label>
                    <AnimatedThemeToggler />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      Toggle between light and dark mode
                    </p>
                  </div>
                </div>
              </Card>
            )}
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
