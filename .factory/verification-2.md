# Independent product verification — PASS

- Work order: `accessible-table-ocr-check-verify-2`
- Candidate commit: `753739c4fe8fb8b6ff3a9a6e6da27118c4ef24bb`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Verified: 2026-08-28 UTC
- Environment: Node 22.23.2, npm 10.9.8, Chromium/Playwright 1.58.2
- Decision: **PASS — the deployed static product matches the candidate and satisfies the tested acceptance contract.**

## Candidate and deployment identity

Verification used a fresh detached clone at the requested commit. `npm ci` installed 142 packages with no audit findings, and the checkout remained clean.

A fresh production build produced `dist/index.html` at 50,520 bytes with SHA-256:

```
359fef1eaa680837b63927c9e7e76850c6984097770e735817eff060236f5488
```

The live `/` response was the same 50,520-byte file with the identical SHA-256. Its asset references match the build (including the locally hosted desktop and mobile proofing artwork). The live same-origin license endpoint was also exercised, so this is fresh deployment evidence rather than a documentation-only conclusion.

## Local release gates

All commands were run from the clean checkout:

```sh
npm ci
npm audit --audit-level=low
npm run lint
npm run typecheck
npm test
npm run build
```

All passed.

- ESLint and TypeScript: pass.
- Vitest: 12/12 pass.
- Playwright: 20 project runs pass (the suite contains deliberate project-only skips; `.last-run.json` records `passed`).
- Production output: `dist/` exists. Main JS is 32,042 bytes (11,683 gzip); CSS is 17,766 bytes (4,683 gzip); the initial JS/CSS budgets are comfortably below 200 KB/50 KB. No runtime font assets are shipped.

## End-to-end product evidence

On the live deployment, using keyboard as well as pointer input:

- Opened the deliberately scrambled sample, observed two structural errors, moved **Yes** later, and reached **No structural errors detected**.
- Exported HTML, CSV, and issue report. The HTML has `lang="en"`, a main landmark, three column-header scopes and two row-header scopes; CSV contained the expected ordered rows; the corrected report states that no automated structure issues remain.
- Imported an OCR document with row `100`; it was rejected before IndexedDB persistence with the clear 1–99 range message. A valid OCR import then opened the workbench. A 500-block document imported and rendered all 500 editable cells; a 501-block document was rejected and left the current proof unchanged. The repository test suite also covers legacy persisted-coordinate recovery and editor rollback.
- Invalid JSON gave an actionable message and valid input recovered normally. The clean build’s browser tests cover image-only/OCR-only starts, deletion confirmation, text escaping, and saved-project reloads.
- At an exact 390 × 844 viewport there was no horizontal overflow. The mobile 640px artwork source was selected, rendered at 434 × 288 (1.507 ratio), and all audited legal/merchant links measured at least 44px in each dimension.
- Keyboard-only smoke: Space activated the sample and correction actions; the skip link is first, visibly focusable, and moves to `#main`. Under reduced motion the root uses `scroll-behavior: auto` and control transitions are effectively instant.

## Accessibility, privacy, and browser health

- Live desktop and mobile axe-core 4.10.2 scans found **zero serious or critical violations** on landing and populated-workbench states. The experimental `label-content-name-mismatch` rule also passed.
- The live pages have one `<h1>`, `lang="en"`, title, and `<main>`; no console errors or page errors were observed in landing, correction, export, invalid-import, legal, offline, and service-worker-update flows.
- Initial live load and the complete source/OCR import, correction, persistence, and export flow made no off-origin requests. There are no CDN fonts, analytics, trackers, or third-party runtime scripts. The optional returned-license flow strips `license` from the URL and stores it at `sb_license:accessible-table-ocr-check`; its only runtime request is to the same-origin `/api/license/verify` gateway. No sign-in is required, so no identity provider is involved.
- `/privacy/` and `/terms/` returned direct `200 text/html` pages with their own title and main content.

## PWA, response policy, and performance

- The live manifest is valid JSON and declares standalone display, versioned start URL, 192/512 icons, and a maskable icon. The page is service-worker controlled.
- After loading and saving a sample while online, an offline hard reload restored the workbench and showed its offline banner, with no errors.
- A separate local server served the exact production `dist/` build, then supplied a byte-changed service worker after `registration.update()`. The app displayed **A newer proofing desk is ready** with its Update now control and no errors.
- Live headers: HTML `no-cache, must-revalidate`; `sw.js` `no-cache, no-store, must-revalidate`; versioned assets `public, max-age=31536000, immutable`; manifest `application/json`. CSP restricts the app to self with hashed script/style content, `frame-ancestors 'none'`; HSTS, nosniff, strict referrer policy, permissions policy, and `X-Frame-Options: DENY` are present.
- Lighthouse 12.8.2 mobile on the live URL: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0s, LCP 1.2s, TBT 210ms, CLS 0, Speed Index 1.0s, and 41 KiB total transfer in this audit. Lab INP and the brief's 30-page human-time study were not measurable in this automated verification.

## Server endpoint rate limiting

The same-origin license-verification endpoint was burst-tested with 40 rapid sequential requests over one HTTP client connection:

- Requests 1–20: `200`.
- Request **21**: first `429`, `Retry-After: 58`.
- In requests 21–40, 10 returned `429` with positive `Retry-After` values (56–58 seconds); the other responses were `200` as requests were distributed across warm function workers.

This meets the required observable behavior: the burst begins returning `429` at threshold 21 and includes `Retry-After`. The endpoint also returns `Cache-Control: no-store` and `X-RateLimit-Limit: 20`.

## Defects and limits

- Critical/high/medium: **none found**.
- Low operational hardening gap: the 20-per-minute window is process-local in the Azure Function, so scale-out can interleave successful requests with rate-limited ones rather than enforce a globally shared quota. It met the required burst check; a shared edge/distributed limit would be stronger under coordinated abuse.
- Verification limit, not a release defect: the brief's success measure requires a moderated study of 30 real scanned pages completed in under five minutes each. Automated fixtures cannot establish that human outcome.

## Reproduction

```sh
npm ci
npm audit --audit-level=low
npm run lint
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

For the rate-limit check, issue 40 rapid `GET` requests to:

```text
https://accessible-table-ocr-check.sociobot.in/api/license/verify?license=qa-invalid-token
```

and record statuses and `Retry-After`; this verification first received `429` on request 21.
