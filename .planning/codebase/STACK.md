# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- TypeScript 5.7-5.8 - Frontend applications (React components, type-safe business logic)
- JSX/TSX - React UI components

**Secondary:**
- HTML5 - Static markup with Tailwind CDN
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (unspecified version, inferred from npm scripts and modern package.json type: "module")

**Package Manager:**
- npm - Dependency management

## Frameworks

**Core:**
- React 19.x - UI framework
  - `react` 19.0.0 - `mafs-member-portal/package.json`
  - `react` 19.2.4 - `mafs-financial-dashboard/package.json`
- React DOM 19.x - DOM rendering
  - `react-dom` 19.0.0 - `mafs-member-portal/package.json`
  - `react-dom` 19.2.4 - `mafs-financial-dashboard/package.json`

**Build/Dev:**
- Vite 6.x - Frontend bundler and dev server
  - `vite` 6.0.0 - `mafs-member-portal/package.json`
  - `vite` 6.2.0 - `mafs-financial-dashboard/package.json`
- @vitejs/plugin-react 4.3.4-5.0.0 - React Fast Refresh for Vite

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.97.0 - Backend database and authentication (member portal only)
  - Location: `mafs-member-portal/package.json`
  - Provides: Database queries, authentication, file storage

**UI & Charting:**
- lucide-react 0.474.0-0.574.0 - Icon library
  - Used throughout components for UI icons
- recharts 3.7.0 - Data visualization and charts
  - Used in financial dashboard for projections and analysis charts

**Dev Dependencies:**
- TypeScript 5.7.2-5.8.2 - Type checking
- @types/react 19.0.0 - React type definitions
- @types/react-dom 19.0.0 - React DOM type definitions
- @types/node 22.14.0 - Node.js type definitions (financial dashboard)

## Configuration

**Environment:**
- Vite environment variables loaded via `import.meta.env.VITE_*` pattern
- `.env.local` file for local development (not committed)

**Key env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL (member portal)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (member portal)
- `GEMINI_API_KEY` - Google Gemini API key (financial dashboard)

**Build:**
- `vite.config.ts` - Vite configuration
  - Location: `mafs-financial-dashboard/vite.config.ts`
  - Defines: server port (3000), React plugin, API key injection, path aliases
- `tsconfig.json` - TypeScript configuration
  - Location: `mafs-member-portal/tsconfig.json` (ESNext target, strict mode)
  - Location: `mafs-financial-dashboard/tsconfig.json` (ES2022 target, decorators enabled)

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript support (built into toolchain)
- Modern browser with ES2022+ support (Vite + React 19)

**Production:**
- Static hosting (SPA deployment)
- Browser with ES2022+ JavaScript support
- HTTPS required for Supabase authentication
- Network access to Supabase API (member portal)
- Network access to Google Gemini API (financial dashboard)

## Styling

**Framework:**
- Tailwind CSS 3.x - Utility-first CSS framework
  - Loaded via CDN: `https://cdn.tailwindcss.com`
  - Custom theme configuration in HTML head (Morocco colors: red #C1272D, green #006233)

**Fonts:**
- Google Fonts - Inter font family (weights: 300, 400, 500, 600, 700)

## Project Structure

**Two independent SPA projects:**

1. **mafs-member-portal** - Member application and enrollment
   - Entry: `src/index.tsx`
   - Main App: `src/App.tsx`
   - Build: `tsc && vite build`

2. **mafs-financial-dashboard** - Financial management and projections
   - Entry: `index.tsx` (root)
   - Main App: `App.tsx` (root)
   - Build: `vite build`

---

*Stack analysis: 2026-03-17*
