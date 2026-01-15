# Bundle

A modern, developer-focused project management platform designed to help teams plan, track, and collaborate on projects with clarity and minimal overhead.  
Built with a **clean frontend–backend architecture** and focused on **project-centric workflows**, real-time collaboration, and developer productivity.

---

##  Overview

Traditional project management tools rely heavily on manual updates and disconnected workflows, which often result in outdated task statuses and reduced productivity.  

**Bundle** addresses these challenges by:
- Keeping tasks scoped within projects for proper context
- Providing real-time collaboration features
- Maintaining clear separation between frontend and backend logic
- Integrating directly with GitHub for automated updates

**Goal:** Help teams focus on building software, not managing progress.

---

##  Features

### Core Features
- **Unified Project Dashboard** - View and manage all projects from a single interface with detailed insights
- **Project-Scoped Task Management** - Tasks exist inside projects to maintain proper context and organization
- **Real-Time Collaboration** - Live chat and updates using Socket.IO for instant team communication
- **GitHub Integration** - Automated activity tracking, webhook support, and commit/PR monitoring
- **Email Notifications** - Automated email system for task assignments, deadlines, and project updates
- **Deadline Reminders** - Automated reminder system to keep teams on track
- **Team Invitations** - Invite system for adding members to projects and teams

### AI-Assisted Features
- **AI Project Assistant** - Intelligent project guidance powered by Google Gemini
- **Flowchart Generator** - Automatically generate project flowcharts
- **Risk Alert Detection** - Proactive identification of project risks

### Administrative
- **Authentication** - Secure login, signup, email verification, and password reset

---

##  Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Server:** Express.js
- **Real-Time:** Socket.IO
- **Process Manager:** Nodemon

### Database & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Admin SDK:** Firebase Admin
- **AI Integration:** Google Gemini API
- **Version Control:** GitHub API & Webhooks

### Development Tools
- **Tunneling:** ngrok (for local webhook testing)
- **Linting:** ESLint
- **Type Checking:** TypeScript

---

## ⚙️ Local Development Setup

This project requires **three terminals** to run locally.

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Firebase project** (for Firestore & Auth)
- **ngrok account** (for webhook testing)

### 1️ Terminal 1 – Frontend (Next.js)

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

**Runs at:** `http://localhost:3000`

### 2️ Terminal 2 – Backend (Node.js + Express + Socket.IO)

```bash
# Start the backend server
nodemon server.js
```

**Responsible for:**
- API endpoint handling
- Business logic execution
- Firebase Firestore operations
- Real-time Socket.IO communication
- GitHub webhook processing

### 3️ Terminal 3 – ngrok (Expose Local Server)

```bash
# Expose local server for external access
npx ngrok http 3000
```

**Used for:**
- GitHub webhook delivery during development
- Testing external integrations
- Real-time testing across devices

---

##  Environment Variables

Create a `.env.local` file in the root directory:

```env
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration (if using email service)
EMAIL_SERVICE_API_KEY=your_email_api_key
```

---

##  Available Scripts

```bash
npm run dev      # Start Next.js development server
npm run build    # Build frontend for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

##  Pages & Routes

### Authentication
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/forgot-password` - Password reset
- `/auth/verify` - Email verification

### Dashboards
- `/projects` - Unified project dashboard with project list
- `/project-dashboard` - Detailed project view with tasks, team, and GitHub integration
- `/my-dashboard` - Personal task overview and assigned work
- `/dashboard` - Main dashboard overview

### Features
- `/tasks` - Task management with table view
- `/chat` - Real-time team chat with Socket.IO
- `/flowchart` - AI-powered flowchart generator using Gemini
- `/risk-alerts` - Project risk management and alerts
- `/developer-profile` - Developer profile with GitHub activity tracking
- `/settings` - User preferences, notifications, and integrations

### Administration
- `/admin` - Admin panel for managing users, projects, and system settings
- `/invites/[inviteId]` - Team invitation acceptance

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/emails/*` - Email notification system
- `/api/invites/*` - Team invitation management
- `/api/reminders/*` - Deadline reminder system
- `/api/user/*` - User management
- `/api/webhooks/*` - GitHub webhook handlers

---
##  Architecture Notes

### Frontend–Backend Separation
- **Frontend:** Next.js handles all UI, routing, and client-side logic
- **Backend:** Express server manages business logic, database operations, and Socket.IO
- **Communication:** HTTP APIs and WebSocket connections

### Service Layer Architecture
All business logic is organized into dedicated services:
- `authService.ts` - Authentication & user management
- `projectService.ts` - Project operations
- `taskService.ts` - Task CRUD operations
- `chatService.ts` - Real-time messaging
- `githubService.ts` - GitHub API integration
- `geminiService.ts` - AI-powered features

### Project-Centric Design
- Tasks are **scoped to projects**, not globally managed
- Each project has its own tasks, team, and GitHub integration
- Better organization and context for development teams

### Real-Time Features
- Socket.IO enables live chat and real-time updates
- Automatic notifications for task assignments and updates
- GitHub webhooks provide instant activity tracking

### Development Workflow
- **ngrok** is used **only for local development** to test webhooks
- Three-terminal setup ensures clean separation of concerns
- Hot reload for both frontend and backend during development

---
##  Additional Documentation

For detailed implementation guides, refer to:
- [GITHUB_ACTIVITY_GUIDE.md](GITHUB_ACTIVITY_QUICKSTART.md) - GitHub integration setup
- [TASK_MANAGEMENT_GUIDE.md](TASK_MANAGEMENT_GUIDE.md) - Task management features
- [EMAIL_SYSTEM_GUIDE.md](EMAIL_SYSTEM_GUIDE.md) - Email notification system
- [REALTIME_CHAT_GUIDE.md](REALTIME_CHAT_GUIDE.md) - Chat implementation
- [AI_TASK_ASSIGNER_GUIDE.md](AI_TASK_ASSIGNER_GUIDE.md) - AI features
- [DEADLINE_REMINDERS_GUIDE.md](DEADLINE_REMINDERS_GUIDE.md) - Reminder system

---

##  Contributing

This is a private project. For questions or suggestions, please contact the maintainer.

---

##  License

© 2025 Bundle. All rights reserved.
