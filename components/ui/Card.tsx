import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-[#151517] rounded-lg border border-[#26262a] shadow-sm transition-colors', padding && 'p-6', className)}>
      {children}
    </div>
  )
}
