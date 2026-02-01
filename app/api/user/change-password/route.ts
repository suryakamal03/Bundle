import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { currentPassword, newPassword, email } = await request.json()

    if (!currentPassword || !newPassword || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Note: Firebase Admin SDK doesn't have a direct way to verify the current password
    // The client should use Firebase Auth to reauthenticate before calling this endpoint
    
    try {
      // Get user by email
      const userRecord = await auth.getUserByEmail(email)
      
      // Update password
      await auth.updateUser(userRecord.uid, {
        password: newPassword
      })

      // Send confirmation email
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Bundle <noreply@bundle.app>',
          to: email,
          subject: 'Password Changed Successfully',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                  .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Password Changed</h1>
                  </div>
                  <div class="content">
                    <p>Hello,</p>
                    <p>Your Bundle account password has been successfully changed.</p>
                    <p>If you did not make this change, please contact support immediately.</p>
                    <p>Thank you for using Bundle!</p>
                  </div>
                  <div class="footer">
                    <p>© 2025 Bundle. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update password' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in password change:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
