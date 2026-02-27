# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is the planning repository for **GLEAM Auto Care Inc.** — a proprietary two-sided marketplace platform ("Uber for car detailing") targeting the GTA market. No application code exists yet. The repo currently contains three foundational documents:

| File | Purpose |
|---|---|
| `GLEAM_Business_Plan.md` | Full business plan: model, market, financials, go-to-market, operations |
| `GLEAM_Experience_Build.md` | Complete PRD: database schema, API routes, UI specs, feature scope for the MVP build |
| `GTA_Car_Detailing_Dossier.md` | Market research dossier: TAM/SAM/SOM, competitor landscape, demand drivers |

## Planned Tech Stack

When building the platform, use exactly this stack (defined in the business plan):

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ with App Router, TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL with Row Level Security) |
| Auth | Supabase Auth — email/phone OTP; roles: `customer`, `provider`, `admin` |
| File storage | Supabase Storage (before/after job photos in private buckets, signed URLs) |
| Real-time | Supabase Realtime (Phase 2: live provider GPS tracking) |
| Payments | Stripe + Stripe Connect (subscriptions + provider payouts) |
| SMS | Twilio |
| Email | Resend + React Email |
| Maps | Google Maps API (address autocomplete MVP; live tracking Phase 2) |
| Deployment | Vercel (production: gleam.ca, staging: dev.gleam.ca) |
| Monitoring | Sentry |

Initialize the project with:
```bash
npx create-next-app@latest gleam --typescript --tailwind --app
```

## Platform Architecture

Three distinct web apps within a single Next.js monorepo, separated by route segments:

```
gleam.ca/           → Marketing site (SSR, SEO landing pages, local SEO, plan pages)
gleam.ca/app/*      → Customer PWA (booking, vehicle profiles, subscriptions, job tracking, photo viewer)
gleam.ca/provider/* → Provider PWA (job queue, accept/decline, before/after photo upload, earnings)
gleam.ca/admin/*    → Admin dashboard (providers, customers, bookings, pricing, payouts)
gleam.ca/fleet/*    → Fleet portal (Phase 2)
```

## User Roles & Database

Three roles defined in `user_metadata.role` via Supabase Auth, enforced at the DB level via RLS on all tables:
- `customer` — books services, manages vehicles/subscriptions
- `provider` — receives and completes jobs, uploads photos
- `admin` — full platform management

The complete database schema (all tables, columns, RLS policies) is specified in `GLEAM_Experience_Build.md` Section 3.

## Key Business Rules to Encode

- **Pricing is vehicle-type-based**: sedan / SUV / pickup / minivan matrix — not flat-rate
- **Partner payout rate**: 45% of job revenue, paid within 48 hrs of completion via Stripe Connect
- **Before/after photos are mandatory** on every job — 5 photos each from specified angles
- **Subscription plans**: GLEAM Go ($59), Plus ($109), Full ($189), Prime ($299) — no rollover, 30-day cancel
- **Fleet plans**: minimum 3 vehicles, monthly invoice net-15
- **Non-solicitation**: providers cannot contact GLEAM customers directly — enforce at the data layer (no customer contact info exposed to providers)

## MVP vs. Phase 2 Scope

The MVP (Months 1–4) excludes: real-time provider GPS map, auto provider matching (admin assigns manually in MVP), native iOS/Android apps, fleet portal, referral program, and push notifications. These are Phase 2. Build MVP scope only unless told otherwise.

## Environment Variables Needed

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
```
