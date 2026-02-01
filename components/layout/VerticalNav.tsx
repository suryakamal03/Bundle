'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
        className="mb-8 flex items-center justify-center"
      >
        <motion.div
          className="w-7 h-7"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ rotate: 10 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="url(#paint0_linear_nav)" />
            <defs>
              <linearGradient id="paint0_linear_nav" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#FF9966" />
                <stop offset="1" stopColor="#FF5E62" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
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
                'w-7 h-7 transition-transform',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )} />
              <span className={cn(
                'text-[11px] font-medium',
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
        <MoreHorizontal className="w-7 h-7" />
        <span className="text-[11px] font-medium text-gray-500">More</span>
      </button>
    </nav>
  )
}
