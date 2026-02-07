# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuoitoi ("nuôi tôi" = support me) is a Vietnamese donation tracking and expense budgeting application. It displays donations with real-time updates and tracks monthly expense budgets. Built with Next.js 15 App Router, React 19, and Supabase.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint with Next.js and TypeScript rules
```

No test framework is currently configured.

## Architecture

### Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **Database:** Supabase (PostgreSQL with real-time subscriptions)
- **UI:** Tailwind CSS 4 + shadcn/ui (New York style) + Radix primitives
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/api/` - Backend endpoints (donations, expenses, stats)
- `components/ui/` - shadcn/ui components
- `lib/supabase/` - Supabase clients (browser + server) and types
- `lib/confetti.ts` - 8 confetti animation presets using canvas-confetti

### API Routes
- `GET/POST /api/donations` - List (20 most recent) and create donations
- `GET /api/donations/stats` - Donation statistics (total, count, weekly donors, progress)
- `GET /api/expenses` - Current month's expense categories with budget tracking
- `POST /api/payos/create-payment` - Create PayOS payment link, returns QR code
- `POST /api/payos/webhook` - PayOS webhook receiver, inserts donation on success
- `GET /api/payos/status/[orderCode]` - Poll payment status by order code

### Data Flow
All API endpoints gracefully fall back to mock data when Supabase is not configured, enabling local development without database setup.

### Real-time Pattern
The main page subscribes to Supabase real-time changes on the donations table. New donations trigger UI updates and confetti effects automatically.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PayOS payment integration (server-side only)
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
```

The app works without these (uses mock data). PayOS endpoints return mock responses when credentials are not set.

## Conventions

- Path alias: `@/*` maps to project root
- Components use `cva` for variants and `cn()` utility for class merging
- Tailwind uses OKLCH color space with CSS custom properties for theming
- Language: Vietnamese for user-facing content
