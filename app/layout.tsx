import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ontrackr - Project Management Platform',
  description: 'AI-powered project management and team collaboration platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
