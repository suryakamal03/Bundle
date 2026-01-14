# 🏗️ Project Architecture Refactor Plan

## Current Situation Analysis

### ❌ Problems with Current Architecture

1. **Mixed Concerns**: Business logic scattered between Next.js API routes and `/backend` folder
2. **Firebase Duplication**: Firebase operations in both frontend and backend
3. **No Clear Separation**: No distinct frontend/backend boundaries
4. **Socket.IO Isolation**: `server.js` runs separately but has no integration with other backend logic
5. **Scalability Issues**: Cannot deploy frontend and backend independently
6. **Hard to Test**: Business logic mixed with UI logic

### ✅ Current Working Components

- Next.js frontend (port 3000)
- Socket.IO server (`server.js` - port 3001)
- ngrok tunnel for webhooks
- Firebase operations
- API routes in Next.js

---

## 🎯 Proposed Production-Ready Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js - Port 3000)                  │
│  • Pages & Components                                        │
│  • Client-side state management                              │
│  • API calls to backend                                      │
│  • Socket.IO client                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│            BACKEND (Express + Socket.IO - Port 3001)         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express REST API                                    │   │
│  │  • Routes      → Define endpoints                    │   │
│  │  • Controllers → Handle requests                     │   │
│  │  • Services    → Business logic                      │   │
│  │  • Middleware  → Auth, validation                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Socket.IO Server                                    │   │
│  │  • Real-time chat                                    │   │
│  │  • Live updates                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Firebase Admin SDK                                  │   │
│  │  • Firestore operations                              │   │
│  │  • Authentication verification                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  FIREBASE / EXTERNAL SERVICES                │
│  • Firestore                                                 │
│  • Resend (Email)                                            │
│  • GitHub Webhooks                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Proposed Folder Structure

```
Bundle/
├── frontend/                          # Next.js Application
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── home/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── chat/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── ui/
│   ├── lib/
│   │   ├── firebase-client.ts        # Client-side Firebase only
│   │   ├── api-client.ts             # Backend API wrapper
│   │   ├── socket-client.ts          # Socket.IO client wrapper
│   │   └── utils.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── useTasks.ts
│   ├── types/
│   │   └── index.ts
│   ├── public/
│   ├── .env.local
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                           # Node.js/Express Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js           # Firebase Admin initialization
│   │   │   ├── env.js                # Environment variables
│   │   │   └── cors.js               # CORS configuration
│   │   ├── routes/
│   │   │   ├── index.js              # Main router
│   │   │   ├── auth.routes.js
│   │   │   ├── projects.routes.js
│   │   │   ├── tasks.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── webhooks.routes.js
│   │   │   └── emails.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── projects.controller.js
│   │   │   ├── tasks.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── webhooks.controller.js
│   │   │   └── emails.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── projects.service.js
│   │   │   ├── tasks.service.js
│   │   │   ├── github.service.js
│   │   │   ├── email.service.js
│   │   │   └── gemini.service.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # Verify Firebase tokens
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── socket/
│   │   │   ├── socket.js             # Socket.IO setup
│   │   │   └── chat.socket.js        # Chat event handlers
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   └── server.js                 # Express app setup
│   ├── .env
│   ├── package.json
│   └── nodemon.json
│
├── shared/                            # Shared types/constants (optional)
│   └── types/
│       └── index.ts
│
├── docs/                              # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
└── README.md
```

---

## 🔄 Request/Response Flow Examples

### Example 1: Create Project

```
┌─────────┐                  ┌──────────┐                 ┌──────────┐
│ Browser │                  │ Frontend │                 │ Backend  │
└────┬────┘                  └────┬─────┘                 └────┬─────┘
     │                            │                             │
     │ 1. Click "Create Project"  │                             │
     ├──────────────────────────►│                             │
     │                            │                             │
     │                            │ 2. POST /api/projects       │
     │                            │    Headers: Authorization   │
     │                            │    Body: { name, desc }     │
     │                            ├────────────────────────────►│
     │                            │                             │
     │                            │                             │ 3. Verify token
     │                            │                             │ 4. Validate data
     │                            │                             │ 5. Create in Firestore
     │                            │                             │ 6. Return project
     │                            │◄────────────────────────────┤
     │                            │   { id, name, createdAt }   │
     │                            │                             │
     │ 7. Show success + redirect │                             │
     │◄───────────────────────────┤                             │
     │                            │                             │
```

### Example 2: Real-time Chat

```
┌─────────┐                  ┌──────────┐                 ┌──────────┐
│ User A  │                  │ Frontend │                 │ Backend  │
└────┬────┘                  └────┬─────┘                 └────┬─────┘
     │                            │                             │
     │ 1. Connect to Socket.IO    │                             │
     │                            ├────────────────────────────►│
     │                            │                             │ 2. Authenticate
     │                            │◄────────────────────────────┤
     │                            │    connected: true          │
     │                            │                             │
     │ 3. Type message "Hello"    │                             │
     ├──────────────────────────►│                             │
     │                            │ 4. Emit 'message:send'      │
     │                            ├────────────────────────────►│
     │                            │                             │ 5. Save to Firestore
     │                            │                             │ 6. Broadcast to room
     │                            │◄────────────────────────────┤
     │ 7. Display message         │   'message:received'        │
     │◄───────────────────────────┤                             │
     │                            │                             │
```

---

## 🔧 What Goes Where

### ✅ FRONTEND (Next.js) - UI Only

**Responsibilities:**
- Render pages and components
- Handle user interactions
- Client-side routing
- Form state management
- Socket.IO **client** connection
- Call backend APIs (NO direct Firebase operations)

**Examples:**
```typescript
// ✅ Good - Call backend API
const createProject = async (data) => {
  const response = await fetch('http://localhost:3001/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

// ❌ Bad - Direct Firebase operation
import { collection, addDoc } from 'firebase/firestore'
const createProject = async (data) => {
  await addDoc(collection(db, 'projects'), data) // NO!
}
```

### ✅ BACKEND (Express/Node.js) - Business Logic Only

**Responsibilities:**
- REST API endpoints
- Firebase Admin SDK operations (ONLY place for Firestore writes)
- Authentication verification
- Data validation
- Business logic
- External API calls (GitHub, Resend, Gemini)
- Socket.IO **server** events
- Webhook handling

**Examples:**
```javascript
// ✅ Good - Backend handles Firebase
const createProject = async (req, res) => {
  const { name, description } = req.body
  const userId = req.user.uid // from auth middleware
  
  // Validate
  if (!name) return res.status(400).json({ error: 'Name required' })
  
  // Business logic
  const project = {
    name,
    description,
    ownerId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
  
  // Firebase operation
  const docRef = await db.collection('projects').add(project)
  
  res.json({ id: docRef.id, ...project })
}
```

---

## 📦 Migration Steps

### Phase 1: Setup Backend Structure

1. **Create backend folder structure**
```bash
mkdir -p backend/src/{config,routes,controllers,services,middleware,socket,utils}
```

2. **Initialize backend package.json**
```bash
cd backend
npm init -y
npm install express cors dotenv firebase-admin socket.io
npm install -D nodemon
```

3. **Move server.js logic into backend**
- Move Socket.IO logic to `backend/src/socket/`
- Create Express app in `backend/src/server.js`

### Phase 2: Extract API Routes

Move Next.js API routes to Express:

**Before (Next.js):**
```typescript
// app/api/projects/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  // Firebase logic here
}
```

**After (Express):**
```javascript
// backend/src/routes/projects.routes.js
router.post('/projects', authMiddleware, projectsController.create)

// backend/src/controllers/projects.controller.js
exports.create = async (req, res) => {
  const project = await projectsService.create(req.body, req.user.uid)
  res.json(project)
}

// backend/src/services/projects.service.js
exports.create = async (data, userId) => {
  const docRef = await db.collection('projects').add({
    ...data,
    ownerId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
  return { id: docRef.id, ...data }
}
```

### Phase 3: Update Frontend API Calls

Create API client wrapper:

```typescript
// frontend/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const apiClient = {
  async post(endpoint: string, data: any) {
    const token = await auth.currentUser?.getIdToken()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },
  
  async get(endpoint: string) {
    const token = await auth.currentUser?.getIdToken()
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }
}

// Usage in components
const createProject = async (data) => {
  return apiClient.post('/projects', data)
}
```

### Phase 4: Integrate Socket.IO with Express

```javascript
// backend/src/server.js
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const routes = require('./routes')
const { setupSocket } = require('./socket/socket')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// REST API routes
app.use('/api', routes)

// Socket.IO setup
setupSocket(io)

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
})
```

---

## 🚀 Running the Project

### Development Commands

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Uses nodemon to watch for changes
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev  # Next.js dev server
```

**Terminal 3 - ngrok (for webhooks):**
```bash
ngrok http 3001  # Tunnel to backend
```

### Updated package.json Scripts

**Backend (backend/package.json):**
```json
{
  "name": "bundle-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "tunnel": "ngrok http 3001"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "firebase-admin": "^13.6.0",
    "socket.io": "^4.8.3",
    "@google/generative-ai": "^0.24.1",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Frontend (frontend/package.json):**
```json
{
  "name": "bundle-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.8.3",
    "firebase": "^12.7.0"
  }
}
```

**Root package.json (Optional - for convenience):**
```json
{
  "name": "bundle-monorepo",
  "version": "1.0.0",
  "scripts": {
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "tunnel": "cd backend && npm run tunnel"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## 🔐 Authentication Flow

### How JWT/Firebase Tokens Work

```
┌─────────┐                    ┌──────────┐                   ┌──────────┐
│ Browser │                    │ Frontend │                   │ Backend  │
└────┬────┘                    └────┬─────┘                   └────┬─────┘
     │                              │                               │
     │ 1. Login with email/password │                               │
     ├────────────────────────────►│                               │
     │                              │                               │
     │                              │ 2. Firebase Auth (client SDK) │
     │                              │    Returns ID token           │
     │                              │                               │
     │ 3. Store token in memory     │                               │
     │◄─────────────────────────────┤                               │
     │                              │                               │
     │ 4. Make API request          │                               │
     │                              │ 5. GET /api/projects          │
     │                              │    Authorization: Bearer TOKEN│
     │                              ├──────────────────────────────►│
     │                              │                               │
     │                              │                               │ 6. Verify token
     │                              │                               │    with Firebase Admin
     │                              │                               │ 7. Extract userId
     │                              │                               │ 8. Execute logic
     │                              │◄──────────────────────────────┤
     │                              │    { projects: [...] }        │
     │                              │                               │
```

**Frontend:**
```typescript
const token = await auth.currentUser?.getIdToken()
```

**Backend Middleware:**
```javascript
// backend/src/middleware/auth.middleware.js
const admin = require('firebase-admin')

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken // { uid, email, ... }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## 📊 API Endpoints Reference

### Projects
- `POST   /api/projects` - Create project
- `GET    /api/projects` - List user's projects
- `GET    /api/projects/:id` - Get project details
- `PUT    /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `POST   /api/tasks` - Create task
- `GET    /api/tasks` - List tasks (with filters)
- `GET    /api/tasks/:id` - Get task details
- `PUT    /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Chat (REST + Socket.IO)
- `GET    /api/chat/:projectId/messages` - Get message history
- Socket: `message:send` - Send message
- Socket: `message:received` - Receive message
- Socket: `typing:start` - User typing
- Socket: `user:joined` - User joined room

### Webhooks
- `POST   /api/webhooks/github` - GitHub webhook receiver

### Emails
- `POST   /api/emails/welcome` - Send welcome email
- `POST   /api/emails/reminder` - Send task reminder

---

## 🎯 Benefits of This Architecture

### ✅ Separation of Concerns
- Frontend = UI/UX
- Backend = Business logic + data
- Easy to understand and maintain

### ✅ Scalability
- Deploy frontend to Vercel
- Deploy backend to any Node.js host (Railway, Render, AWS)
- Scale independently based on load

### ✅ Security
- Firebase Admin SDK only in backend (more secure)
- No sensitive logic in frontend code
- Token verification in one place

### ✅ Testability
- Test backend APIs independently
- Mock API responses in frontend tests
- Clear contracts between layers

### ✅ Development Speed
- Frontend and backend teams can work independently
- Clear API contracts
- Easier debugging

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

1. **Don't use Firebase Client SDK for writes in frontend**
```typescript
// ❌ BAD
import { addDoc } from 'firebase/firestore'
await addDoc(collection(db, 'projects'), data)
```

2. **Don't hardcode API URLs**
```typescript
// ❌ BAD
fetch('http://localhost:3001/api/projects')

// ✅ GOOD
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`)
```

3. **Don't put business logic in frontend**
```typescript
// ❌ BAD - Complex calculations in frontend
const calculateProjectRisk = (project) => {
  // 100 lines of logic
}

// ✅ GOOD - Call backend endpoint
const risk = await apiClient.get(`/projects/${id}/risk`)
```

4. **Don't skip authentication middleware**
```javascript
// ❌ BAD
router.post('/projects', projectsController.create)

// ✅ GOOD
router.post('/projects', authMiddleware, projectsController.create)
```

---

## 📝 Migration Checklist

### Phase 1: Backend Setup ✅
- [ ] Create backend folder structure
- [ ] Setup Express server
- [ ] Configure Firebase Admin
- [ ] Create auth middleware
- [ ] Setup Socket.IO integration

### Phase 2: API Migration ✅
- [ ] Move auth endpoints
- [ ] Move project endpoints
- [ ] Move task endpoints
- [ ] Move webhook endpoints
- [ ] Move email endpoints

### Phase 3: Frontend Updates ✅
- [ ] Create API client wrapper
- [ ] Update all API calls to use backend
- [ ] Update Socket.IO client connection
- [ ] Remove Firebase write operations from frontend
- [ ] Keep only Firebase Auth in frontend

### Phase 4: Testing ✅
- [ ] Test all API endpoints with Postman
- [ ] Test authentication flow
- [ ] Test Socket.IO real-time features
- [ ] Test GitHub webhooks
- [ ] Test email sending

### Phase 5: Deployment ✅
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Update environment variables
- [ ] Setup ngrok/permanent webhook URL
- [ ] Monitor logs

---

## 🎬 Final Architecture Summary

```
BEFORE (Current):
├── Mixed logic everywhere
├── Firebase in frontend AND backend/folder
├── Separate Socket.IO server
└── Hard to scale/deploy

AFTER (Proposed):
┌─────────────────────────────────────┐
│  FRONTEND (Next.js)                 │
│  • UI Components                    │
│  • API Calls → Backend              │
│  • Firebase Auth (client SDK only) │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  BACKEND (Express + Socket.IO)      │
│  • REST API                         │
│  • Business Logic                   │
│  • Firebase Admin (ALL operations)  │
│  • Real-time via Socket.IO          │
│  • External services                │
└─────────────────────────────────────┘
```

**Key Principle:**
- Frontend: "What the user sees"
- Backend: "What actually happens"

---

## 🔗 Next Steps

1. Review this document
2. Ask questions if anything is unclear
3. I'll help you:
   - Create the backend folder structure
   - Migrate one API endpoint as an example
   - Update frontend to call the new backend
   - Setup development workflow

**Ready to start?** Let me know which phase you want to begin with!
