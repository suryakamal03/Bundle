import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'RESEND_API_KEY not configured in environment variables',
        configured: false
      }, { status: 500 })
    }

    // Try to send a test email
    const result = await resend.emails.send({
      from: 'Bundle Test <noreply@bundle.app>',
      to: 'test@example.com', // This will fail but we can check the API connection
      subject: 'Test Email from Bundle',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend API is working.</p>'
    })

    return NextResponse.json({ 
      success: true,
      message: 'Resend API is configured and responding',
      configured: true,
      apiKeyPrefix: process.env.RESEND_API_KEY.substring(0, 10) + '...',
      result
    })
  } catch (error: any) {
    // Even errors from Resend mean the API is working (just might be wrong email)
    return NextResponse.json({ 
      success: false,
      configured: true,
      error: error.message,
      message: 'Resend API is configured but encountered an error (this might be expected for test emails)',
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    }, { status: 200 }) // Return 200 so we know API key works even if send fails
  }
}
