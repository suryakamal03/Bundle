'use client'

import { LogOut, Settings, Sun, Moon, FolderKanban, CheckSquare, LayoutDashboard, Home } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/backend/auth/authService'
import { useAuth } from '@/backend/auth/authContext'
import LogoutModal from '@/components/ui/LogoutModal'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const handleLogout = async () => {
    setShowLogoutModal(false)
    setShowUserMenu(false)
    try {
      await authService.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', newTheme)
  }

  const navItems = [
    { name: 'Home', href: '/my-dashboard', icon: Home },
    { name: 'Project', href: '/projects', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  ]
  
  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-full mx-auto px-6 py-1.5">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <Link href="/projects" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                </svg>
              </div>
              <span 
                className="text-base font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-quadria)' }}
              >
                Bundle
              </span>
            </Link>

            {/* Center - Navigation */}
            <div className="flex items-center gap-2 px-4 py-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 px-5 py-1.5 rounded-xl transition-all",
                      isActive 
                        ? "text-white dark:text-white" 
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right - Theme + Avatar */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Avatar name={user?.displayName || user?.email || 'User'} status size="md" />
                </button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#141414] rounded-xl shadow-xl border border-gray-800 py-1.5 z-20">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          router.push('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          toggleTheme()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        {isDark ? (
                          <>
                            <Sun className="w-4 h-4" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4" />
                            Dark Mode
                          </>
                        )}
                      </button>
                      <div className="border-t border-gray-800 my-1.5" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          setShowLogoutModal(true)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
