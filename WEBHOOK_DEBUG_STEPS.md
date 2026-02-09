# Webhook Debugging Steps

## Check GitHub Webhook Status

1. Go to: https://github.com/suryakamal03/Auto-Docs-for-github/settings/hooks
2. Click on your webhook (should be bundle-app-xi.vercel.app)
3. Click "Recent Deliveries" tab
4. Look at the most recent delivery after you made a commit

### What to look for:

**✅ Success (200 OK):**
```json
{
  "success": true,
  "event": "push",
  "projectId": "...",
  "projectName": "text 30"
}
```
→ Webhook is working, issue is elsewhere

**❌ Project Not Found (404):**
```json
{
  "error": "Project not found for this repository",
  "repository": "suryakamal03/Auto-Docs-for-github"
}
```
→ Database githubOwner/githubRepo doesn't match

**❌ Server Error (500):**
→ Processing failed, check error message

**❌ No deliveries at all:**
→ Webhook was deleted or URL changed

## Check Vercel Logs

1. Go to: https://vercel.com/suryakamal03s-projects/bundle-app
2. Click on your latest deployment
3. Click "Functions" → Find `/api/webhooks/github`
4. Look for logs when you made a commit

Search for:
- `[Webhook` - to see all webhook activity
- Your delivery ID from GitHub
- Any ERROR messages

## Check Database

Visit: https://bundle-app-xi.vercel.app/api/webhooks/debug

Look for:
1. Is "text 30" project listed?
2. What are the `githubOwner` and `githubRepo` values?
3. Do they EXACTLY match your repository?
   - Owner: "suryakamal03" (case-sensitive)
   - Repo: "Auto-Docs-for-github" (exact spelling, hyphens, etc.)

## Common Issues

### Issue 1: Repository Name Changed
If you renamed your repo, update it in your project settings:
1. Click Edit on "text 30" project
2. Update GitHub repository URL
3. Save

### Issue 2: Webhook URL Changed
Old URL: Different domain
New URL: bundle-app-xi.vercel.app/api/webhooks/github

→ Update webhook in GitHub settings

### Issue 3: Vercel Function Timeout
Webhook processing takes too long → Check function logs for slow database queries

## Test the Webhook

Make a test commit:
```bash
git commit --allow-empty -m "test: webhook debugging"
git push
```

Then immediately check:
1. GitHub Recent Deliveries (should show new delivery)
2. Vercel Function Logs (should show processing)
3. Your app's GitHub tab (should show new activity)
