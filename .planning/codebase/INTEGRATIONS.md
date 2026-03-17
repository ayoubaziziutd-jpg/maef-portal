# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**Google AI (Financial Dashboard):**
- Gemini API - AI-powered analysis for financial projections
  - SDK/Client: Google Gemini API (client-side JavaScript)
  - Auth: `GEMINI_API_KEY` environment variable
  - Config location: `mafs-financial-dashboard/vite.config.ts` (injected as `process.env.GEMINI_API_KEY`)
  - Usage: AI Studio integration for dashboard functionality

## Data Storage

**Databases:**
- Supabase (Member Portal only)
  - Type: PostgreSQL managed backend
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
  - Client: `@supabase/supabase-js` 2.97.0
  - Location: `mafs-member-portal/src/lib/supabase.ts`

**Tables:**
- `applications` - Membership applications
  - Columns: id, first_name, last_name, email, phone, address, city, state, zip, status, approved_tier, submitted_at, reviewed_at
  - Operations: insert (new apps), select (list all), update (approve/deny)

**File Storage:**
- Supabase Storage
  - Bucket: `mafs-documents`
  - Purpose: Store membership application documents and supporting files
  - Upload function: `uploadDocument(file: File, folder: string)`
  - Path pattern: `{folder}/{timestamp}_{filename}`

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (Member Portal only)
  - Type: Email/password authentication
  - Implementation location: `mafs-member-portal/src/lib/supabase.ts`
  - Methods:
    - `signIn(email: string, password: string)` - User login
    - `signOut()` - User logout
    - `getSession()` - Retrieve current session

**Staff/Admin Access:**
- Custom auth handled by Supabase (application-level role separation)
- Member portal has dual modes: member gateway and employee/staff portal

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console logging (implicit via React dev tools)
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Not detected in codebase (mentions "AI Studio" in README but infrastructure not specified)

**CI Pipeline:**
- None detected
- Build commands available:
  - Member portal: `tsc && vite build`
  - Financial dashboard: `vite build`

## Environment Configuration

**Required env vars:**

*Member Portal (`mafs-member-portal`):*
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

*Financial Dashboard (`mafs-financial-dashboard`):*
- `GEMINI_API_KEY` - Google Gemini API key (loaded from `.env.local`)

**Secrets location:**
- `.env.local` - Local development (not committed)
- Environment variables in deployment platform (CI/CD or hosting provider)

**Note on secrets:**
- Member portal stores Supabase public key (anon key) - designed to be exposed in browser
- Financial dashboard API key should be stored securely and rotated regularly

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Data Flow Summary

**Member Portal Application Submission:**
1. User fills enrollment form (`EnrollmentForm.tsx`)
2. Calls `submitApplication()` → Supabase `applications` table insert
3. Optional document upload via `uploadDocument()` → Supabase Storage

**Member Portal Authentication:**
1. User logs in via `signIn()` → Supabase Auth
2. Session retrieved via `getSession()`
3. Staff can approve/deny applications via `updateApplicationStatus()`

**Financial Dashboard:**
1. Actuarial calculations performed client-side (SOA, CAS, Takaful models)
2. Financial projections generated using `generateProjections()`
3. Gemini API integration for AI-powered analysis (if configured)
4. Charts rendered via Recharts

## Integration Security Considerations

**Member Portal:**
- Supabase anon key is public by design but restricted via Row Level Security (RLS)
- Database functions should enforce RLS policies
- File uploads sanitized by Supabase Storage

**Financial Dashboard:**
- Gemini API key injected into frontend (potential exposure risk)
- Consider API key proxy or server-side integration if sensitive

**General:**
- No HTTPS enforcement checked in config
- Supabase requires HTTPS for auth to function properly
- No rate limiting detected

---

*Integration audit: 2026-03-17*
