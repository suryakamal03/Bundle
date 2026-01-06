'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Settings,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Dashboard', href: '/my-dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function VerticalNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-[#1a1a1a] dark:bg-[#0a0a0a] border-r border-gray-800 flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <Link 
        href="/projects" 
        className="w-12 h-12 mb-8 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
        </svg>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full px-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all group relative',
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
              <Icon className={cn(
                'w-6 h-6 transition-transform',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )} />
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>

      {/* More Button */}
      <button className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all mt-auto">
        <MoreHorizontal className="w-6 h-6" />
        <span className="text-[10px] font-medium text-gray-500">More</span>
      </button>
    </nav>
  )
}
