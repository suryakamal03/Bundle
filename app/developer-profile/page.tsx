'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to /my-dashboard - developer profile page was showing mock data to all users
export default function DeveloperProfilePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/my-dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  )
}
