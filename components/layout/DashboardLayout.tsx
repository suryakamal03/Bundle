'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import UserProfileModal from '@/components/auth/UserProfileModal'
import { useAuth } from '@/backend/auth/authContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, needsProfileSetup } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (needsProfileSetup) {
      setShowProfileModal(true)
    }
  }, [needsProfileSetup])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-[#212121] transition-colors">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Header />
          <main className="pt-16">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
        
        {showProfileModal && user && (
          <UserProfileModal
            userId={user.uid}
            onComplete={() => {
              setShowProfileModal(false)
              window.location.reload()
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
