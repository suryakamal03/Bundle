import { NextRequest, NextResponse } from 'next/server'
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, email, name } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // This endpoint requires client-side Firebase Auth
    // The actual password change happens on the client
    // This endpoint just sends the confirmation email

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Send password change confirmation email
    await resend.emails.send({
      from: 'Bundle <noreply@bundle.app>',
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <p>Hi ${name || 'there'},</p>
              <p>Your password has been successfully changed.</p>
              <p>If you did not make this change, please contact support immediately.</p>
              <p>For security reasons, you may need to sign in again on all your devices.</p>
              <div style="margin-top: 30px;">
                <strong>Security Tips:</strong>
                <ul>
                  <li>Use a strong, unique password</li>
                  <li>Never share your password</li>
                  <li>Enable two-factor authentication if available</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Bundle. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully. Confirmation email sent.' 
    })
  } catch (error: any) {
    console.error('Error in change password:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process password change' },
      { status: 500 }
    )
  }
}
