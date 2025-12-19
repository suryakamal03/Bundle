# GitHub Webhook Integration

## Overview
This project includes a GitHub webhook endpoint to receive real-time events from GitHub repositories (push, pull requests, issues).

## Webhook Endpoint
`POST /api/webhooks/github`

## Supported Events
- `push` - When code is pushed to the repository
- `pull_request` - When PRs are opened, closed, or updated
- `issues` - When issues are created, updated, or closed

## Production Setup

### 1. Deploy Your Application
Deploy to Vercel, Netlify, or your hosting provider.

### 2. Configure GitHub Webhook
1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `https://your-domain.com/api/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: (optional, for signature verification)
   - **Events**: Select "Let me select individual events"
     - ✓ Pushes
     - ✓ Pull requests
     - ✓ Issues
5. Click **Add webhook**

## Local Development with ngrok

### Prerequisites
```bash
npm install -g ngrok
```

### Step-by-Step Setup

#### 1. Start Your Development Server
```bash
npm run dev
```
Your app should be running on `http://localhost:3000`

#### 2. Start ngrok in a New Terminal
```bash
ngrok http 3000
```

#### 3. Copy the HTTPS URL
ngrok will output something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```
Copy the `https://abc123.ngrok.io` URL

#### 4. Configure GitHub Webhook
1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. **Payload URL**: `https://abc123.ngrok.io/api/webhooks/github`
4. **Content type**: `application/json`
5. Select events: Pushes, Pull requests, Issues
6. Click **Add webhook**

#### 5. Test the Webhook
1. Make a commit and push to your repository
2. Check ngrok web interface at `http://localhost:4040`
3. View webhook requests and responses
4. Check your terminal for webhook logs

### ngrok Web Interface
Access `http://localhost:4040` to see:
- All incoming webhook requests
- Request/response details
- Replay requests for testing

## Webhook Payload Structure

### Push Event
```json
{
  "repository": {
    "name": "repo-name",
    "full_name": "owner/repo-name",
    "owner": { "login": "username" }
  },
  "sender": {
    "login": "username",
    "avatar_url": "..."
  },
  "commits": [
    {
      "id": "commit-sha",
      "message": "Commit message",
      "author": {
        "name": "Author Name",
        "email": "email@example.com"
      },
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Pull Request Event
```json
{
  "action": "opened",
  "pull_request": {
    "id": 123,
    "title": "PR Title",
    "state": "open",
    "user": { "login": "username" }
  },
  "repository": { ... },
  "sender": { ... }
}
```

### Issue Event
```json
{
  "action": "opened",
  "issue": {
    "id": 456,
    "title": "Issue Title",
    "state": "open",
    "user": { "login": "username" }
  },
  "repository": { ... },
  "sender": { ... }
}
```

## Database Storage

Webhook events are stored in Firestore:
- Collection: `github_events`
- Fields:
  - `projectId` - Associated project ID
  - `eventType` - 'push', 'pull_request', or 'issues'
  - `action` - Event action (e.g., 'opened', 'closed')
  - `payload` - Full GitHub payload
  - `repository` - Repo details
  - `sender` - Event sender details
  - `createdAt` - Timestamp

## Troubleshooting

### Webhook Not Receiving Events
1. Check ngrok is running: `http://localhost:4040`
2. Verify webhook URL in GitHub settings
3. Check Firestore security rules allow writes
4. View webhook delivery attempts in GitHub → Settings → Webhooks → Recent Deliveries

### ngrok Session Expired
Free ngrok URLs expire when you restart ngrok. Update the GitHub webhook URL with the new ngrok URL each time.

### Port Already in Use
If port 3000 is in use, run dev server on different port:
```bash
npm run dev -- -p 3001
ngrok http 3001
```

## Testing Endpoint

### Check Endpoint Status
```bash
curl http://localhost:3000/api/webhooks/github
```

Returns:
```json
{
  "status": "active",
  "endpoint": "/api/webhooks/github",
  "supportedEvents": ["push", "pull_request", "issues"],
  "instructions": { ... }
}
```

### Manual Test Payload
```bash
curl -X POST http://localhost:3000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "repository": {
      "name": "test-repo",
      "owner": { "login": "testuser" }
    },
    "sender": { "login": "testuser" }
  }'
```

## Security Considerations

### For Production:
1. Implement webhook signature verification
2. Add rate limiting
3. Validate payload schema
4. Use environment variables for secrets
5. Monitor webhook failures
6. Set up error alerting

### Firestore Security Rules
Ensure your `firestore.rules` allows webhook writes:
```javascript
match /github_events/{eventId} {
  allow read: if request.auth != null;
  allow create: if true;
}
```

## Monitoring

View webhook events in:
1. **Firestore Console**: `github_events` collection
2. **ngrok Web UI**: http://localhost:4040
3. **GitHub**: Repository → Settings → Webhooks → Recent Deliveries
4. **Server Logs**: Check terminal running `npm run dev`
