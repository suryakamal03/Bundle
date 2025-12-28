'use client'

import { LogOut } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/backend/auth/authService'
import { useAuth } from '@/backend/auth/authContext'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  return (
    <header className="bg-white dark:bg-[#212121] border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 right-0 left-0 z-10 transition-colors">
      <div className="h-full px-6 flex items-center justify-end gap-4">
        <div className="scale-75">
          <AnimatedThemeToggler />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Avatar name={user?.displayName || user?.email || 'User'} status size="md" />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#212121] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
