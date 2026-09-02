# Verification 11 — PASS

- Work order: `accessible-table-ocr-check-verify-11`
- Candidate commit: `626068a8ffbb65768f8d7062ca6814b1b31d7cd4`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Independently verified: 2 September 2026 UTC

## Release decision

**PASS.** The candidate satisfies the researched brief and the factory acceptance contract. The required claims gate, cold first-read gate, clean candidate checks, live end-to-end workflow, accessibility checks, privacy checks, PWA/offline behavior, deployment identity, rate limit, and performance budget all pass. No critical, high, medium, or low defect was found.

No product code was changed during verification.

## Mandatory opening gates

### Claims — 38/38 PASS

`.factory/claims.json` was present at the start of verification. After `npm ci`, every listed `test` command was run separately and exactly as declared. All 38 passed. The manifest has 38 unique IDs, every required field is present, and each ID occurs in exactly one tagged test.

| Claim | Result | Observable evidence |
|---|---|---|
| `demo-ready` | PASS | `/demo` opened with nine cells, nine overlays, and two seeded order errors. |
| `demo-isolation` | PASS | Demo reset/exit preserved the byte-identical real record and removed the demo record. |
| `proof-and-export` | PASS | Corrected order exported scoped column/row headers and the source-page reference. |
| `browser-local` | PASS | Edit, export, and reload completed with same-origin requests only. |
| `no-document-upload` | PASS | A unique document marker appeared in no request body. |
| `pages-stay-local` | PASS | Edited data persisted in the demo IndexedDB database and was absent from requests. |
| `no-third-party-runtime` | PASS | The complete demo flow loaded no analytics, tracker, CDN font, or off-origin runtime resource. |
| `indexeddb-only` | PASS | Working data used IndexedDB; storage keys, cookies, and requests matched the claim. |
| `offline-reload` | PASS | A dedicated context reloaded, edited, and exported the demo while offline. |
| `import-formats` | PASS | PNG, JPEG, WebP, and SVG source-image imports produced editable work. |
| `either-import-order` | PASS | Image-first and JSON-first flows both succeeded in fresh contexts. |
| `ocr-schema` | PASS | Documented `cells` and `blocks` fixtures normalized into editor fields. |
| `json-shapes` | PASS | Top-level and first-page `cells`/`blocks` containers all imported. |
| `field-normalization` | PASS | Aliased text, position, role, order, and box fields normalized correctly. |
| `bbox-formats` | PASS | Percentage, normalized, and pixel/page-dimension boxes produced equivalent overlays. |
| `reading-order-overlays` | PASS | Nine named overlays mapped to cells and exposed both seeded jumps. |
| `cell-corrections` | PASS | Text, position, and header-role edits reached preview and export. |
| `all-exports` | PASS | HTML, CSV, project JSON, and issue-report downloads had valid content. |
| `free-core` | PASS | An unlicensed fresh context completed correction and all four exports. |
| `free-state` | PASS | The free state was visible and usable without a license. |
| `sociobot-billing-path` | PASS | Checkout and same-origin verification paths matched the registered product. |
| `paid-purchase-terms` | PASS | The recorded public checkout contract and all rendered purchase disclosures agreed. |
| `generated-art-provenance` | PASS | Public provenance and SHA-256 values matched every shipped art derivative. |
| `licensed-saved-versions` | PASS | A recorded valid verdict enabled save, edit, and exact restore. |
| `local-saved-versions` | PASS | The saved version stayed in demo IndexedDB with no off-origin data request. |
| `import-limits` | PASS | 500 cells and coordinate 99 passed; 501 and coordinate 100 failed. |
| `rejection-before-write` | PASS | Over-limit imports did not replace the stored record. |
| `legacy-recovery` | PASS | A legacy row 10000 became row 99 with a visible review notice. |
| `project-round-trip` | PASS | Exported project JSON re-imported with all nine cell texts intact. |
| `clear-table-check` | PASS | Clearing removed `projects/current`, including after reload. |
| `inline-offline-shell` | PASS | Built HTML had no external app JS/CSS dependency; offline navigation passed separately. |
| `human-check-only` | PASS | Image-only import stayed empty and did not offer or produce OCR. |
| `issue-detection` | PASS | Unit fixture reported order, blank, duplicate-position, and missing-header defects. |
| `license-rate-limit` | PASS | Atomic unit test allowed counts 1–20 and returned 429 plus `Retry-After` for 21–25. |
| `license-token-cadence` | PASS | A current verdict made zero requests; a verdict older than 24 hours made exactly one. |
| `revoked-license` | PASS | Revocation removed saved-version controls while all free exports remained usable. |
| `license-fails-closed` | PASS | Missing/failing shared storage returned 503 with `Retry-After`. |
| `direct-route-documents` | PASS | Built Demo, Privacy, Terms, and 404 documents were directly available. |

### Cold first read — PASS

A fresh 1440 × 900 production context with service workers blocked requested only the same-origin document and hero image. It produced no console or page error. The first viewport answers the required questions in plain words:

- What: “Fix a scanned table’s reading order.”
- Who: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- First click: “Try it with sample data,” followed by “Opens a scanned transit table with two reading-order errors.”

That one click opens the populated isolated demo. The persistent banner reads “Demo — sample data, nothing is saved” and offers both **Reset demo** and **Start for real**.

## Clean candidate gates

The checkout began clean at the requested commit. `npm ci` installed 142 packages with zero vulnerabilities.

```text
38 exact claims.json commands      PASS — 38/38
npm test                           PASS — 16 unit/API; 64 browser; 8 intentional project skips
npm run typecheck                  PASS
npm run lint                       PASS
npm run build                      PASS — dist/ produced
npm run test:e2e:live              PASS — 63 browser; 9 intentional live/project skips
verify-url.sh production root      PASS — 200, title/lang/main/alt, no errors
```

The exact build emitted 37,706 bytes of app JavaScript (13.20 kB gzip), 20,495 bytes of CSS (5.16 kB gzip), no fonts, and a 22,664-byte mobile hero. These are below the 200 kB JS, 50 kB CSS, 120 kB font, and 300 kB mobile-hero budgets.

## Product workflow and recovery

- The live transit sample displayed nine OCR cells, nine numbered source overlays, and the two deliberately scrambled reading-order defects.
- Keyboard activation corrected the order and changed the result to “No structural errors detected.”
- HTML export contained `<th scope="col">Route</th>`, `<th scope="row">River</th>`, corrected reading order, and `Community mobility report, p. 42`.
- CSV had three rows; project JSON had nine cells; the issue report had its required heading.
- Malformed JSON produced: “This is not valid JSON … The current table check was not changed.” A valid replacement then loaded normally.
- Row and column 99 were accepted. Editing row to 100 produced a specific alert and restored the persisted safe value 99.
- The declared suite additionally covered 500/501-cell limits, all four image types, both import orders, documented JSON shapes and box systems, demo reset/exit isolation, project round-trip, clear/reload, legacy recovery, saved-version restore, and revoked-license recovery.
- The product accurately says it checks supplied OCR rather than creating OCR or guaranteeing accessibility.

## Accessibility, keyboard, responsive behavior, and visual review

- Independent axe scans on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 found zero serious or critical violations at 1440 × 900 and 390 × 844.
- Every audited rendering had `lang="en"`, one `h1`, one `main`, route-specific titles, no missing image alt, no horizontal overflow, and no visible interactive target smaller than 44 × 44 CSS pixels.
- Normal routes had no console or page errors. The intentionally missing document emitted only Chromium’s expected network 404 line while rendering the designed 404 page.
- Keyboard-only use exposed and activated the skip link, opened the demo with Enter, and corrected reading order with Space. Focused actions use a 3 px coral outline with 3 px offset; its 5.64:1 contrast against the paper background exceeds 3:1.
- With reduced motion requested, scrolling was `auto`, transitions were effectively instant (`0.00001s`), and no animation was running.
- At a 390 px viewport with a 200% root font size, the page stayed 390 px wide without clipping; visual inspection found no overlap or lost content.
- Desktop and mobile screenshots showed no broken image, distortion, clipped control, or misleading result. The risograph proofing-desk identity matches `.factory/design.md` and remains distinct from a generic framework layout.

## Privacy, PWA, headers, and caching

- The independent live edit/export/recovery flow made three requests, all same-origin, with no request bodies. It set no cookies, loaded no external runtime resource, and stored the demo in `demo:table-proofing-desk` IndexedDB.
- Response headers include a self-only CSP with header-delivered `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and `X-Frame-Options: DENY`.
- HTML uses `no-cache, must-revalidate`; `/sw.js` uses `no-cache, no-store, must-revalidate`; the manifest revalidates hourly; hashed assets are immutable for one year. The license endpoint uses `no-store`.
- The manifest has standalone display, a versioned start URL, thesis-matched colors, valid 192/512 icons, a maskable 512 icon, and a 180 px Apple touch icon.
- The active worker was `/sw.js` with cache `proof-desk-v6`. `registration.update()` completed with no waiting or installing worker. An offline reload retained the demo, showed the offline notice, accepted the correction, and exported the corrected CSV.
- All discovered internal links/fragments resolved. The source link returned 200; checkout returned its expected 303; the unknown route returned its intentional 404 with a recovery link.

## Deployment identity and server endpoint

- All 22 public files from the candidate build, including the source map, matched live response bodies byte-for-byte by SHA-256. `staticwebapp.config.json` is deployment configuration and is not counted as public content.
- The live managed verification endpoint behavior matches the candidate: invalid-token checks return JSON with `Cache-Control: no-store`, while missing shared-counter behavior is covered by the fail-closed unit test.
- A fresh simultaneous burst observed one atomic counter across four function instances. Counts 1–20 returned 200. Counts 21–25 returned 429 with `Retry-After: 59–60`. The documented and observed allowance is **20 requests per client per 60 seconds**.
- One earlier diagnostic burst was discarded because a preceding header probe made it start at count 2. The authoritative run waited out that window and began at count 1.
- The product checkout returned 303 to `checkout.dodopayments.com`. The read-only hosted page returned 200, named Accessible Table OCR Check and Sociobot, showed `$12.00`, and described the purchase as one-time. No purchase was attempted.
- The product has no sign-in flow, so the Entra tenant requirement is not applicable. It also has no document-processing backend or persistent server-side product data; documents remain in browser storage.

## Fresh performance measurement

Lighthouse 12.8.2 mobile simulated throttling at `2026-09-02T03:37:28Z`:

```text
Performance        92
Accessibility     100
Best Practices    100
SEO               100
FCP                1.0 s
LCP                1.2 s
TBT                350 ms
CLS                0
Transfer           44,492 bytes
```

A separate Event Timing observation for the main correction action reported a 32 ms interaction duration. Lighthouse does not produce field INP for a navigation-only lab run.

## Documentation, claims cross-check, and missed leverage

README, MIT `LICENSE`, `.factory/brief.json`, `.factory/design.md`, `.factory/demo.md`, `.factory/copy-audit.md`, Privacy, Terms, manifest, robots, sitemap, metadata, social image, and 404 are present and consistent. Landing and README claim-like statements map to the claims manifest; no unlisted public functional or privacy claim was found.

No AI feature is warranted. The brief calls for a local human review layer over supplied OCR and explicitly excludes creating OCR; model inference would weaken the product’s local-first boundary rather than complete an implied job.

## Findings and known gap

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Known gap: the brief’s 30-page moderated, under-five-minute success study was not repeated. The product makes no quantitative promise based on that research target, so this does not block the implemented smallest useful product.

## Reproduction

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e:live
npm run test:live-rate-limit # from a fresh 60-second client window
```
