# Real-Time Group Chat Implementation Guide

## Overview
This guide explains the real-time group chat feature using Socket.IO and Firebase Firestore.

## Architecture

### Folder Structure
```
Ontrackr/
├── server.js                          # Socket.IO backend server
├── backend/
│   └── chat/
│       └── chatService.ts             # Firestore chat operations
├── lib/
│   └── socket.ts                      # Socket.IO client singleton
├── components/
│   └── projects/
│       └── ProjectGroupChat.tsx       # WhatsApp-like chat UI
└── types/
    └── index.ts                       # TypeScript interfaces
```

### Technology Stack
- **WebSocket**: Socket.IO (real-time bidirectional communication)
- **Database**: Firebase Firestore (message persistence)
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Node.js, Socket.IO server

## Data Flow

### 1. Connection Flow
```
User Opens Chat → Socket Client Connects → Joins Project Room → Receives Message History
```

### 2. Message Sending Flow
```
User Types Message → Click Send → Socket Emit → Server Receives → 
Save to Firestore → Broadcast to Room → All Clients Receive → UI Updates
```

### 3. Real-Time Updates
```
User A Sends Message → Socket.IO Server → User B Receives (WebSocket) → 
Firestore Saves (Persistence) → User C Joins Later → Gets History from Firestore
```

## Firestore Schema

### Collection Structure
```
projects/
  {projectId}/
    messages/
      {messageId}
        - projectId: string
        - senderId: string
        - senderName: string
        - text: string
        - timestamp: ISO string
        - time24h: string (HH:mm format)
        - createdAt: Firestore Timestamp
```

### Example Document
```json
{
  "projectId": "project-123",
  "senderId": "user-456",
  "senderName": "John Doe",
  "text": "Hello team! Let's discuss the new feature.",
  "timestamp": "2026-01-02T14:30:00.000Z",
  "time24h": "14:30",
  "createdAt": Timestamp
}
```

## Socket.IO Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ userId, userName }` | User connects to chat server |
| `project:join` | `{ projectId, userId, userName }` | Join a project chat room |
| `message:send` | `{ projectId, message: { senderId, senderName, text } }` | Send a message |
| `typing:start` | `{ projectId, userName }` | User starts typing |
| `typing:stop` | `{ projectId, userName }` | User stops typing |
| `project:leave` | `{ projectId, userId, userName }` | Leave a project room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `messages:history` | `ChatMessage[]` | Message history on join |
| `message:received` | `ChatMessage` | New message broadcast |
| `user:joined` | `{ userName, userId, timestamp }` | User joined notification |
| `user:left` | `{ userName, userId, timestamp }` | User left notification |
| `user:typing` | `{ userName }` | Typing indicator |
| `user:stopped-typing` | `{ userName }` | Stopped typing |
| `error` | `{ message }` | Error notification |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install socket.io socket.io-client
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001
FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Servers

#### Option A: Separate Terminals
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Socket.IO server
npm run dev:socket
```

#### Option B: Concurrent (Install concurrently first)
```bash
npm install -D concurrently
npm run dev:all
```

### 4. Firestore Security Rules
Add to `firestore.rules`:
```javascript
match /projects/{projectId}/messages/{messageId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == request.resource.data.senderId;
}
```

## UI Components

### ProjectGroupChat Features
- ✅ Real-time message sync
- ✅ WhatsApp-like UI (left/right alignment)
- ✅ Sender name display
- ✅ 24-hour time format (HH:mm)
- ✅ Multiline textarea input
- ✅ Auto-scroll to latest message
- ✅ Connection status indicator
- ✅ Send on Enter, new line on Shift+Enter
- ✅ Dark mode support
- ✅ Auto-resize textarea
- ✅ Avatar display for received messages

### Message Alignment
- **Own Messages**: Right-aligned, blue background, white text
- **Received Messages**: Left-aligned, white/dark background, avatar, sender name

## Production Considerations

### 1. Socket.IO Server Deployment
- Deploy on separate service (e.g., Heroku, Railway, DigitalOcean)
- Use environment variables for URLs
- Enable clustering for scalability
- Add Redis adapter for multi-instance support

### 2. Security
- Implement authentication middleware
- Validate user permissions per project
- Rate limiting on message sending
- Sanitize message content (XSS prevention)

### 3. Performance
- Limit message history (pagination)
- Implement message caching
- Use WebSocket compression
- Lazy load old messages

### 4. Monitoring
- Track connection counts
- Monitor message delivery rates
- Log errors and disconnections
- Alert on server issues

## Scaling Strategy

### Multi-Instance Setup
```javascript
// server.js - Add Redis adapter
const { createAdapter } = require('@socket.io/redis-adapter')
const { createClient } = require('redis')

const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

### Load Balancing
- Use sticky sessions (based on Socket.IO session ID)
- Configure NGINX or AWS ALB for WebSocket support
- Enable Socket.IO polling fallback

## Testing

### Test Message Flow
1. Open project in two browser windows
2. Send message from window 1
3. Verify message appears in window 2 instantly
4. Check Firestore for message persistence
5. Refresh window 2 - history should load

### Test Reconnection
1. Stop Socket.IO server
2. Try sending message (should show disconnected)
3. Restart server
4. Client should auto-reconnect
5. Messages should sync

## Troubleshooting

### Connection Issues
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check Socket.IO server is running on correct port
- Inspect browser console for errors
- Check CORS configuration

### Messages Not Appearing
- Verify user is authenticated
- Check projectId is correct
- Inspect Socket.IO server logs
- Verify Firestore permissions

### Firestore Errors
- Check Firebase Admin credentials
- Verify Firestore rules allow read/write
- Ensure collection path is correct
- Check for quota limits

## Future Enhancements
- [ ] Message reactions (emoji)
- [ ] File/image sharing
- [ ] Message editing/deletion
- [ ] Read receipts
- [ ] @mentions
- [ ] Message search
- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message threading
- [ ] Pinned messages

## Support
For issues or questions, refer to:
- Socket.IO docs: https://socket.io/docs/
- Firebase docs: https://firebase.google.com/docs
