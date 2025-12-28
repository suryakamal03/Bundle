import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors', padding && 'p-6', className)}>
      {children}
    </div>
  )
}
