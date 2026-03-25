---
phase: 1
slug: unified-app-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + Vite build |
| **Config file** | `mafs-portal/tsconfig.json` |
| **Quick run command** | `cd mafs-portal && npx tsc --noEmit --cache /tmp/npm-cache-mafs` |
| **Full suite command** | `cd mafs-portal && npm run build --cache /tmp/npm-cache-mafs` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd mafs-portal && npx tsc --noEmit`
- **After every plan wave:** Run `cd mafs-portal && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| scaffold | 01 | 1 | mafs-portal/ exists with vite.config.ts | file-exists | `test -f mafs-portal/vite.config.ts && echo PASS` | ○ |
| engine-merge | 01 | 1 | calculateClaimPayout exported | grep | `grep -n "calculateClaimPayout" mafs-portal/src/services/engine.ts` | ○ |
| engine-merge | 01 | 1 | runMonteCarlo exported | grep | `grep -n "runMonteCarlo" mafs-portal/src/services/engine.ts` | ○ |
| engine-merge | 01 | 1 | investmentIncome in YearProjection type | grep | `grep -n "investmentIncome" mafs-portal/src/types.ts` | ○ |
| components | 02 | 2 | All portal components present | file-exists | `ls mafs-portal/src/components/*.tsx \| wc -l` | ○ |
| dashboard | 02 | 2 | Dashboard components present | file-exists | `ls mafs-portal/src/components/dashboard/*.tsx \| wc -l` | ○ |
| routing | 03 | 3 | EmployeePortal renders dashboard tab | grep | `grep -n "dashboard" mafs-portal/src/components/EmployeePortal.tsx` | ○ |
| build | 03 | 3 | npm run build passes | build | `cd mafs-portal && npm run build 2>&1 \| tail -5` | ○ |

---

## Critical Checks

```bash
# Engine completeness
grep -E "export (function|const) (calculatePremium|calculateClaimPayout|runMonteCarlo|generateProjections)" mafs-portal/src/services/engine.ts

# Type completeness
grep "investmentIncome" mafs-portal/src/types.ts
grep "claimAmount" mafs-portal/src/types.ts

# Build gate
cd mafs-portal && npm run build 2>&1 | grep -E "(error|warning|built in)"

# Dev server check
curl -s http://localhost:5173 | grep -i "mafs\|react\|<!DOCTYPE" | head -3
```
