# AGENTS.md — Denty Development Guide

## Project Overview
Denty is a dental appointment booking platform. See `PRD.md` for the full product spec.

## Tech Stack
- **Framework:** TanStack Start (SSR) with TanStack Router + TanStack Query
- **Database:** MongoDB with official Node.js driver (no Mongoose, no Prisma)
- **UI:** shadcn/ui + Tailwind CSS v4 + Radix UI
- **AI Chatbot:** OpenAI GPT-4 via `openai` SDK
- **WhatsApp:** WhatsApp Business Cloud API (Meta)
- **Email:** Resend + React Email
- **i18n:** i18next + react-i18next (Spanish + English)
- **Linter/Formatter:** Biome.js
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Docker + Kubernetes + Helm

## Project Structure
```
src/
├── routes/          # File-based routing (TanStack Router)
├── components/      # React components
│   ├── ui/          # shadcn/ui primitives
│   └── layout/      # Header, Footer
├── server/          # Server functions (TanStack Start)
├── lib/             # Utilities, DB connection, collection types
├── adapters/        # Clinic management system adapters
├── data/            # Mock data (will be replaced by MongoDB)
├── i18n/            # Translation files (es.json, en.json)
├── emails/          # React Email templates
└── styles.css       # Global styles (Tailwind)
```

## Key Conventions

### Routing
- File-based routing via TanStack Router
- Dynamic params use `$paramName` (e.g., `$clinicSlug.tsx`)
- Route tree auto-generated — do NOT edit `routeTree.gen.ts` manually

### Internationalization
- ALL user-facing text must use `useTranslation()` from react-i18next
- Add keys to both `src/i18n/es.json` AND `src/i18n/en.json`
- Localized DB fields use `Record<string, string>` keyed by locale
- Default language: Spanish

### Database
- MongoDB collections defined in `src/lib/collections.ts`
- Use `getDb()` from `src/lib/db.ts` for connections
- No Mongoose, no Prisma — use the official MongoDB driver directly
- Type collections with TypeScript interfaces

### Styling
- Tailwind CSS v4 (uses `@theme` in CSS, not `tailwind.config.js`)
- shadcn/ui components in `src/components/ui/`
- Follow existing component patterns for consistency
- Mobile-first responsive design

### Code Quality
- Run `npx biome check .` before committing
- Run `npx biome check --write .` to auto-fix
- Run `npx tsc --noEmit` to type-check
- Run `npm test` for unit tests
- CSS files excluded from Biome (Tailwind v4 `@theme` not supported)

### Testing
- Unit tests: colocated with source (`*.test.ts`) — Vitest
- E2E tests: `e2e/` directory — Playwright
- Coverage target: 90% (not enforced yet)

### Git Workflow
- Feature branches from `main`
- Squash merge PRs
- Commit messages: `type: description` (feat, fix, chore, docs, test)

## Environment Variables
See `.env.example` for required variables:
- `MONGODB_URI` — MongoDB connection string
- `WHATSAPP_TOKEN` — WhatsApp Business API token
- `WHATSAPP_PHONE_NUMBER_ID` — WhatsApp sender phone number ID
- `OPENAI_API_KEY` — OpenAI API key
- `RESEND_API_KEY` — Resend email API key
- `JWT_SECRET` — Admin JWT signing secret

## Implementation Status
See `PRD.md` Section 11 for phases. Check git log for current progress.

## Deployment
See `DEPLOYMENT.md` for Docker, Kubernetes, and Helm setup.
