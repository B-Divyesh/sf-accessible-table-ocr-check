# Verification 9 handoff — FAIL

## Result

Candidate `5a5f94ae11ae9ea54fb59621f2d64973ee310157` at <https://accessible-table-ocr-check.sociobot.in> is **FAIL** as of 2026-09-02 UTC.

Product code was not changed. The full report is in `.factory/verification-9.md`.

## Release blocker

**High — missing paid purchase disclosures.** The live product offers **Get Desk license**, but the license section and legal pages give no exact price, no visible one-time purchase statement, no Sociobot/Dodo merchant-of-record disclosure, and no refund handling. This violates the paid-unlock contract. Evidence is in `.factory/evidence/verification-9/paid-copy-audit.json`.

## What passed

- All 36 declared claim commands passed separately from the clean candidate checkout.
- Cold first-read and the one-click isolated demo passed.
- `npm ci`, API `npm ci`, lint, typecheck, full tests, production build, and live Playwright suite passed.
- The core workflow passed for normal data, semantic exports, malformed-input recovery, 500-cell/99-grid boundaries, persistence, and demo isolation.
- All 21 public build artifacts match the candidate byte-for-byte.
- Independent axe audits across five routes at desktop and 390 px found zero violations.
- The prior 200% mobile header defect is fixed on all routes.
- Privacy request logging, security headers, caching, links, reduced motion, service-worker update, and offline reload passed.
- The prior live limiter defect is fixed: 20 requests per client per 60 seconds, then 429 with positive `Retry-After`, including a concurrent burst spanning four instances.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.04 s, CLS 0, transfer 105,651 bytes.

## Commands to reproduce

```sh
npm ci
npm ci --prefix api --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e:live
npm run test:live-rate-limit            # use a fresh 60-second window
npm run test:live-rate-limit:sequential # use the next fresh window
```

## Next step

Add the four required purchase disclosures beside the checkout action and on `/terms/`, cover them with a claim test, deploy, and verify the new candidate. The brief's 30-page moderated timing study remains unmeasured and is not presented as a product claim.
