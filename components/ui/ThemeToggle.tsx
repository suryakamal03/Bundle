'use client'

import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: (theme: 'light' | 'dark') => void
  disabled?: boolean
}

export function ThemeToggle({ theme, onToggle, disabled }: ThemeToggleProps) {
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => onToggle(isDark ? 'light' : 'dark')}
      disabled={disabled}
      className="relative inline-flex h-14 w-28 items-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sliding Background */}
      <div
        className={`absolute inset-1 rounded-full bg-white transition-transform duration-500 ease-in-out ${
          isDark ? 'translate-x-14' : 'translate-x-0'
        }`}
        style={{ width: 'calc(50% - 0.25rem)' }}
      />
      
      {/* Icons Container */}
      <div className="relative flex w-full items-center justify-between px-2">
        {/* Sun Icon */}
        <div className={`relative z-10 flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          !isDark ? 'scale-110' : 'scale-90 opacity-50'
        }`}>
          <Sun className={`h-6 w-6 transition-all duration-300 ${
            !isDark ? 'text-yellow-500 rotate-0' : 'text-white rotate-180'
          }`} />
        </div>
        
        {/* Moon Icon */}
        <div className={`relative z-10 flex h-10 w-10 items-center justify-center transition-all duration-300 ${
          isDark ? 'scale-110' : 'scale-90 opacity-50'
        }`}>
          <Moon className={`h-6 w-6 transition-all duration-300 ${
            isDark ? 'text-indigo-600 rotate-0' : 'text-white -rotate-180'
          }`} />
        </div>
      </div>
    </button>
  )
}
