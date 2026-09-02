# Repair 6 handoff — PASS

- Work order: `accessible-table-ocr-check-repair-6`
- Verifier report commit: `17845761589759cdfca9e3e6d2da97e4281cc142`
- Rejected candidate: `2218cd00b1a3a993ebc7ce034bb9aba36f0e49c5`
- Repair implementation: `5a5f94ae11ae9ea54fb59621f2d64973ee310157`
- Deployment: `0a1803bc-63f7-4199-ab1c-e2feecd09b11`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Repaired and verified: 2026-09-02 UTC

## Outcome

**PASS.** Both verification-8 release blockers are repaired and deployed. The product-owned license endpoint now serves its 20-request allowance and returns `429` plus a positive `Retry-After` for every excess request. At 390 × 844 with root text enlarged from 16 px to 32 px, the wordmark, local badge, and all four navigation links reflow without overlap, clipping, or horizontal page overflow.

The product remains a static offline PWA with a managed same-origin function. No shared Sociobot service, other product, staging slot, unrelated storage, DNS zone outside this product name, or billing resource was read or changed.

## Reproduction and root causes

- Before source changes, the exact 25-request live burst returned **25 × 503**, count `0`, `Retry-After: 60`, and no allowed request across four function instances.
- Before CSS changes, a live 390 px / 200% text measurement reproduced the verifier exactly: wordmark `x 16–247.23, y 14–106.03`; badge `x 101.64–374, y 34.41–85.63`; overlap about `145.59 × 51.22` CSS px.
- The Redis resource was healthy and reachable over TLS. Its product-owned hostname and primary key exactly matched the two Static Web App settings, while the failing live function issued no cache commands. The static deploy tool skips API dependency installation and packages the current `api/` directory, but the candidate build did not guarantee that `api/node_modules` existed. A clean deploy could therefore omit the Redis runtime package. The function also retained a resolved global store after a Redis client became unusable, so a warm instance could keep reusing a poisoned client.
- The mobile header forced the wordmark and badge into the same grid row. Rem-based text doubled while that row stayed two-column, so the items painted across each other.

## Repairs and exact regressions

- `api/license-verify/index.cjs` now discards a failed cached store, closes it, creates a fresh connection, and retries once. The identity check around the cached promise prevents concurrent failures from discarding a newer replacement.
- `npm run build` now runs the locked `api/` install before producing `dist/`, ensuring the deploy archive always contains the Redis runtime package from a clean checkout.
- `tests/api.test.ts` injects a stale first store, requires recovery in the same request, then proves the full 20 allowed / 21st rejected boundary with positive `Retry-After`.
- The existing simultaneous two-instance claim test still requires contiguous counts 1–25, 20 allowed responses, and five `429` responses.
- The mobile header now uses wrapping flex layout. At 200% text the badge moves below the wordmark and navigation wraps into two readable rows.
- `tests/e2e/app.spec.ts` sets a real 390 × 844 viewport and 32 px root text, measures zero wordmark/badge overlap, requires all four links to remain visible and inside the viewport, and rejects horizontal document overflow. The same test runs against local and live builds.
- The visible build is `repair-6`; the service-worker cache is `proof-desk-v4`, ensuring installed clients detect this release.

## Clean local verification

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts       PASS — 7 packages; 0 vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 16 unit/API; 60 browser; 8 intentional project skips
36 claims.json commands, separately         PASS — 36/36
npm run build                               PASS — dist/index.html produced
verify-url.sh local root                    PASS — title/lang/main/alt; no console errors
```

- Build sizes: JavaScript 37,120 bytes / 13,133 gzip; CSS 20,280 bytes / 5,127 gzip; mobile hero 22,664 bytes. These remain below the product budgets.
- Eleven axe runs covered `/`, `/demo`, `/privacy/`, `/terms/`, and 404 at desktop and 390 px, plus the 390 px / 200% text state: **zero violations**.
- The final 200% measurement reports `overlapArea: 0`, no horizontal overflow, and all navigation bounds inside 390 px. Evidence: [text-resize metrics](evidence/repair-6-local/text-resize-200.json) and [screenshot](evidence/repair-6-local/text-resize-200-mobile.png).
- Local Lighthouse: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 0.8 s, LCP 1.7 s, TBT 80 ms, CLS 0, 102 KiB. Lighthouse wrote the complete report before its headless tab exited with the known post-report crash.

## Deployment and live verification

```text
npm run test:e2e:live                       PASS — 59 browser; 9 intentional live/project skips
npm run test:live-rate-limit                PASS — counts 1–20 returned 200; 21–25 returned 429
npm run test:live-rate-limit:sequential     PASS — counts 1–20 returned 200; count 21 returned 429
verify-url.sh live root                     PASS — HTTP 200; title/lang/main/alt; no console errors
candidate/live artifact comparison          PASS — 21/21 public files byte-identical
```

- Concurrent limiting passed across four managed-function instances. Every count from 1 through 25 appeared once; excess responses supplied `Retry-After` values of 58–59 seconds. The separate sequential excess response supplied `Retry-After: 58`. Evidence: [rate-limit summary](evidence/repair-6-live/rate-limit.json).
- The live 390 px / 200% state has zero overlap and no horizontal overflow; all four navigation links remain within the viewport. Eleven live axe runs found zero violations and no unexpected console errors. Evidence: [accessibility report](evidence/repair-6-live/accessibility.json) and [screenshot](evidence/repair-6-live/text-resize-200-mobile.png).
- A dedicated browser context confirmed an active controlling worker, cache `proof-desk-v4`, successful `registration.update()`, offline reload, correction, and CSV export with no errors. Evidence: [offline/update report](evidence/repair-6-live/offline-update.json).
- Live Lighthouse: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 1.0 s, LCP 1.4 s, TBT 80 ms, CLS 0, 103 KiB. Lighthouse wrote the complete report before its headless tab exited with the known post-report crash.
- Live output identity: [21-file comparison](evidence/repair-6-live/identity.json). URL verification and desktop/mobile screenshots are in [repair-6-live](evidence/repair-6-live/).

## Known gap

The brief’s moderated 30-page, under-five-minute human study remains unmeasured and is not presented as a product claim. No release-blocking product or deployment gap remains.
