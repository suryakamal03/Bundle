# Ontrackr

A modern, production-ready project management platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Unified Project Dashboard** - Single dashboard for all projects with detailed project views
- **Task Management** - Create, assign, and track tasks with priorities and deadlines
- **Team Collaboration** - Real-time chat, team management, and developer profiles
- **AI-Powered Features** - AI project assistant, flowchart generator, and risk alert detection
- **Admin Panel** - Manage developers, projects, and system-wide settings
- **Authentication** - Login, signup, password reset, and email verification
- **Settings** - Profile management, notifications, GitHub integration, and appearance customization

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
Ontrackr/
├── app/
│   ├── admin/              # Admin panel
│   ├── auth/               # Authentication pages
│   ├── chat/               # Real-time chat
│   ├── developer-profile/  # Developer profile page
│   ├── flowchart/          # AI flowchart generator
│   ├── my-dashboard/       # Personal dashboard
│   ├── projects/           # Unified project dashboard
│   ├── risk-alerts/        # Risk alerts management
│   ├── settings/           # Settings page
│   ├── tasks/              # Task management
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── layout/             # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── projects/           # Project dashboard components
│   │   ├── AIAssistant.tsx
│   │   ├── FlowchartPreview.tsx
│   │   ├── GlobalStats.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectGitHub.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ProjectRisks.tsx
│   │   ├── ProjectTasks.tsx
│   │   ├── ProjectTeam.tsx
│   │   └── RecentActivity.tsx
│   └── ui/                 # Reusable UI components
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── mockData.ts         # Mock data for development
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
└── package.json
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Pages

### Authentication
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/forgot-password` - Password reset
- `/auth/verify` - Email verification

### Dashboards
- `/projects` - Unified project dashboard with project list and detailed project views
- `/my-dashboard` - Personal task dashboard

### Features
- `/tasks` - Task management with table view
- `/chat` - Real-time team chat
- `/flowchart` - AI-powered flowchart generator
- `/risk-alerts` - Project risk management
- `/admin` - Admin panel for managing developers and projects
- `/developer-profile` - Developer profile with GitHub activity
- `/settings` - User settings and preferences

## Customization

### Colors
Primary colors can be customized in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#3b82f6',
    600: '#2563eb',
    // ...
  },
}
```

### Components
All UI components are located in `components/ui/` and can be customized or extended as needed.

## License

© 2025 Ontrackr. All rights reserved.
