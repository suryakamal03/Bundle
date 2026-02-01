# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Fixes (COMPLETED)

- [x] Fixed TypeScript error: Added `projectName` to Task interface
- [x] Fixed Toast type mismatch: Changed 'warning' to 'info'
- [x] Disabled ngrok API route in production
- [x] Added environment variable validation to test-welcome route
- [x] Fixed TypeScript `any` types in critical paths
- [x] Created `.env.production.example` with all required variables

## 📋 Deployment Steps

### Step 1: Prepare Environment Variables

1. **Copy `.env.production.example` to your notes**
2. **Fill in all values** from your Firebase, Resend, and Gemini accounts
3. **Generate CRON_SECRET**: Run `openssl rand -base64 32`

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure Project:
   - Framework Preset: **Next.js**
   - Root Directory: **.**
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
4. Click **Environment Variables** tab
5. Add ALL variables from `.env.production.example`
   - ⚠️ **Critical**: Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (will be shown after first deploy)
   - ⚠️ **Critical**: Set `NEXT_PUBLIC_SOCKET_URL` to Socket.IO server URL (see Step 3)
6. Click **Deploy**

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_SOCKET_URL
# ... add all other variables
```

### Step 3: Deploy Socket.IO Server (REQUIRED)

Your chat feature needs `server.js` running on a separate platform.

#### Option A: Deploy to Render
1. Go to [render.com](https://render.com)
2. Create **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: bundle-socketio
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or Starter for better performance)
5. Add Environment Variables:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
6. Deploy
7. **Copy the Render URL** (e.g., `https://bundle-socketio.onrender.com`)

#### Option B: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Create **New Project** > Deploy from GitHub
3. Add same environment variables as Render
4. Copy the Railway URL

#### Option C: Deploy to Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Initialize
fly launch

# Deploy
fly deploy
```

### Step 4: Update Environment Variables

**After both deploys:**

1. Go back to Vercel Dashboard
2. Update `NEXT_PUBLIC_SOCKET_URL` with your Socket.IO server URL
3. Redeploy: `vercel --prod` or trigger via dashboard

### Step 5: Update GitHub Webhook

1. Go to your GitHub repo > **Settings** > **Webhooks**
2. Click on your existing webhook
3. Update **Payload URL**:
   - **From**: `https://xxxxx.ngrok.io/api/webhooks/github`
   - **To**: `https://your-app.vercel.app/api/webhooks/github`
4. Keep **Content type**: `application/json`
5. Keep **Secret** the same
6. Click **Update webhook**
7. Test: Make a commit and check webhook deliveries

### Step 6: Test Critical Features

After deployment, test these features:

#### Authentication
- [ ] Sign up new user
- [ ] Log in
- [ ] Password reset email
- [ ] GitHub username linking

#### Projects
- [ ] Create new project
- [ ] View project details
- [ ] GitHub activity loads (if repo configured)
- [ ] Webhook receives events

#### Tasks
- [ ] Create task
- [ ] Assign task
- [ ] Update status
- [ ] Deadline reminders

#### Real-time Chat
- [ ] Open chat tab
- [ ] Send message
- [ ] Receive messages in real-time
- [ ] Check browser console for Socket.IO connection

#### AI Features (if API key set)
- [ ] AI task assigner
- [ ] Flowchart generation

## ⚠️ Common Issues & Solutions

### Issue: "NEXT_PUBLIC_APP_URL is not set"
**Solution**: Add environment variable in Vercel dashboard and redeploy

### Issue: Chat not working / Socket.IO errors
**Solution**: 
1. Verify `NEXT_PUBLIC_SOCKET_URL` is correct
2. Check Socket.IO server is running (visit the URL, should see "Socket.IO Chat Server Running")
3. Check browser console for connection errors

### Issue: GitHub webhook not receiving events
**Solution**:
1. Verify webhook URL is correct
2. Check webhook deliveries in GitHub
3. Check Vercel function logs

### Issue: Firebase errors
**Solution**:
1. Verify all Firebase env vars are set
2. For `FIREBASE_ADMIN_PRIVATE_KEY`, ensure it includes `\n` characters
3. Check Firebase console for any security rules blocking access

### Issue: Build fails with TypeScript errors
**Solution**:
1. Run `npm run build` locally first
2. Fix any TypeScript errors
3. Commit and redeploy

### Issue: 500 errors on API routes
**Solution**:
1. Check Vercel function logs (Functions tab in dashboard)
2. Verify all required env vars are set
3. Check for missing dependencies

## 🔧 Post-Deployment Configuration

### Set up Cron Job for Deadline Reminders

Vercel Cron is **not** available on Free plan. Options:

#### Option A: Use Vercel Cron (Pro plan)
1. Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/reminders/send",
    "schedule": "0 9 * * *"
  }]
}
```

#### Option B: Use External Cron (Free)
1. Use [cron-job.org](https://cron-job.org)
2. Create new cron job:
   - **URL**: `https://your-app.vercel.app/api/reminders/send`
   - **Schedule**: `0 9 * * *` (9 AM daily)
   - **Method**: POST
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### Configure Custom Domain (Optional)
1. Vercel Dashboard > Domains
2. Add your domain
3. Update DNS records
4. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SOCKET_URL` CORS settings

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: View traffic and performance
- **Logs**: Real-time function logs
- **Deployments**: History and rollback

### Socket.IO Server
- **Render Dashboard**: View logs and metrics
- **Railway Dashboard**: View deployment status

## 🔄 Continuous Deployment

Once set up, any push to `main` branch will:
1. Automatically deploy to Vercel
2. Run build checks
3. Deploy if successful

To disable: Vercel Dashboard > Settings > Git > Disable automatic deployments

## 📝 Additional Notes

### What works on Vercel:
- ✅ All Next.js pages and API routes
- ✅ Firebase operations
- ✅ Email sending via Resend
- ✅ AI features via Gemini
- ✅ GitHub webhooks
- ✅ All `/backend/*` services (they're just modules, not servers)

### What needs separate deployment:
- ⚠️ `server.js` - Socket.IO server (Render/Railway/Fly.io)

### Dev vs Production:
- **Dev**: Uses ngrok for webhooks, localhost for Socket.IO
- **Production**: Direct webhook URL, deployed Socket.IO server

## 🎉 Done!

Your app should now be fully deployed and functional. If you encounter any issues, check the logs in:
1. Vercel Dashboard > Functions > Logs
2. Render/Railway Dashboard > Logs
3. Browser console (F12)
