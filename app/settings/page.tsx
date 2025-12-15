'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { User, Users, Github, Bell, Palette, Lock } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'team', name: 'Team Management', icon: Users },
    { id: 'github', name: 'GitHub Integration', icon: Github },
    { id: 'notifications', name: 'Notification Preferences', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        
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
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
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
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar name="John Doe" size="xl" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                      <p className="text-sm text-gray-600">Update your photo and personal details here.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Full Name" defaultValue="John Doe" />
                      <Input label="Email Address" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    
                    <Input label="Role" defaultValue="Senior Developer" />
                    
                    <Button>Update Profile</Button>
                  </div>
                </Card>
                
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                      <p className="text-sm text-gray-600">Manage your password and other security settings.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="New Password" type="password" placeholder="Enter new password" />
                      <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                    </div>
                    
                    <Button>Change Password</Button>
                  </div>
                </Card>
              </>
            )}
            
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Reminder Settings</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Customize your email notification preferences for tasks and project updates.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">General Reminders</h3>
                    <p className="text-sm text-gray-600 mb-4">Control daily, weekly, and overdue task notifications.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Daily Task Reminders</p>
                          <p className="text-sm text-gray-600">Receive a summary of your tasks due today.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Weekly Project Updates</p>
                          <p className="text-sm text-gray-600">Get an overview of project progress and upcoming deadlines.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Overdue Task Alerts</p>
                          <p className="text-sm text-gray-600">Be notified when a task becomes overdue.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Schedule Reminders</h3>
                    <p className="text-sm text-gray-600 mb-4">Set your preferred time for daily and weekly notifications.</p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>01:00 PM</option>
                        <option>02:00 PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button>Save Changes</Button>
                </div>
              </Card>
            )}
            
            {activeTab === 'github' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">GitHub Integration</h2>
                <p className="text-sm text-gray-600 mb-6">Connect your GitHub account to track activity and commits.</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Github className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Connected to GitHub</p>
                        <p className="text-sm text-green-700">@johndoe</p>
                      </div>
                      <Button variant="secondary" size="sm">Disconnect</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Permissions</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Read repository data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Access commit history</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">View pull requests</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {activeTab === 'appearance' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Appearance</h2>
                <p className="text-sm text-gray-600 mb-6">Customize how Ontrackr looks for you.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-primary-500 rounded-lg bg-white">
                        <div className="w-full h-20 bg-white border border-gray-300 rounded mb-2"></div>
                        <p className="text-sm font-medium text-gray-900">Light</p>
                      </button>
                      <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                        <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium text-gray-900">Dark</p>
                      </button>
                      <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                        <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium text-gray-900">Auto</p>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
