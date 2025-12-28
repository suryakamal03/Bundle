'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load theme from localStorage on mount, default to dark
    const savedTheme = localStorage.getItem('theme')
    const theme = savedTheme === 'light' ? 'light' : 'dark'
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [])

  return <>{children}</>
}
