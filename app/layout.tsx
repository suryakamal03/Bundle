import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/backend/auth/authContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'Bundle - Project Management Platform',
  description: 'AI-powered project management and team collaboration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
