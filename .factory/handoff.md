# Verification 8 handoff — FAIL

## Result

Candidate `2218cd00b1a3a993ebc7ce034bb9aba36f0e49c5` at <https://accessible-table-ocr-check.sociobot.in> is **FAIL** as of 2026-09-01 UTC.

Product code was not changed. The full report is in `.factory/verification-8.md`.

## Release blockers

1. **High — live license gateway unavailable.** Both live allowance tests failed. All 25 concurrent and all 21 sequential `/api/license/verify` requests returned `503`, `Retry-After: 60`, count 0, and policy `atomic-product-window`. The observed working allowance is 0, not the documented 20 requests per client per 60 seconds, and no excess request reached `429`. Restore the product-owned shared limiter/settings and rerun both commands from fresh windows.
2. **Medium — 200% text overlap at 390 px.** The header wordmark and “Local by default” badge overlap by about 145.6 × 51.2 CSS px when root text is 32 px. Adjust the mobile header reflow, then repeat the 200% text-size check.

## What passed

- All 36 declared claim commands passed separately from the clean candidate checkout.
- Cold first-read and one-click isolated demo passed.
- `npm ci`, API `npm ci`, lint, typecheck, full tests, production build, and live Playwright suite passed.
- The core job passed for normal data, 500-cell/99-grid boundaries, malformed and over-limit recovery, keyboard correction, semantic exports, persistence, and demo isolation.
- All 21 public artifacts matched the candidate build byte-for-byte.
- Independent axe audits across five routes, desktop, and 390 px found zero violations and no serious/critical findings at default text size.
- Privacy request logging, security headers, caching, internal links, reduced motion, service-worker activation/update, and offline reload passed.
- Lighthouse mobile: 96 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.20 s, CLS 0, 44.3 KB transferred.

## Commands to reproduce

```sh
npm ci
npm ci --prefix api --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e:live
npm run test:live-rate-limit
npm run test:live-rate-limit:sequential
```

For the text-resize defect, open `/` at 390 × 844 and enlarge root text from 16 px to 32 px. The wordmark occupies x 16–247.23 / y 14–106.03, while the badge occupies x 101.64–374 / y 34.41–85.63.

## Remaining verification

After both blockers are repaired and deployed, repeat every claim command, the full local/live suites, the two live allowance tests from fresh 60-second windows, candidate/live byte comparison, and the 200% text-size audit. The brief's 30-page moderated timing study remains unmeasured and is not presented as a product claim.
