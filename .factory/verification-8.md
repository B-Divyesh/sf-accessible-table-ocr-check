# Verification 8 — FAIL

- Candidate commit: `2218cd00b1a3a993ebc7ce034bb9aba36f0e49c5`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2026-09-01 UTC

## Release decision

**FAIL.** The core local table-checking workflow is complete and the live static deployment matches the candidate, but the optional paid-license gateway is unavailable in production and the 390 px layout loses readable header content when text is enlarged to 200%. Both conflict with the acceptance contract.

## Findings

### F-8-1 — High — production license verification and its required rate limit are unavailable

The live `/api/license/verify` endpoint does not accept any request. It fails closed before license verification because its shared rate-limit store is unavailable.

- `npm run test:live-rate-limit`: **FAIL**. All 25 simultaneous requests returned `503`; all reported `X-RateLimit-Count: 0`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Limit: 20`, `X-RateLimit-Policy: atomic-product-window`, and `Retry-After: 60`.
- `npm run test:live-rate-limit:sequential`: **FAIL**. All 21 sequential requests returned the same `503` response.
- A separate probe returned `503`, `Cache-Control: no-store`, and body `{"valid":false,"reason":"unavailable","expires_at":null}`.
- Observed working allowance: **0 requests**. The documented allowance of 20 requests per client per 60 seconds was not reached, and no excess request returned the required `429`.

Impact: new, restored, and daily-rechecked Desk licenses cannot be verified. This also makes the README claim that requests 1–20 pass and later requests receive `429` false for the live deployment.

Required follow-up: restore the product-owned shared rate-limit resource/settings for `sf-accessible-table-ocr-check-*`, then rerun both live rate-limit commands from fresh windows. No infrastructure was changed during verification.

### F-8-2 — Medium — header content overlaps at 200% text size on 390 px

With the live page at 390 × 844 and root text enlarged from 16 px to 32 px, the wordmark and “Local by default” badge overlap and obscure one another.

- Wordmark box: x 16–247.23, y 14–106.03.
- Badge box: x 101.64–374, y 34.41–85.63.
- The boxes overlap by about 145.6 × 51.2 CSS px.

Keyboard controls remain present, but the header content is no longer readable without overlap. This violates the supplied accessibility baseline that text resize to 200% must not lose content. Default-size desktop and 390 px layouts do not have this overlap.

## Mandatory opening gates

### Claims

`.factory/claims.json` exists and contains 36 entries. Every listed `test` command was run separately from the clean candidate checkout. **36/36 passed; 0 failed.** This included demo isolation, privacy request logging, offline reload, all imports and exports, bounds, recovery, license cadence/revocation fixtures, direct route documents, and unit-level limiter behavior.

The live failure in F-8-1 is deployment behavior not exercised by the stubbed unit claim.

### Cold first read

**PASS.** A fresh live browser visit answers all three questions on the first screen:

- What it does: “Fix a scanned table’s reading order.”
- Who it is for: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- What to click first: “Try it with sample data,” followed by “Opens a scanned transit table with two reading-order errors.”

That one click opens `/demo` with nine cells, source overlays, two seeded errors, Reset demo, Start for real, and the persistent isolated-demo banner.

## Clean candidate checks

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts        PASS — 7 packages; 0 vulnerabilities
36 commands in .factory/claims.json         PASS — every entry run separately
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 15 unit/API; 59 browser; 7 expected skips
npm run build                               PASS — dist/ produced
npm run test:e2e:live                       PASS — 58 live browser checks; 8 expected skips
/opt/fleet/lib/verify-url.sh                PASS — 200, title/lang/main/alt, no errors
npm run test:live-rate-limit                FAIL — 25/25 returned 503
npm run test:live-rate-limit:sequential     FAIL — 21/21 returned 503
```

## End-to-end and recovery evidence

- Normal case: the nine-cell transit sample opened with two deliberate order errors. Keyboard activation of “Move Yes later” cleared the structural errors, and HTML, CSV, project JSON, and issue-report exports worked.
- Semantics: exported HTML contains column and row `th` elements with `scope`, a caption, and the source-page reference. Project JSON round-trips into the importer.
- Bounds: 500 cells and row/column 99 pass. Cell 501 and coordinate 100 are rejected before replacing the saved record. Legacy unsafe coordinates are repaired with a visible notice.
- Invalid/recovery: malformed JSON showed “This is not valid JSON. Export OCR results as JSON and try again.” Importing valid JSON immediately afterward recovered successfully with a cell at row 99.
- Demo isolation: reset/exit removes `demo:table-proofing-desk` without changing a seeded real record. A queued autosave does not recreate demo data after exit.
- Human-check limit: image-only import remains an empty OCR state. The product does not claim to create OCR or guarantee accessibility.

The brief's 30-page, under-five-minute moderated success study was not run and is not advertised as a measured result.

## Deployment identity

All **21/21** public files in `dist/` matched the live response byte-for-byte, including direct route documents, inline shell, assets, manifest, service worker, icons, source map, robots, and sitemap. `staticwebapp.config.json` correctly returned 404 because it is deployment configuration rather than a public asset. The footer exposes build `polish-2`.

## Accessibility, responsive behavior, and motion

- Independent axe runs on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 at 1440 × 900 and 390 × 844 found zero violations, including zero serious/critical findings.
- Each audited route had `lang="en"`, one `h1`, one `main`, ordered headings, no missing alt text, and no default-size horizontal overflow.
- No visible default-size desktop or mobile target was smaller than 44 × 44 CSS px.
- Keyboard-only flow passed: first Tab focuses “Skip to main content”; Enter reaches `#main`; the sample opens with Enter; Space performs the correction. Focus uses a visible 3 px coral outline with 3 px offset.
- Reduced motion passed: smooth scrolling becomes `auto`, and button transition duration is effectively zero.
- No console or page errors occurred on normal routes. The intentional 404 navigation produced only the browser's expected failed-document 404 line.
- F-8-2 records the failing 200% text-size case.

## Privacy and requests

An independent complete demo edit/export/reload recorded four same-origin GET requests (`/demo` and `/sample-table.svg`, each twice), no request bodies, no cookies, no external performance resources, and only `demo:table-proofing-desk` in IndexedDB. The unique marker `VERIFICATION-8-PRIVATE-MARKER` persisted and appeared in the CSV export but in no request URL or body.

Repository inspection found no analytics, tracker, CDN-font, or third-party runtime script. The only runtime network path beyond navigation is the same-origin license gateway; checkout is a user-activated Sociobot link.

## PWA and offline behavior

- The live worker is active, controls the page, and uses cache `proof-desk-v3`.
- After priming `/demo`, an offline reload retained the sample, displayed “You’re offline,” accepted the correction, and exported data.
- A controlled local update simulation changed the served worker bytes. The app showed “A newer proofing desk is ready,” the “Update now” control reloaded, and `/demo` remained functional under the newly activated worker.
- Manifest fields include standalone display, versioned start URL, matching theme/background colors, and 192/512 icons with a maskable 512 icon.

## Headers, caching, links, and performance

- HTML: `no-cache, must-revalidate`; worker: `no-cache, no-store, must-revalidate`; manifest: one-hour revalidation; hashed assets/icons: one-year immutable.
- Responses include HSTS, `nosniff`, strict referrer policy, `X-Frame-Options: DENY`, permissions policy, and a self-only CSP with header-delivered `frame-ancestors 'none'`.
- Every same-origin link and fragment resolved. The GitHub source link returned 200. The checkout link was inspected but not invoked to avoid creating a checkout session.
- Build sizes: JS 37,120 bytes / 13,131 gzip; CSS 20,153 / 5,098 gzip; mobile hero 22,664 bytes; inline HTML 59,219 / 18,194 gzip. All stated static budgets pass.
- Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 100, SEO 100; FCP 1.03 s, LCP 1.20 s, CLS 0, total transfer 44,311 bytes. The Lighthouse process reported a tab crash after writing the completed report; the result was readable and all independent browser runs passed.

## Claim and copy cross-check

Landing, legal, and README claim-like statements map to `.factory/claims.json`; no unlisted product claim was found. The rate-limit claim is listed and locally tested, but fails in production as F-8-1.
