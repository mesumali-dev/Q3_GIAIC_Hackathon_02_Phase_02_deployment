# Frontend Development Guidance

This file provides context-specific guidance for AI assistants working on the frontend.

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth (JWT-based)
- **Package Manager**: npm

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   └── api/             # API routes (future)
│   ├── components/          # React components (future)
│   └── lib/
│       ├── auth.ts          # Better Auth placeholder
│       └── api.ts           # API client placeholder
├── public/                  # Static assets
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── .env.example             # Environment template
└── CLAUDE.md                # This file
```

## Key Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

## Constitution Principles (Frontend-Specific)

### Security by Default
- Frontend MUST attach JWT token to every API request
- NEVER store sensitive data in localStorage (use httpOnly cookies)
- All data MUST come from backend APIs only
- NEVER directly access the database

### Frontend Standards
- UI MUST be responsive and mobile-friendly
- Use Tailwind CSS for styling
- Client-side state MUST only handle UI concerns
- No business logic in frontend

### API Communication
- Use the API client in `lib/api.ts` for all backend calls
- Handle errors gracefully with user-friendly messages
- Show loading states during API calls

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `BETTER_AUTH_SECRET` | Shared auth secret | Yes |

## Current Status

- **Phase**: Foundation (Phase 1)
- **Layout**: ✅ Implemented
- **Home Page**: ✅ Placeholder implemented
- **Auth**: Placeholder only
- **API Client**: Placeholder only

## Development Notes

1. Always run `npm install` after pulling changes
2. Copy `.env.example` to `.env.local` before running
3. Development server: `npm run dev` (http://localhost:3000)
4. Backend must be running for API calls to work

## App Router Conventions

- Pages go in `src/app/` with folder-based routing
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries
- Server Components are the default
- Add `'use client'` directive for Client Components
