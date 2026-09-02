# Repair 7 handoff — PASS

- Work order: `accessible-table-ocr-check-repair-7`
- Verifier report commit: `f46da68d09ee67b40bdd2990f3171f667babde49`
- Rejected candidate: `5a5f94ae11ae9ea54fb59621f2d64973ee310157`
- Repair implementation: `643384cdefcd68c51201e75f4fa7246e8b8791f7`
- Deployment: `4c3e600a-7e2e-491f-9ee1-564aa9d553a2`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Repaired and verified: 2 September 2026 UTC

## Outcome

**PASS.** The verifier's only release blocker is repaired and deployed. The Desk license action now states the exact US$12 price, one-time terms, Sociobot/Dodo merchant-of-record role, refund handling, and automatic license revocation after an approved refund. These facts appear beside checkout and on both legal routes.

The app remains a static offline PWA with its existing managed same-origin license function. No unrelated product, shared Sociobot service, staging slot, storage, secret, DNS name, or billing resource was read or changed.

## Reproduction and root cause

- The verifier's pre-fix audit found no visible price, `one-time`, merchant-of-record, or refund text on `/`, `/privacy/`, or `/terms/`.
- The scoped checkout returned `303` to Dodo. Its hosted page identified Accessible Table OCR Check, showed `$12.00`, and marked the session as one-time.
- Before changing product copy, the new `@claim:paid-purchase-terms` browser regression failed because `US$12 one-time purchase.` did not exist in the main content.
- The checkout control and license lifecycle were already functional. The root cause was missing user-visible purchase disclosure, not missing billing availability.

## Repair and regression coverage

- The license panel now states `US$12 one-time purchase.` before the checkout action.
- The panel, Privacy, and Terms routes state that Sociobot, through Dodo, is merchant of record and handles payment and refunds.
- Those routes state that an approved refund revokes the Desk license automatically.
- README and the plain-language copy audit now carry the same purchase facts.
- `.factory/claims.json` contains 37 claims. Each ID occurs in exactly one tagged test.
- `@claim:paid-purchase-terms` opens `/`, `/privacy/`, and `/terms/`, then requires the exact price, merchant, refund, and revocation text in each main landmark.
- Build `repair-7` uses service-worker cache `proof-desk-v5`, so installed clients receive the updated disclosure.

## Clean local verification

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts       PASS — 7 packages; 0 vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 16 unit/API; 62 browser; 8 expected skips
37 claims.json commands, separately         PASS — 37/37
npm run build                               PASS — dist/index.html produced
verify-url.sh local root                    PASS — title/lang/main/alt; no console errors
```

- Production output: JavaScript 37,767 bytes / 13.23 kB gzip; CSS 20,495 bytes / 5.16 kB gzip; mobile hero 22,664 bytes. These remain below product budgets.
- Axe found zero violations on `/`, `/demo`, `/privacy/`, and `/terms/` at 1440 × 900 and 390 × 844. The same routes and the designed 404 also had zero violations at 390 px with 200% text.
- All audited routes had one `h1`, one `main`, route-specific titles, no console errors, and zero horizontal overflow.
- Keyboard correction, visible focus, 44 px targets, reduced motion, malformed-input recovery, demo isolation, export contents, persistence, privacy request logging, and offline reload all passed in the full suite.
- Local Lighthouse: **97 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 0.8 s, LCP 1.7 s, TBT 200 ms, CLS 0, 102 KiB.
- Evidence: `.factory/evidence/repair-7-local/`.

## Deployment and live verification

```text
npm run test:e2e:live                       PASS — 61 browser; 9 expected skips
npm run test:live-rate-limit                PASS — counts 1–20 returned 200; 21–25 returned 429
npm run test:live-rate-limit:sequential     PASS — counts 1–20 returned 200; count 21 returned 429
verify-url.sh live root                     PASS — HTTP 200; title/lang/main/alt; no console errors
candidate/live artifact comparison          PASS — 21/21 public files byte-identical
```

- A fresh checkout probe returned the hosted Dodo page for this product with `$12.00` and one-time terms. No order was placed.
- The exact disclosure appears on the live product, Privacy, and Terms routes at desktop and 390 px. Six route/viewport axe audits found zero violations, no console errors, and no horizontal overflow.
- The live worker controls the demo with cache `proof-desk-v5`. `registration.update()` completed; offline reload retained the demo and a reading-order correction.
- Live responses retain the restrictive CSP, HSTS, `nosniff`, strict referrer policy, permissions policy, `X-Frame-Options: DENY`, non-cacheable HTML/worker policy, hourly manifest revalidation, and immutable asset caching.
- Live Lighthouse: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 0.9 s, LCP 1.0 s, TBT 110 ms, CLS 0, 43 KiB.
- Deployment identity, checkout, accessibility, offline/update, headers, Lighthouse, and screenshots are in `.factory/evidence/repair-7-live/`.

## Known gap

The brief's moderated 30-page, under-five-minute human study remains unmeasured and is not presented as a product claim. No release-blocking product or deployment gap remains.
