# MAFS Portal

## What This Is

A unified web application for the Moroccan American Financial Support (MAFS) organization — a Takaful-based mutual aid fund serving the Moroccan-American community. The app serves two audiences from a single gateway: members who apply, track coverage, file requests, and manage their profile; and staff who manage the member database, process claims, model financial projections, and monitor fund reserves.

## Core Value

Any community member can understand their coverage, apply for membership, and file a request — while staff can manage the entire fund — all from one place.

## Requirements

### Validated

- ✓ Gateway with Member / Staff entry split — existing
- ✓ Member portal: Mission & values page, premium calculator, become-a-member application flow — existing
- ✓ Member portal: Profile page with heritage discount program — existing
- ✓ Staff portal: Member database, membership requests, coverage modeling tabs — existing
- ✓ Financial engine: premium calculation logic, age/tier/FICO-based pricing — existing
- ✓ Coverage tiers: Basic / Standard / Premium with defined limits — existing
- ✓ Coverage types: Medical, Financial, Funeral, Emergency Travel — existing
- ✓ Financial dashboard: Projections, Reserves, ClaimsTool, Dashboard views — existing (separate app)
- ✓ Brand identity: maef-green (#0D5F3A) + gold (#D4A843), Tailwind CSS — existing
- ✓ Netlify deployment connected to GitHub — existing

### Active

- [ ] Rebuild as a single unified React/TypeScript/Vite app (replacing the two separate apps)
- [ ] Integrate all financial dashboard tools (Projections, Reserves, ClaimsTool, Dashboard) into the staff portal
- [ ] Complete member-side placeholder sections: File a Request, Contact Support, Update Profile
- [ ] Wire up Supabase for real authentication (member login, staff login)
- [ ] Wire up Supabase for real data: member records, claim records, membership requests
- [ ] Full UI/UX redesign using the MAFS green/gold brand system (ui-ux-pro-max)
- [ ] Deploy unified app to Netlify at existing URL

### Out of Scope

- Mobile native app — web-first, mobile-responsive is sufficient
- Payment processing / Stripe — contributions tracked manually by staff for now
- Email/push notifications — future milestone
- Real background/credit check API integration — staff handles this manually
- Multi-language support (Arabic/French) — future milestone

## Context

Two existing React/TypeScript/Vite apps live in this monorepo under `mafs-financial-dashboard/` and `mafs-member-portal/`. Both are feature-rich but separate. The member portal has the correct architecture (gateway → member/staff split) and is deployed to https://moroccan-american-consulting-society.netlify.app/. The financial dashboard is a standalone internal tool that was never merged in.

Supabase is already installed in the member portal (`@supabase/supabase-js`). Auth and database schema need to be designed and wired up.

The existing financial engine (`services/engine.ts`) contains the premium calculation logic and must be preserved exactly in the unified app.

## Constraints

- **Tech stack**: React 19, TypeScript, Vite, Tailwind CSS, Supabase — no changes
- **Deployment**: Netlify auto-deploy from GitHub main branch — push to deploy
- **Brand**: maef-green (#0D5F3A) + gold (#D4A843) are non-negotiable brand colors
- **Preserve**: All existing business logic (premium engine, tier limits, coverage rules) must carry over unchanged
- **Single app**: Output must be one deployable app, not two

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Member portal as architectural base | Has the correct gateway + member/staff split already; financial dashboard gets merged in | — Pending |
| Fresh unified app (not patch) | Clean merge avoids dependency conflicts and duplicate logic between the two apps | — Pending |
| Supabase for auth + data | Already installed; community-friendly pricing; matches existing stack | — Pending |
| ui-ux-pro-max for design | User explicitly requested professional design treatment with green/gold theme | — Pending |

---
*Last updated: 2026-03-23 after initialization*
