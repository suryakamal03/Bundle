import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin
    const baseUrl = configuredAppUrl || requestOrigin
    
    // Call the reminder send endpoint
    const response = await fetch(`${baseUrl}/api/reminders/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Reminder check triggered',
      result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
