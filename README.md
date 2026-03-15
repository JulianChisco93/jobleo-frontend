# Jobleo Frontend

Bilingual (English/Spanish) SaaS web app for automated job search with WhatsApp delivery.

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS v4** — design tokens match Jobleo brand
- **Supabase Auth** — email/password + Google OAuth
- **next-intl v4** — i18n (English + Spanish)
- **React Hook Form + Zod** — all forms
- **TanStack Query v5** — API calls and caching

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Fill in `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.jobleo.app
```

Get these from your [Supabase project dashboard](https://supabase.com/dashboard).

### 3. Supabase Auth setup

In your Supabase project:
- Enable **Email** authentication provider
- Enable **Google** OAuth provider (add Google credentials)
- Add redirect URL: `http://localhost:3000/auth/callback` (+ your production URL)

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page | Public |
| `/pricing` | Pricing plans | Public |
| `/login` | Login / Register | Public |
| `/onboarding` | 3-step setup wizard | Authenticated |
| `/dashboard` | Main dashboard | Authenticated |
| `/dashboard/profiles` | Search profile list | Authenticated |
| `/dashboard/profiles/new` | Create profile | Authenticated |
| `/dashboard/profiles/:id` | Edit profile | Authenticated |
| `/dashboard/jobs` | Job history table | Authenticated |
| `/dashboard/jobs/:id` | Job detail | Authenticated |
| `/dashboard/settings` | Account settings | Authenticated |

## Routing Rules

- Unauthenticated users accessing `/dashboard/*` or `/onboarding` are redirected to `/login`
- After login: users with no CV → `/onboarding`, users with CV → `/dashboard`
- Onboarding is skippable at each step

## i18n

- Languages: **English** (default, no URL prefix) and **Spanish** (`/es/...`)
- Language toggle in navbar and settings page
- Persisted in `localStorage` as `jobleo-locale`
- Message files: `messages/en.json` and `messages/es.json`

## Project Structure

```
app/
  [locale]/
    page.tsx             # Landing (/)
    pricing/page.tsx     # Pricing (/pricing)
    login/page.tsx       # Auth (/login)
    onboarding/page.tsx  # Onboarding wizard
    dashboard/
      layout.tsx         # Auth guard + sidebar shell
      page.tsx           # Dashboard home
      profiles/          # List, New, Edit
      jobs/              # History, Detail
      settings/page.tsx
components/
  layout/                # PublicNavbar, PublicFooter, DashboardSidebar, DashboardTopBar
  ui/                    # TagInput, Toggle, ScoreBadge, LangToggle
  profiles/              # ProfileForm (shared new/edit)
  providers/             # QueryProvider (TanStack Query)
lib/
  supabase/client.ts     # Browser client
  supabase/server.ts     # Server Component client
  api.ts                 # All API calls → https://api.jobleo.app
  types.ts               # TypeScript interfaces
messages/
  en.json                # English strings
  es.json                # Spanish strings
i18n/routing.ts          # next-intl locale routing config
i18n/request.ts          # next-intl server config
middleware.ts            # next-intl routing + auth redirect
```

## Build

```bash
npm run build
npm start
```

## Git Remote

```bash
git remote add origin https://github.com/JulianChisco93/jobleo-frontend.git
git branch -M main
git push -u origin main
```
