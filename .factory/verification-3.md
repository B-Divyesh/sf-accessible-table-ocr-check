# Independent product verification — FAIL

- Work order: `accessible-table-ocr-check-verify-3`
- Candidate: `4cafb49a1835266a15b5c561c1d0bb6cfa5239fb`
- URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 2026-08-30 UTC
- Environment: Node 22, npm, Chromium/Playwright 1.58.2
- Decision: **FAIL — live rate limiting does not satisfy the required 20-request allowance.**

## First read and deployment identity

Cold-load text says: “Fix a scanned table’s reading order.” It says it is for “librarians and accessibility reviewers” comparing OCR with scans before sharing tables with screen-reader users. The first action is **Try it with sample data**, with “Opens a scanned transit table with two reading-order errors.” immediately beside it. This meets the plain-words and one-click sample requirements.

The exact candidate was checked out cleanly. A fresh production build produced `dist/index.html` with SHA-256:

```text
f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231
```

The live root response was byte-identical to that file. Therefore the tested deployment matches the candidate.

## Claims and local gates

`.factory/claims.json` exists and declares 34 claims. Before other QA, all 34 declared `test` commands were run individually after clean `npm ci`, through the supplied demo entry point. All passed, including demo isolation, offline reload, exports, importer formats/limits/recovery, privacy, licensing fixture behavior, issue detection, and the unit-level rate-limit claim.

The complete local gates also passed:

```sh
npm test                 # 13 Vitest + 54 Playwright tests
npm run lint
npm run typecheck
npm run build
```

The exact build produced `dist/`. Vite reported pre-inline assets of 36.52 KB JavaScript (12.97 KB gzip) and 19.46 KB CSS (4.98 KB gzip), within the static-product budgets.

## Live end-to-end, accessibility, privacy, and PWA evidence

- Normal flow: direct `/demo` loaded the 9-cell transit sample and two seeded structure errors. An offline edit persisted through reload and semantic HTML exported successfully with scoped headers.
- Boundary/recovery: entering row `100` reset the field to its prior value and announced: “Row 100 is outside the supported 1–99 range… The previous position was kept.”
- Desktop (1440px), mobile (390px), and populated demo had no horizontal overflow, console errors, or page errors. Axe-core found zero serious or critical violations on each.
- Keyboard: Tab reaches the skip link, all navigation/actions, fields, and sample controls. The computed focus indicator is a `3px` solid ring. Enter opened the sample; Space activated **Reset demo**, restoring all 9 sample cells.
- `prefers-reduced-motion: reduce` reduces transitions to `0.00001s`; no active animation remained.
- In fresh contexts, landing requested only same-origin document/art; direct demo requested only same-origin document/sample image. No trackers, CDN fonts, or third-party runtime requests were observed.
- Service-worker control was active at `/demo`; `registration.update()` completed with active `/sw.js`. After priming, offline reload displayed the offline banner, retained the edited demo, and exported HTML without errors. `sw.js` uses `Cache-Control: no-cache, no-store, must-revalidate`; immutable assets use `public, max-age=31536000, immutable`.
- Root headers include CSP with header-only `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict referrer policy, and restrictive permissions policy. `/`, `/demo`, `/privacy/`, `/terms/`, manifest, service worker, robots, sitemap, and assets were 200; a nonexistent route was a real 404.

## Release-blocking defect

**High — live server-side request allowance is not enforced.**

The app documents: “A 20-request client burst then receives `429` and `Retry-After` responses.” The acceptance contract independently requires the same behavior for every server-side endpoint.

I made 21 sequential requests from one client to:

```text
GET https://accessible-table-ocr-check.sociobot.in/api/license/verify?license=qa-invalid-token
```

Observed:

- Requests 1–20: `200`, JSON `{ "valid": false, "reason": "invalid", "expires_at": null }`, `X-RateLimit-Limit: 20`.
- Request 21: **also `200`**, with no `Retry-After` header.

Thus the documented/requested limit did not produce any `429` for a client that exceeded 20 requests. Candidate source confirms the implementation stores counters in a process-local `Map`; it is not a shared limit across deployed function instances. The local unit claim proves only one process and cannot establish the live guarantee.

## Required repair and retest

Implement a deployment-wide client limit (for example platform/edge rate limiting or shared durable state) that returns `429` and a positive `Retry-After` beginning at request 21 from a single client. Redeploy, then repeat this exact 21-request live check. Until that evidence passes, this candidate remains **FAIL**.
