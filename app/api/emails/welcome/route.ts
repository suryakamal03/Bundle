import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateWelcomeEmailHTML } from '@/lib/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 })
    }

    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    const emailHTML = generateWelcomeEmailHTML({ name })

    // Use delivered@resend.dev for testing, or configure your own verified domain
    const from = process.env.RESEND_FROM_EMAIL || 'Bundle <onboarding@resend.dev>'

    await resend.emails.send({
      from: from,
      to: email,
      subject: 'Welcome to Bundle! 🎉',
      html: emailHTML
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    })
  } catch (error: any) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to send welcome email' 
    }, { status: 500 })
  }
}
