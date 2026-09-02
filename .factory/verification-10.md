# Verification 10 — PASS

- Work order: `accessible-table-ocr-check-verify-10`
- Candidate commit: `5fa8e743b126ffef2375bbdb1529ddcb159dd46c`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Independently verified: 2 September 2026 UTC

## Release decision

**PASS.** The candidate meets the researched brief and factory acceptance contract. The local candidate is buildable, the complete workflow works on the live deployment, every declared claim passes, and all 21 publishable build files match live responses byte-for-byte. No release-blocking, high, medium, or low defect was found.

## Mandatory opening gates

### Claim tests

`.factory/claims.json` exists with 37 entries. After the required clean `npm ci`, every listed `test` command was run separately and exactly as declared: **37/37 passed, 0 failed**. Every claim ID also occurs in exactly one tagged test.

Coverage includes the populated and isolated demo, semantic HTML correction/export, all four exports, local-only data handling, offline reload, image and OCR JSON shapes, normalization, bounding boxes, grid limits, recovery, free and paid states, purchase disclosures, saved versions, license cadence/revocation, the shared rate limit, and direct route documents. The live and README copy contains no additional unsupported functional or privacy claim.

### Cold first read

**PASS.** A fresh 1440 × 900 live visit answered all three questions in the first viewport:

- What: “Fix a scanned table’s reading order.”
- Who: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- First action: “Try it with sample data,” beside “Opens a scanned transit table with two reading-order errors.”

The action opens `/demo` in one click with nine cells, nine numbered source overlays, two deliberate errors, and the persistent “Demo — sample data, nothing is saved” banner. The cold page requested only its same-origin document and hero image and produced no console or page error.

Evidence: `.factory/verification-evidence/live-cold-desktop.png`.

## Clean candidate gates

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
37 claims.json commands, separately         PASS — 37/37
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 16 unit/API; 62 browser; 8 expected project skips
npm run build                               PASS — dist/ produced
npm run test:e2e:live                       PASS — 61 browser; 9 expected live-only skips
/opt/fleet/lib/verify-url.sh live           PASS — 200; title/lang/main/alt; no errors
npm run test:live-rate-limit                PASS from a fresh 60-second window
```

The build emitted 37,767 bytes of JavaScript (13.23 kB gzip), 20,495 bytes of CSS (5.16 kB gzip), and a 22,664-byte mobile hero. There are no font downloads. These are below the 200 kB JS, 50 kB CSS, 120 kB font, and 300 kB mobile-hero budgets.

## Product workflow and recovery

- The transit sample exposed both scrambled reading-order defects. The keyboard-operable correction cleared the structural errors.
- HTML export contained `<table>`, `<th scope="col">Route</th>`, `<th scope="row">River</th>`, corrected order, and `Community mobility report, p. 42` as the source reference.
- CSV contained the corrected row; project JSON retained nine cells; the issue report had its expected heading.
- Malformed JSON displayed “This is not valid JSON. Export OCR results as JSON and try again.” in the import status region. A valid replacement then loaded successfully.
- Row and column 99 imported correctly. Entering row 100 produced a specific announced error and restored the last safe value, 99.
- The suites additionally passed 500-cell acceptance, 501-cell rejection before persistence, oversized import rejection, legacy coordinate repair, four image types, both import orders, all documented JSON containers and box systems, demo reset/exit isolation, project round trip, clear/reload, and revoked-license recovery.
- The product honestly does not create OCR or guarantee accessibility, matching the brief's non-goals.

## Accessibility, responsive behavior, and visual review

- Independent axe audits of `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 at 1440 × 900 and 390 × 844 found zero serious or critical violations.
- Every audited route had `lang="en"`, one `h1`, one `main`, its correct title, no missing image alt text, and no horizontal overflow.
- Normal routes produced no console or page errors. The intentional missing-page navigation produced only Chromium's expected failed-document 404 line while rendering the designed 404.
- Keyboard-only use exposed and activated the skip link, opened the demo with Enter, and corrected the error with Space. Focus uses a 3 px coral outline with 3 px offset; it measures 5.64:1 against the paper background.
- With reduced motion requested, smooth scrolling changed to `auto`, transitions fell to `0.00001s`, and there were no active animations.
- Repository checks passed 44 × 44 targets on all routes at desktop and mobile, plus a 390 px layout at 200% root text size.
- Visual inspection found no clipping, overlap, broken image, misleading artwork, or generic framework treatment. The risograph proofing-desk system matches `.factory/design.md`.

Evidence: `.factory/verification-evidence/live-demo-mobile.png`, `live-focus-desktop.png`, and `verify-url-live/`.

## Privacy, PWA, and deployment policy

- A complete live demo correction and export recorded seven requests, all to `accessible-table-ocr-check.sociobot.in`, with no request body. No document content, analytics, tracker, CDN font, or third-party runtime request occurred.
- Demo data uses `demo:table-proofing-desk`; real work uses `table-proofing-desk`. The claim suite verified byte-for-byte isolation and deletion on exit.
- The live worker controls the page at `/sw.js`, uses cache `proof-desk-v5`, and completed `registration.update()` with no waiting worker. Offline reload retained the demo, displayed the offline state, accepted the correction, and exported the expected CSV.
- The manifest has standalone display, versioned start URL, 192/512 icons including maskable purpose, and thesis-matched theme/background colors.
- HTML revalidates on every use, the worker is `no-cache, no-store`, the manifest revalidates hourly, and hashed assets/icons are immutable for one year.
- Responses include a self-only CSP with header-delivered `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, `X-Frame-Options: DENY`, and a restrictive permissions policy.

## Deployment identity, endpoint, and purchase path

- **21/21 publishable files** in the clean `dist/` match live responses byte-for-byte by SHA-256. `staticwebapp.config.json` correctly remains deployment configuration rather than a public file. The live deployment therefore matches candidate `5fa8e743b126ffef2375bbdb1529ddcb159dd46c`.
- A fresh simultaneous license-verification burst observed one atomic counter across four function instances. Counts 1–20 returned 200. Counts 21–25 returned 429 with `Retry-After: 60`. The enforced and documented allowance is **20 requests per client per 60 seconds**.
- Unit tests also verify fail-closed 503 behavior with `Retry-After` when the shared limiter is unavailable. The live endpoint sends `Cache-Control: no-store` and carries no document data.
- The registered Sociobot checkout returned 303 to Dodo's hosted checkout. The hosted page named Accessible Table OCR Check, showed `$12.00`, and said “One-time.” No order was placed.
- All 14 discovered links/fragments resolved as intended: public product pages returned 200, the designed missing route returned 404, the source repository returned 200, and checkout returned the expected 303.

## Fresh performance measurement

Lighthouse 12.8.2, mobile simulated throttling, 2026-09-02T02:00:28Z:

```text
Performance       97
Accessibility    100
Best Practices   100
SEO              100
FCP               1.1 s
LCP               1.2 s
TBT               190 ms
CLS               0
Transfer          43 KiB
```

INP is not produced for a navigation-only lab run. The product remains below the Lighthouse-class budgets that can be measured in this run.

## Documentation and missed-leverage check

README, MIT `LICENSE`, `.factory/design.md`, `.factory/demo.md`, `.factory/copy-audit.md`, Privacy, Terms, manifest, robots, sitemap, metadata, social image, and 404 are present and consistent. The copy audit contains no over-22-word landing unit or banned marketing term.

No AI feature is warranted. The brief calls for a local human QA layer over supplied OCR; adding model inference would conflict with its privacy focus and its explicit non-goal of creating OCR.

## Findings and known gap

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Known gap: the brief's 30-page moderated, under-five-minute success study was not repeated. The product does not claim that result, and this does not block the implemented smallest useful product.
