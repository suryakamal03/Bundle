'use client'

import { ReactNode, useState, useEffect } from 'react'
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

  useEffect(() => {
    if (needsProfileSetup) {
      setShowProfileModal(true)
    }
  }, [needsProfileSetup])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors">
        <Header />
        <main className="pt-20">
          <div className="p-6">
            {children}
          </div>
        </main>
        
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
