# Verification 9 — FAIL

- Candidate commit: `5a5f94ae11ae9ea54fb59621f2d64973ee310157`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2026-09-02 UTC

## Release decision

**FAIL.** The candidate's table-checking workflow, deployment, accessibility, privacy, offline behavior, and live rate limit pass. The live product nevertheless offers a paid Desk license without the purchase disclosures required by the paid-unlock contract.

## Finding

### F-9-1 — High — paid checkout lacks required price and purchase terms

The live landing page presents **Get Desk license**, linked to the registered Sociobot checkout, but neither the license section nor `/terms/` nor `/privacy/` states:

- the exact price;
- that the purchase is one-time;
- that Sociobot/Dodo is the merchant of record; or
- where refunds are handled.

The visible license section says only that a Desk license adds named saved versions. The live copy audit found zero currency/price, `one-time`, `merchant of record`, or `refund` occurrences on all three pages. A metadata description contains “one-time,” but metadata is not visible purchase disclosure.

This violates the paid-unlock acceptance contract's copy and law requirements. A user can reach checkout without knowing the price or purchase/refund terms on the product page. Add the exact registered price and all required terms beside the checkout action and on `/terms/`, then add claim coverage for the user-visible purchase facts.

Evidence: `.factory/evidence/verification-9/paid-copy-audit.json`.

## Mandatory opening gates

### Claims

`.factory/claims.json` exists with 36 entries. Every declared `test` command was run separately against the clean candidate checkout before the broader QA suite. **36/36 passed; 0 failed.** Evidence: `claims-run.txt` and `claims-summary.json`.

The landing, app, README, privacy, and terms claims otherwise map to the claims file. No additional unlisted functional or privacy claim was found. F-9-1 is missing required purchase disclosure, rather than a false listed claim.

### Cold first read

**PASS.** A fresh live visit answers all three required questions in the first viewport:

- What it does: “Fix a scanned table’s reading order.”
- Who it is for: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- What to click first: “Try it with sample data,” with the adjacent outcome “Opens a scanned transit table with two reading-order errors.”

The action opens `/demo` in one click with nine cells, nine numbered overlays, two seeded errors, and the persistent isolated-demo banner. The cold load made only same-origin requests and logged no errors.

## Clean candidate checks

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts        PASS — 7 packages; 0 vulnerabilities
36 commands in .factory/claims.json         PASS — 36/36 separately
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 16 unit/API; 60 browser; 8 expected skips
npm run build                               PASS — dist/ produced
npm run test:e2e:live                       PASS — 59 live browser checks; 9 expected skips
/opt/fleet/lib/verify-url.sh                PASS — 200, title/lang/main/alt, no errors
npm run test:live-rate-limit                PASS from a fresh window
npm run test:live-rate-limit:sequential     PASS from the next fresh window
```

The first concurrent probe followed live browser tests and inherited counts 4–28, so it correctly exercised the limiter but did not meet the script's fresh-window precondition. After the window expired, the exact command passed with contiguous counts 1–25. This is recorded in `live-rate-concurrent.txt` and `live-rate-concurrent-fresh.txt`.

## Product workflow and recovery

- The nine-cell transit sample exposed both deliberate order defects. The one-action correction cleared structural errors.
- HTML export contained a semantic table, column and row headers with `scope`, the source-page reference, and corrected reading order.
- CSV contained three table rows; project JSON contained all nine cells; the issue report contained its expected heading.
- Malformed JSON produced a specific recovery message. A valid replacement then imported successfully at the supported row/column boundary of 99.
- The full suites also passed 500-cell acceptance, 501-cell rejection, coordinate-100 rejection before persistence, legacy-coordinate repair, import-order and image-format cases, demo isolation, project round trip, clear/reset, and license revocation recovery.
- The brief's 30-page moderated under-five-minute success study was not repeated and is not presented as a measured product claim.

Evidence: `core-flow.json`, `npm-test.txt`, and `live-e2e.txt`.

## Deployment identity and server endpoint

All **21/21** published files in `dist/` match live responses byte-for-byte by SHA-256. This includes direct route documents, assets, inline shell, manifest, service worker, icons, source map, robots, and sitemap. The deployment-only `staticwebapp.config.json` correctly returns 404. The footer identifies build `repair-6`.

The live license endpoint is healthy within its allowance and behaves like the candidate gateway. A fresh simultaneous burst observed one atomic counter across four function instances: counts 1–20 returned 200, and counts 21–25 returned 429 with a positive `Retry-After`. A separate fresh sequential run produced counts 1–20 as 200 and count 21 as 429 with `Retry-After: 57`. The observed allowance is **20 requests per client per 60 seconds**. The sequential reset to count 1 also confirms the window boundary. The endpoint returns `Cache-Control: no-store`; no server-side document state is used.

Evidence: `live-identity.json`, `live-rate-concurrent-fresh.txt`, `live-rate-sequential-fresh.txt`, and `live-headers.txt`.

## Accessibility and responsive behavior

- Independent axe audits on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 at 1440 × 900 and 390 × 844 found zero violations, including zero serious/critical findings.
- Every audited page had `lang="en"`, exactly one `h1`, one `main`, no missing image alt text, route-specific titles, and no horizontal overflow.
- Keyboard-only navigation exposed the skip link, moved to `#main`, opened the sample, and corrected reading order with Space. The UI supplies a designed 3 px focus rule; the focused skip link itself becomes a high-contrast visible block.
- Reduced motion changed scrolling to `auto` and reduced transitions to effectively zero.
- At 390 px with root text enlarged to 200%, all five routes stayed within the viewport. The repaired wordmark and “Local by default” badge had zero vertical overlap, and all four primary navigation links remained visible.
- Default-size touch targets passed the repository's 44 × 44 checks on desktop and mobile.
- No console/page error occurred on normal routes. Navigating to the intentional 404 produced only the expected failed-document 404 console line.

Evidence: `independent-live.json`, `text-resize-200.json`, screenshots in `verification-9/`, and `verify.json`.

## Privacy, PWA, headers, and performance

- A complete live edit/reload flow recorded only same-origin GETs. The unique private marker appeared in IndexedDB and survived offline reload, but appeared in no request URL or body. There were no cookies, analytics, trackers, CDN fonts, or external runtime resources.
- The live service worker controlled the page, cached `proof-desk-v4`, supported offline demo reload/edit state, and displayed “A newer proofing desk is ready” when changed worker bytes were served in a controlled local update simulation.
- HTML is non-cacheable/revalidated, the worker uses `no-cache, no-store`, the manifest revalidates hourly, and hashed assets/icons are one-year immutable.
- Live responses include HSTS, `nosniff`, strict referrer policy, a restrictive permissions policy, `X-Frame-Options: DENY`, and a self-only CSP with header-delivered `frame-ancestors 'none'`.
- All same-origin links/fragments resolved, and the GitHub source returned 200. The checkout URL was inspected but not invoked.
- Build output: JS 37,120 bytes / 13.09 KB gzip; CSS 20,277 bytes / 5.11 KB gzip; mobile hero 22,664 bytes; no fonts. Budgets pass.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.97 s, LCP 1.04 s, TBT 139 ms, CLS 0, transfer 105,651 bytes.

Evidence: `independent-live.json`, `service-worker-update.json`, `live-headers.txt`, `link-crawl.json`, `live-identity.json`, and `lighthouse-live.json`.

## Missed-leverage check

No AI feature is warranted. The brief calls for a local human QA layer over supplied OCR, and the product correctly avoids claiming OCR generation or automatic accessibility assurance.

## Required next step

Add the exact Desk license price, one-time purchase wording, Sociobot/Dodo merchant-of-record disclosure, and refund handling beside the checkout action and in the terms. Add a claim/test for those visible facts, deploy, and rerun verification from the new candidate.
