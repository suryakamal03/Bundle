'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  User, 
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Project Dashboard', href: '/projects', icon: FolderKanban },
  { name: 'My Dashboard', href: '/my-dashboard', icon: User },
  { name: 'Task Management', href: '/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <div 
      className={cn(
        'flex flex-col w-64 bg-white dark:bg-[#212121] border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 transition-all duration-300 z-20',
        !isOpen && '-translate-x-full'
      )}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">Bundle</span>
      </button>
      
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg text-base font-semibold transition-colors',
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <span className="flex-1">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
