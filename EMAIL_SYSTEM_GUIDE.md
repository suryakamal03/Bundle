# Email System Setup Guide - Bundle

## Overview
Bundle uses **Resend** (v4.0.0) for sending emails including welcome emails and task deadline reminders.

## Configuration Status

### ✅ Resend API Setup
- **Package**: `resend@4.0.0` installed
- **API Key**: Configured in `.env.local` as `RESEND_API_KEY`
- **Status**: ✅ API is working and responding
- **Test Endpoint**: `http://localhost:3000/api/emails/test`

### 📧 Email Types Implemented

#### 1. Welcome Email (NEW)
- **Trigger**: Automatically sent when a user creates an account
- **Sent on**: Email/Password signup AND Google signup
- **Template**: Modern, gradient design with feature highlights
- **Endpoint**: `/api/emails/welcome` (POST)
- **Test**: `/api/emails/test-welcome?email=YOUR_EMAIL&name=YOUR_NAME`

#### 2. Task Deadline Reminders (EXISTING)
- **Trigger**: Automated CRON job checks for tasks due tomorrow
- **Endpoint**: `/api/reminders/send` (POST)
- **Test**: `/api/reminders/test`

## Email Sender Configuration

### Current Setup
Both email types use:
```typescript
const from = process.env.RESEND_FROM_EMAIL || 'Bundle <onboarding@resend.dev>'
```

### Options

1. **Development/Testing** (Current):
   - Uses: `onboarding@resend.dev` (Resend's sandbox)
   - Limitations: Only sends to verified email addresses
   - Perfect for testing

2. **Production** (Requires Domain Verification):
   - Set `RESEND_FROM_EMAIL=Bundle <noreply@bundle.app>`
   - Requires domain verification at https://resend.com/domains
   - Error message: "The bundle.app domain is not verified"

### To Verify Your Domain:
1. Go to https://resend.com/domains
2. Add your domain (e.g., `bundle.app`)
3. Add the provided DNS records to your domain provider
4. Wait for verification (usually a few minutes)
5. Update `.env.local`:
   ```
   RESEND_FROM_EMAIL=Bundle <noreply@bundle.app>
   ```

## Testing the Email System

### Test 1: Check API Configuration
```bash
curl http://localhost:3000/api/emails/test
```
**Expected Response**:
```json
{
  "success": true,
  "message": "Resend API is configured and responding",
  "configured": true
}
```

### Test 2: Send Welcome Email
```bash
curl "http://localhost:3000/api/emails/test-welcome?email=YOUR_EMAIL&name=John"
```
**Note**: Replace `YOUR_EMAIL` with an email you have access to.

### Test 3: Test Deadline Reminders
```bash
curl http://localhost:3000/api/reminders/test
```

### Test 4: Create a Real Account
1. Navigate to `/auth/signup`
2. Create an account with email/password or Google
3. Check your inbox for the welcome email

## Code Changes Made

### Files Created:
1. **`app/api/emails/welcome/route.ts`** - Welcome email API endpoint
2. **`app/api/emails/test/route.ts`** - API configuration test endpoint
3. **`app/api/emails/test-welcome/route.ts`** - Welcome email test endpoint

### Files Modified:
1. **`lib/emailTemplates.tsx`**
   - Added `generateWelcomeEmailHTML()` function
   - Beautiful gradient design with feature list
   - Responsive and modern layout

2. **`backend/auth/authService.ts`**
   - Updated `signUpWithEmail()` - sends welcome email after account creation
   - Updated `signInWithGoogle()` - sends welcome email for new Google users
   - Non-blocking: Email failures don't prevent signup

3. **`app/api/reminders/send/route.ts`**
   - Updated to use configurable `RESEND_FROM_EMAIL`
   - Falls back to `onboarding@resend.dev` for testing

## Welcome Email Features

### Design Highlights:
- 🎨 Modern gradient header (purple/blue)
- ✅ Feature checklist with custom checkmarks
- 💡 Quick tip section with yellow highlight
- 🚀 Call-to-action button
- 📱 Responsive design
- 🎉 Emoji support for visual appeal

### Content Includes:
- Personalized greeting with user's name
- Overview of Bundle features:
  - Create and manage projects
  - Assign tasks and track progress
  - Automated deadline reminders
  - GitHub integration
  - Interactive dashboards
  - Real-time team chat
- Quick start tip
- Call-to-action to get started
- Help center link

## Environment Variables

Required in `.env.local`:
```bash
# Resend API Key (Required)
# Get your API key from https://resend.com
RESEND_API_KEY=<your_api_key_here>

# Optional: Custom sender email (requires domain verification)
RESEND_FROM_EMAIL=Bundle <noreply@yourdomain.com>

# For testing reminders endpoint
CRON_SECRET=<your_secure_random_string_here>
```

## Production Checklist

Before deploying to production:

- [ ] Verify domain at https://resend.com/domains
- [ ] Set `RESEND_FROM_EMAIL` in production environment
- [ ] Test welcome email with real email address
- [ ] Test deadline reminders
- [ ] Set up CRON job for reminder automation
- [ ] Monitor email delivery rates in Resend dashboard
- [ ] Add email preferences/unsubscribe functionality (future)

## Troubleshooting

### Issue: "Domain not verified" error
**Solution**: Use default `onboarding@resend.dev` for testing, or verify your domain in Resend dashboard.

### Issue: Emails not received
**Possible causes**:
1. Check spam folder
2. Using `onboarding@resend.dev` requires recipient email to be verified in Resend
3. API key invalid or expired
4. Domain not verified (for custom sender)

### Issue: Email sent but user signup failed
**This won't happen** - Email sending is non-blocking and wrapped in try-catch. Signup will succeed even if email fails.

## API Endpoints Reference

### POST `/api/emails/welcome`
Send welcome email to a new user.

**Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

### GET `/api/emails/test`
Test Resend API configuration.

**Response**:
```json
{
  "success": true,
  "configured": true,
  "message": "Resend API is configured and responding"
}
```

### GET `/api/emails/test-welcome`
Test welcome email sending.

**Query Params**:
- `email`: Recipient email (required)
- `name`: Recipient name (optional)

**Example**: `/api/emails/test-welcome?email=test@example.com&name=John`

## Next Steps

1. **Immediate**: Test with sandbox emails (`onboarding@resend.dev`)
2. **Short-term**: Verify domain for production use
3. **Future Enhancements**:
   - Password reset emails
   - Project invitation emails
   - Daily/weekly digest emails
   - Email preferences management
   - Unsubscribe functionality

## Summary

✅ **Resend API is configured and working**
✅ **Welcome emails automatically sent on signup**
✅ **Beautiful, professional email templates**
✅ **Non-blocking email sending (won't break signup)**
✅ **Easy to test with sandbox domain**
⚠️ **Production requires domain verification**

---

**Author**: Bundle Development Team  
**Last Updated**: 2024  
**Version**: 1.0
