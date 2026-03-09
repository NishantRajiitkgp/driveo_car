# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is the repository for **Driveo** — a proprietary two-sided marketplace platform ("Uber for car washing") targeting the GTA market. It contains planning documents and an existing marketing landing page.

### Planning Documents

| File | Purpose |
|---|---|
| `DRIVEO_ARCHITECTURE.md` | **Primary source of truth.** Complete system architecture, pricing model, Driveo Slide spec, database schema, API routes, development roadmap |
| `GTA_Car_Detailing_Dossier.md` | Market research dossier: TAM/SAM/SOM, competitor landscape, demand drivers |

> **Note**: `GLEAM_Business_Plan.md` and `GLEAM_Experience_Build.md` are legacy documents from when the project was called "GLEAM" with a different pricing model. They are **outdated** and should NOT be used as reference. Use `DRIVEO_ARCHITECTURE.md` instead.

### Landing Page

A standalone React landing page in `Glean-Modern/` (separate git repo, being renamed to Driveo). Single-page marketing site built with Vite + React 19 + Tailwind CSS v4 + Framer Motion.

**Dev commands** (run from `Glean-Modern/`):
```bash
npm install          # install dependencies
npm run dev          # dev server on port 3000
npm run build        # production build (outputs to dist/)
npm run lint         # type-check only (tsc --noEmit)
npm run clean        # remove dist/
```

**Design tokens**: Dark theme (`#050505` bg), accent red (`#E23232`). Fonts: Anton (display), Inter (body), JetBrains Mono (mono), Playfair Display (serif italic).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (stable) with App Router, TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui (customized to Driveo branding) |
| Database | Supabase (PostgreSQL with Row Level Security) |
| Auth | Supabase Auth — email/phone OTP; roles: `customer`, `washer`, `admin` |
| File storage | Supabase Storage (before/after job photos in private buckets, signed URLs) |
| Real-time | Supabase Realtime (live washer GPS tracking + booking status push) |
| Payments | Stripe (pre-auth on booking, capture after wash) + Stripe Connect (washer payouts) |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| SMS | Twilio |
| Email | Resend + React Email |
| Maps | Google Maps API (autocomplete + live tracking) |
| Vehicle Images | Vehicle image API (CarAPI / CarsXE) for Driveo Slide |
| Dirt Effect | HTML Canvas with texture overlays (multiply blend mode) |
| Deployment | Vercel (production: driveo.ca, staging: dev.driveo.ca) |
| Monitoring | Sentry |

Initialize the project with:
```bash
npx create-next-app@latest driveo --typescript --tailwind --app
```

## Platform Architecture

Three distinct web apps within a single Next.js monorepo:

```
driveo.ca/           → Marketing site (SSR, SEO, plan pages)
driveo.ca/app/*      → Customer PWA (booking, Driveo Slide, vehicle profiles, subscriptions, live tracking)
driveo.ca/washer/*   → Washer PWA (job queue, accept/decline, before/after photos, earnings)
driveo.ca/admin/*    → Admin dashboard (washers, customers, bookings, pricing, payouts)
```

## User Roles

Three roles defined in `user_metadata.role` via Supabase Auth, enforced via RLS:
- `customer` — books washes, manages vehicles/subscriptions
- `washer` — receives jobs (auto-assigned), completes washes, uploads photos
- `admin` — full platform management

## Key Business Rules

- **Brand**: Driveo (driveo.ca)
- **Pricing model**: Plan + Vehicle Type Multiplier + Dirt Level Multiplier
- **Three wash plans**: Regular ($18), Interior & Exterior ($25), Detailing ($189)
- **Washer payouts**: Regular/I&E = $11 per wash, Detailing = $22 per wash — via Stripe Connect
- **Payment flow**: Pre-authorize card on booking, capture payment after wash completion (Uber model)
- **Driveo Slide**: Dirt level slider (0-10) with visual car dirt overlay. Levels 0-5 = base price. Levels 6-10 = increasing surcharge multiplier.
- **Washer assignment**: Fully automated — nearest available washer (Uber model)
- **Real-time tracking**: Customer sees live washer location on map
- **Before/after photos**: Mandatory on every job
- **Booking types**: Instant (ASAP) or Scheduled (pick date/time)
- **Monthly membership**: 8 washes/month based on selected plan
- **Non-solicitation**: washers cannot contact Driveo customers directly

## Vehicle Type Multipliers

| Vehicle Type | Multiplier |
|---|---|
| Sedan/Coupe | 1.0x (base) |
| Crossover | 1.15x |
| SUV | 1.25x |
| Minivan | 1.25x |
| Pickup | 1.20x |
| Large SUV/Truck | 1.40x |

## Dirt Level Multipliers (Driveo Slide)

| Level | Multiplier | Description |
|---|---|---|
| 0-5 | 1.0x | Base price (light to normal dirt) |
| 6 | 1.15x | Moderately dirty |
| 7 | 1.30x | Dirty |
| 8 | 1.50x | Very dirty |
| 9 | 1.75x | Heavily soiled |
| 10 | 2.0x | Extreme (mud, heavy grime) |

**Price formula**: `Plan Base Price × Vehicle Multiplier × Dirt Multiplier`

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend
RESEND_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Vehicle Images
VEHICLE_IMAGE_API_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
```
