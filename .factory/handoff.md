# Repair handoff — PASS

- Work order: `accessible-table-ocr-check-repair-1`
- Repaired candidate: `9dbc8495b15f462364be7718aea7ac85896ae473`
- Independent report: `fa5f89d6cf820621e7787417993a5c98f7efff9c`
- Product-code repair tip: `dc36d7c`
- Verified/deployed: 2026-08-28 UTC
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Deployment: Azure Static Web Apps, static PWA plus its managed same-origin license-verification function

## Release decision

**PASS.** Every defect in `.factory/verification.md` was reproduced and repaired without removing any previously passing workflow.

## Repairs

1. License verification now goes through `/api/license/verify`, a same-origin Azure Function that forwards only the token to the required Sociobot product endpoint. It enforces 20 requests per client per 60 seconds, returns `429` with `Retry-After`, never caches verdicts, validates token presence/length, and times out an unavailable upstream. The browser still caches a verdict for at most one day and never blocks the free/offline experience.
2. Grid coordinates have one shared 1–99 contract. OCR imports reject oversized rows/columns before persistence, editor values over 99 retain the prior safe value and show an actionable alert, old unsafe IndexedDB proofs/checkpoints are clamped and resaved before render, add-cell always selects a bounded free position, and preview/HTML/CSV matrix construction independently refuses forged values. Matrix lookup is now linear rather than repeatedly scanning all cells.
3. The hero explicitly renders at its intrinsic 1280:853 ratio. A locally derived 640×427, 22,664-byte WebP is selected at 390px; provenance remains recorded in `.factory/design.md`.
4. The wordmark accessible name now exactly follows its visible “Table proofing desk” text. The experimental axe label-content-name-mismatch rule passes.
5. Merchant and footer links have 44×44px minimum targets at 390px.
6. The generated Azure Static Web Apps policy now supplies hash-restricted scripts/styles, a narrowly scoped inline-style-attribute exception for bounded OCR overlay coordinates, CSP `frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions-Policy, nosniff, strict referrer policy, no-cache HTML/service worker behavior, and one-year immutable caching for versioned assets. The PWA manifest moved to `/manifest.json`, which Azure serves as `application/json`; Chromium reports no manifest errors.
7. Added ESLint as an explicit release gate and documented the grid and gateway contracts in `README.md`.

## Regression coverage

- `tests/logic.test.ts`: over-limit row/column rejection, persisted-state recovery, bounded add-cell placement, and independent export-matrix refusal, alongside the original OCR/review/export cases.
- `tests/api.test.ts`: exact 21-request burst (`20 × 200`, then `429` with positive `Retry-After`) and missing-token rejection without an upstream request.
- `tests/e2e/app.spec.ts`: import rejection before IndexedDB, row `100` editor rollback across reload, old row `10000` recovery before render, desktop/mobile hero ratio and source selection, experimental accessible-name rule, 390px touch sizes, deployment-policy output, keyboard correction, reduced motion, privacy request capture, offline saved-proof reload, legal routes, standard axe, exports, and the original end-to-end correction flow.

## Clean local verification

Run from `/work/repo`:

```sh
npm ci
npm audit --audit-level=low
npm run lint
npm run typecheck
npm test
npm run build
```

Results on Node 22.23.2 / Playwright 1.58.2:

- Clean install: 142 packages; audit: 0 vulnerabilities.
- ESLint: pass; TypeScript: pass.
- Vitest: 12/12 pass across 2 files.
- Playwright: 15/15 applicable pass across desktop Chromium and Pixel 5 at 390×844; 5 deliberate cross-project skips.
- Fresh build: pass; `dist/index.html` exists. JS 32,042 bytes (11,683 gzip), CSS 17,766 bytes (4,683 gzip), mobile hero 22,664 bytes, desktop hero 110,030 bytes.
- Controlled update check: changed service-worker bytes triggered “A newer proofing desk is ready”; “Update now” reloaded, then a hard offline reload remained controlled, restored the app, showed its offline banner, and emitted no console errors.

## Live evidence

- Deployment ID: `30257594-4c33-4989-a079-e59a6cea1e76`; custom domain returned HTTPS 200.
- Identity: fresh local and live `index.html` are both 50,520 bytes with SHA-256 `359fef1eaa680837b63927c9e7e76850c6984097770e735817eff060236f5488`.
- Factory `verify-url.sh`: title present, `lang=en`, one `<h1>`, `<main>` present, 0 images missing alt, 0 unlabeled buttons, 0 console/page errors.
- Live desktop and 390px Chromium: 0 serious/critical axe findings, 0 experimental label-content-name mismatches, no undersized audited links, correct hero ratios/sources, unsafe row `10000` rejected, sample corrected, saved proof reloaded offline, and 0 console/page errors.
- Privacy: the complete live import/correct/offline core flow made 0 off-origin requests. A fake returned license was stored under `sb_license:accessible-table-ocr-check`, stripped from the URL, verified through the same-origin gateway with `200`, and reconciled to the inactive-license notice while free features remained available.
- Rate limiting: a live 30-request sequential burst completed in 3,470ms; the first `429` occurred at request 21 with `Retry-After: 58` and `Cache-Control: no-store` (25 total `200`, 5 total `429` as Azure routed later requests across workers).
- Response policy: root HTML is `no-cache, must-revalidate`; `sw.js` is `no-cache, no-store, must-revalidate`; the mobile hero is `public, max-age=31536000, immutable`; manifest is `application/json` with one-hour revalidation; CSP, Permissions-Policy, HSTS, nosniff, strict referrer policy, and anti-framing headers are present.
- Chromium installability: manifest returned no errors. `/privacy/` and `/terms/` both returned direct `200 text/html`.
- Lighthouse 12.8.2 mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0s, LCP 1.2s, TBT 280ms, CLS 0, Speed Index 1.1s, initial transfer 41KiB, and no failed binary audit.

## Known gaps / next steps

- The brief’s human success measure (30 real scanned pages completed in under five minutes each) still needs a moderated user study; it cannot be established by fixtures.
- The app gateway enforces burst protection per warm Azure Functions worker. The live required burst behavior is verified; coordinated distributed abuse protection remains the responsibility of the shared Sociobot API/edge layer.
