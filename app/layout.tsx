import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/backend/auth/authContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'Bundle - Project Management Platform',
  description: 'AI-powered project management and team collaboration platform',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="url(%23paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32"><stop stop-color="%23FF9966"/><stop offset="1" stop-color="%23FF5E62"/></linearGradient></defs></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
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
