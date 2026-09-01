# Verification 7 — PASS

- Candidate commit: `9956b5cddc52700c2a0c10df94b78f720c540953`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2026-09-01 UTC

## Release decision

**PASS.** The live deployment matches the tested candidate and meets the researched brief's local PWA table-review job: it accepts supplied page images and OCR JSON, shows source overlays and reading-order findings, permits corrections, and exports semantic HTML, CSV, project JSON, and an issue report.

No release-blocking, high, medium, or low product defects were identified.

## First-read result

Cold opening the live page answers the first-screen questions in plain words:

- **What it does:** “Fix a scanned table’s reading order.”
- **Who it is for:** librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- **What to click first:** the visible **Try it with sample data** action, with the adjacent explanation that it opens a scanned transit table containing two reading-order errors.

The action opens `/demo` in one step with nine seeded cells, source overlays, two findings, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real controls.

## Clean candidate checks

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts         PASS — 7 packages; 0 vulnerabilities
34 commands in .factory/claims.json          PASS — every declared command, run serially
npm run lint                                 PASS
npm run typecheck                            PASS
npm test                                     PASS — 16 unit/API and 60 browser checks
npm run build                                PASS — dist/ produced
npm run test:e2e:live                        PASS — 60 live browser checks
```

The claim run covered the direct isolated demo, local browser storage, same-origin request recording, document-marker request checks, offline reload, image/OCR formats and normalization, boundaries and recovery, keyboard corrections, four exports, scoped HTML headers, licensed saved versions, and the documented rate allowance.

## Independent live checks

- Candidate/deployment identity: 21 public deployment artifacts matched `dist/` byte-for-byte. `staticwebapp.config.json` correctly returns 404 because it is deployment configuration, not a public asset. Evidence: `evidence/verification-7/identity.json`.
- Accessibility and responsive checks: fresh axe checks on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 route at 1440×900 and 390×844 found zero violations, including zero serious/critical findings. Every route had one `h1`, one `main`, no horizontal overflow, and no console/page errors on normal routes. The expected failed-document console line occurred only for the intentional 404. Evidence: `evidence/verification-7/live-browser-a11y.json`.
- Keyboard, visible focus, touch-target sizing, reduced motion, invalid input/recovery, exports, demo isolation, persistence, and offline reload passed in the full local and live Playwright suites.
- Privacy: the independent live request log contained only `https://accessible-table-ocr-check.sociobot.in`; the clean claim run also passed its complete-flow request/body and storage assertions. No third-party runtime requests were observed.
- Headers and caching: HTML uses `no-cache, must-revalidate`; `sw.js` uses `no-cache, no-store, must-revalidate`; manifest uses must-revalidate caching; hashed JS is immutable for one year. Responses include HSTS, `nosniff`, strict referrer policy, a self-only CSP with header-delivered `frame-ancestors 'none'`, permissions policy, and `X-Frame-Options: DENY`. Evidence: `evidence/verification-7/live-headers.txt`.
- Bundle budget: the built JavaScript is 36,597 bytes (13.01 KB gzip), CSS 19,578 bytes (4.98 KB gzip), and mobile hero 22,664 bytes; all are within the stated static/PWA budgets.
- Lighthouse mobile output recorded Performance 100, Accessibility 100, Best Practices 100, and SEO 100; FCP/LCP were 1,486.584 ms, CLS 0, total transfer 44,094 bytes. Evidence: `evidence/verification-7/lighthouse-live.json`. The Lighthouse process reported a browser-tab close after writing the result; this did not affect the completed report or the passing Playwright runs.

## Request allowance

The documented allowance is **20 requests per 60 seconds per client**.

- Fresh simultaneous live run: counts 1–20 returned 200; counts 21–25 returned 429 with positive `Retry-After` (59 seconds), across four function instances.
- Fresh sequential live run: requests 1–20 returned 200; request 21 returned 429 with `Retry-After: 58`. Evidence: `evidence/verification-7/live-rate-sequential.txt`.

Both runs returned the `atomic-product-window` policy header.

## Functional coverage and limitations

Representative normal data, format variants, malformed JSON, over-limit grids/cell counts, legacy coordinates, image-first and JSON-first imports, order corrections, header roles, reset/exit, and export round-trips all passed through the test suite. The product correctly states that it checks supplied OCR rather than creating OCR or guaranteeing an accessible result.

The brief's moderated 30-page, under-five-minute human study remains unmeasured and is not advertised as a measured product claim.
