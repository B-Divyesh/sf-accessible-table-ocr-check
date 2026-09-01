# Independent product verification 5 — FAIL

- Work order: `accessible-table-ocr-check-verify-5`
- Candidate and clean-checkout HEAD: `d683aaa568a3c4181a12b68d10d04cb62bb9b8df`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Date: 2026-09-01 UTC
- Environment: Node 22.23.2, npm 10.9.8, Chromium / Playwright 1.58.2
- Result: **FAIL — desktop header controls do not meet the required 44×44 CSS-pixel target size.**

No product source code was changed during this verification.

## First-read gate — PASS

The cold live first screen gives the required information in plain words:

- Job: “Fix a scanned table’s reading order.”
- Audience: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- First action: **Try it with sample data**, with the result stated directly: it opens a scanned transit table with two reading-order errors.

The action opens `/demo` in one click. The populated demo showed nine editable cells, nine source overlays, two seeded issues, and the persistent “Demo — sample data, nothing is saved” banner.

## Candidate / live identity — PASS

`npm ci` was run from the clean checkout, followed by the exact production build. The candidate and live root were byte-identical:

```text
SHA-256  390c1a26b0307bbddd9088fd052673adb3da223c497b5abab35337e52b3c821a
Size     58,079 bytes
```

The comparison also matched 15 shipped artifacts: the three direct app routes, 404 page, service worker, manifest, offline page, robots, sitemap, hero/social assets, and compiled JS/CSS. `staticwebapp.config.json` is intentionally not publicly served; its deployed header policy was checked from actual responses.

## Claims contract — PASS

`.factory/claims.json` is present with 34 records. Every listed command was invoked from the clean checkout through the demo entry point; all completed without a product assertion failure. The aggregate confirmation also passed:

```text
npm run test:claims   PASS — 2 tagged unit/API tests; 16 tagged browser scenarios
```

This covers all listed claim IDs, including direct-demo readiness, isolated demo storage, queued-autosave exit isolation, semantic exports, request privacy, offline reload, import normalization and limits, free exports, local saved versions, and the rate-limit boundary.

## Local quality gates — PASS

```text
npm ci             PASS — 0 audit vulnerabilities
npm test           PASS — 15 unit/API tests; 52 browser tests; 6 declared skips
npm run lint       PASS
npm run typecheck  PASS
npm run build      PASS — dist/ produced
```

The production JS asset is 36,597 bytes and CSS is 19,536 bytes before HTML inlining, within the 200 KB JS and 50 KB CSS budgets. The mobile hero is 22,664 bytes. `dist/` contains no runtime font files.

## Independent live checks — PASS except target sizing

- `npm run test:e2e:live`: **51 passed, 7 declared skips** across desktop and 390×844 mobile.
- The full local Playwright suite exercised normal editing, exports, image/JSON order, invalid JSON recovery, 500-cell and 99×99 bounds, preserved data after invalid replacement, keyboard correction, legal routes, history focus, offline reload, and 404.
- Cold desktop and 390px Playwright checks found no console errors, no off-origin runtime requests, and no axe serious or critical findings on landing or demo.
- The first Tab focuses the skip link. Reduced-motion mode was tested by the suite. At 390px there is no horizontal overflow and every visible interactive target measured at least 44×44 CSS px.
- A fresh black-box demo-isolation test seeded real IndexedDB, edited and reset the demo, exited, waited beyond the autosave delay, and compared records. Real data was unchanged and `demo:table-proofing-desk` was absent. The candidate’s explicit queued-autosave regression also passed in both projects.
- The service worker controls the live site, has cache `proof-desk-v3`, and `registration.update()` completed with no waiting/installing worker error. A primed `/demo` reloaded offline, displayed the offline notice, and remained usable.

## Privacy, response policy, and server allowance — PASS

The independent Playwright request log during cold load and demo flow contained no off-origin runtime request. A unique private marker was not present in any request body. The unlicensed flow used no localStorage keys or script-visible cookies; working data was in IndexedDB.

Live root headers included CSP restricted to self with header-delivered `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict referrer policy, and a restrictive permissions policy. HTML is `no-cache, must-revalidate`; `sw.js` is `no-cache, no-store, must-revalidate`; compiled assets are immutable for one year; the manifest is JSON with must-revalidate caching.

`npm run test:live-rate-limit` observed the documented signed client window: requests 1–20 returned `200`; request 21 returned `429`, `Retry-After: 58`, and `X-RateLimit-Policy: signed-client-window`. The observed allowance is **20 requests per 60-second window**.

## Defects by severity

### High — desktop header controls are below 44×44 CSS px

At a 1440×900 live desktop viewport, the actionable header elements measured:

| Control | Measured size |
| --- | --- |
| Table proofing desk (home link) | 192×38 px |
| Demo | 40×22 px |
| How it works | 89×22 px |
| Privacy | 51×22 px |
| Desk license | 87×22 px |

The accessibility and design acceptance contract requires touch/click targets of at least 44×44 CSS px. The CSS applies the 44px minimum to `.site-header a` only at `max-width: 620px`, so the 390px test passes while the desktop viewport does not. This is a release-blocking acceptance failure. Give all header action links a 44px minimum target in every viewport and add a desktop visible-control regression covering the same routes as the mobile test.

### Other defects

None found in this verification.

## Scope note

The brief’s 30-page, under-five-minute human study remains unmeasured. It is not represented as a tested product claim.
