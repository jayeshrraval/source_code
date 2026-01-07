# YOUWARE.md - યોગી સમાજ સંબંધ Mobile Web App

## Project Overview

**યોગી સમાજ સંબંધ (Yogi Samaj Sambandh)** is a premium Gujarati matrimony and community mobile web application built for the Raval Yogi Samaj community. Includes **family registration system** and **education hub module** with real backend data persistence.

**Project Type**: Mobile-first React Web Application (simulating native mobile experience)  
**Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion  
**Backend**: Cloudflare Workers + D1 (SQLite) via Youware Backend  
**Language**: Gujarati (primary) + English (secondary)  
**Design System**: Premium UI with mint (#9FD7C1), deep blue (#0B4F6C), royal gold (#D4AF37)

## Project Status

✅ **Complete UI Implementation** - 21 active screens implemented (Mentorship & Parents Guide archived)  
✅ **Production Build Successful** - No build errors  
✅ **Navigation Wired** - React Router with bottom tabs and stack navigation  
✅ **Backend Integration** - Family registration with Youware Backend  
✅ **Education Module** - Student profiles, scholarships, achievers, daily guidance  
✅ **Responsive Design** - Mobile-first with touch-optimized interactions

## Architecture

### Screen Structure (21 Active Screens)

**Authentication Flow:**
1. **Splash Screen** (`/`)
2. **Login/Register Screen** (`/login`)

**Main App (Bottom Tab Navigation):**
3. **Home Dashboard** (`/home`)
4. **Matrimony Hub** (`/matrimony`)
5. **Yogigram Feed** (`/yogigram`)
6. **Messages Center** (`/messages`)
7. **Profile Screen** (`/profile`)

**Stack Screens:**
8. **Community Trust** (`/trust`)
9. **Subscription Center** (`/subscription`)
10. **AI Assistant** (`/ai-assistant`)
11. **Settings** (`/settings`)
12. **Notifications** (`/notifications`)
13. **About/Help** (`/about`)

**Family Registration System:**
14. **Family List** (`/family-list`)
15. **Family Registration** (`/family-register`)
16. **Family Detail** (`/family/:id`)

**Education Module:**
17. **Education Hub** (`/education`) - Cards for 4 sections
18. **Student Profile** (`/education/students`)
19. **Scholarships** (`/education/scholarships`)
20. **Achievers** (`/education/achievers`)
21. **Daily Guidance** (`/education/daily-guidance`)

**Archived Screens (in `/archive`):**
- **MentorshipScreen.tsx** (unused)
- **ParentsGuideScreen.tsx** (unused)

### Directory Structure

```
src/
├── pages/              # Active screen components
├── components/         # Reusable UI components
├── services/           # API service modules
├── types/              # TypeScript type definitions
├── theme/              # Design system
├── data/               # Legacy mock data
├── App.tsx             # Route configuration
└── index.css           # Global styles

archive/                # Deprecated/unused screens
├── MentorshipScreen.tsx
└── ParentsGuideScreen.tsx

backend/                # Cloudflare Worker backend
├── src/
│   └── index.ts        # API endpoints (family registration)
├── schema.sql          # Database schema
└── package.json
```

## Education Module API Endpoints (Backend Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/students` | Student profiles CRUD |
| GET | `/api/students/:id` | Get student by ID |
| GET/POST | `/api/scholarships` | Scholarship listings |
| PUT/DELETE | `/api/scholarships/:id` | Admin: Update/delete scholarship |
| GET/POST | `/api/achievers` | Community achievers |
| GET/POST | `/api/guidance-posts` | Daily guidance posts |
| GET | `/api/guidance-posts/today` | Today's guidance |

*Mentorship endpoints removed until feature reinstated.*

## Development Commands

```bash
# Install dependencies
npm install

# Production build (MANDATORY after changes)
npm run build

# Deploy backend
cd backend && npm install
```

## Important Notes

### Frontend-Only Implementation
- Active education screens rely on real backend APIs (no mock data)
- `educationApi.ts` contains service layer
- Archived screens remain in `/archive` for future reference

### Platform Constraints
- Mobile web application (Vite + React)
- Not a native Android/iOS app; wrap with Capacitor if native packaging needed

### Build Requirements
- **ALWAYS** run `npm run build` after code changes
- Build must succeed before task completion

---

**Version**: 1.3.0  
**Build Status**: ✅ Production Ready  
**Last Updated**: December 2024