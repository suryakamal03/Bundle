import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Validate environment variable
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ 
      error: 'Configuration error',
      message: 'NEXT_PUBLIC_APP_URL environment variable is not set'
    }, { status: 500 });
  }
  
  try {
    const testEmail = request.nextUrl.searchParams.get('email') || 'test@example.com'
    const testName = request.nextUrl.searchParams.get('name') || 'Test User'
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'Welcome email test successful' : 'Welcome email test failed',
      testEmail,
      testName,
      result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
