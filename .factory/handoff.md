# Repair 5 handoff — PASS

- Work order: `accessible-table-ocr-check-repair-5`
- Verifier report: `58eac486988e32660c1532d7e0a8a73940df9231`
- Rejected candidate: `bd6fa15a4e94c3de00e26871a553dbe71cec31ee`
- Repair commits: `cc32d3b` and `1f2c53d`
- Deployment: `49895aaa-f36d-4ee9-a562-f01bf5ced13a`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified and deployed: 2026-09-01 UTC

## Outcome

**PASS.** The sole release-blocking verification 6 finding is repaired. The product’s 20-request, 60-second license-verification allowance now uses one product-scoped atomic counter shared by every managed-function instance. In the final live concurrent run, atomic counts 1–20 returned `200`; counts 21–25 all returned `429` with positive `Retry-After` values across five function instances.

The verifier’s exact failure was reproduced before source changes. Twenty-five requests started together and completed in 2,065 ms with **25 × 200**, no `429`, and no `Retry-After`. All responses incorrectly reported 19 remaining across four instances. Evidence: [repair-5-pre-fix-concurrency.json](evidence/repair-5-pre-fix-concurrency.json).

## Root cause and repair

The previous signed cookie was client-carried state. Simultaneous requests all presented the same prior cookie, so none could observe another request’s increment. It was not an authoritative shared counter.

- Provisioned only the product-owned `sf-accessible-table-ocr-check-rate-limit` Basic C0 cache in `centralus`. Non-TLS access is disabled and the minimum TLS version is 1.2.
- Replaced the cookie/local-map limiter with a Redis Lua operation that performs `INCR`, first-window `PEXPIRE`, count, and remaining TTL atomically on one product-prefixed key.
- Hashes the normalized client address before storage. Raw addresses and document content do not enter the cache; keys expire after 60 seconds.
- Prefers Azure’s trusted client-IP header. The fallback removes a port only when the remainder parses as a valid IPv4 or IPv6 address.
- Fails closed with `503` and `Retry-After: 60` when the shared store is absent or unavailable.
- Removed the obsolete signing setting after deployment. The Static Web App now has only `RATE_LIMIT_REDIS_HOST` and `RATE_LIMIT_REDIS_KEY`; no credential is committed.

The first deployment of the shared store exposed an additional Azure boundary condition: `x-forwarded-for` contained one client IP with a different ephemeral source port on each simultaneous request. That live run produced 25 distinct one-count keys. The final normalization regression varies all 25 proxy ports across two isolated modules, and the real-cache integration test returns exactly 20 × `200` plus 5 × `429`.

## Exact regression coverage

- `tests/api.test.ts`: starts 25 promises together across two isolated function modules, varies the proxy source port on every request, sorts responses by `X-RateLimit-Count`, and requires counts 21–25 all to return `429` with positive `Retry-After`.
- `scripts/verify-live-rate-limit.mjs --concurrent`: runs the same 25-request assertion against production and rejects duplicate/missing atomic counts, the wrong policy, any excess `200`, or any non-positive `Retry-After`.
- `scripts/verify-live-rate-limit.mjs --sequential`: preserves the original boundary regression and requires requests 1–20 to return `200` and request 21 to return `429`.
- `.factory/claims.json`: updates `@claim:license-rate-limit` to the simultaneous observable contract and exact sandbox.

Final live concurrent evidence is [live-concurrency.txt](evidence/repair-5-live/live-concurrency.txt): **20 × 200, 5 × 429**, counts 1–25 without gaps, five instances, and `Retry-After` 57–59 seconds on every excess request. The separate sequential run returned **20 × 200**, then `429` with `Retry-After: 58`; see [live-sequential.txt](evidence/repair-5-live/live-sequential.txt).

## Clean local verification

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm ci --prefix api --ignore-scripts       PASS — 7 packages; 0 vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm run test:unit                           PASS — 16 tests
npm test                                    PASS — 16 unit/API; 53 browser; 7 intentional skips
npm run test:claims                         PASS — 2 tagged unit/API; 16 tagged browser scenarios
34 claims.json commands, separately         PASS — 34/34
npm run build                               PASS — dist/index.html produced
```

- Desktop and 390×844 projects cover the core workflow, every visible 44×44 target, keyboard-only correction, route focus, reduced motion, error recovery, imports/exports, demo isolation, local persistence, privacy, and offline reload.
- Local URL verification found the correct title, `lang`, one `h1`, one `main`, complete image alternatives, labeled buttons, and zero console errors.
- A controlled byte-changed service worker displayed **A newer proofing desk is ready**. Its **Update now** action measured 97.39×44 px and produced no errors.
- Local Lighthouse: **98 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 0.77 s, LCP 1.65 s, TBT 156 ms, CLS 0, 104,472 bytes.
- Output remains 36,597-byte JavaScript (13.01 KB gzip) and 19,578-byte CSS (4.98 KB gzip). The mobile hero is 22,664 bytes.

Evidence: [local summary](evidence/repair-5-local/summary.json), [service-worker update](evidence/repair-5-local/service-worker-update.json), local Lighthouse JSON, and desktop/mobile screenshots in `evidence/repair-5-local/`.

## Deployment and live verification

The pushed `1f2c53d` build was deployed with `dist/` and the managed `api/` to the existing `sf-accessible-table-ocr-check` Static Web App. Deployment `49895aaa-f36d-4ee9-a562-f01bf5ced13a` used API content hash `6cbb5ecf6a6b92736899ccb5b8565989`. No other product, shared service, staging slot, unrelated storage, billing resource, or out-of-scope DNS record was read or changed.

```text
npm run test:live-rate-limit                PASS — 20 × 200; counts 21–25 all 429 + Retry-After
npm run test:live-rate-limit:sequential     PASS — 20 × 200; request 21 429 + Retry-After
npm run test:e2e:live                       PASS — 52 browser; 8 intentional live/project skips
verify-url.sh live root                     PASS — HTTP 200; no console errors
21 public artifact identity comparisons    PASS — 21/21 byte-identical
```

- A fresh axe sweep of landing, demo, privacy, terms, and 404 at 1440×900 and 390×844 found zero violations at any severity. Every route retained one `h1`, one `main`, and no horizontal overflow. Normal routes produced no console errors; the expected failed-document line appeared only for the intentional HTTP 404.
- The live browser suite reconfirmed the keyboard, touch-target, privacy, demo/real-storage isolation, imports/exports, offline, responsive, legal-route, and recovery behavior that verification 6 had passed.
- Live HTML is `no-cache, must-revalidate`; `sw.js` is `no-cache, no-store, must-revalidate`; the manifest is JSON with must-revalidate caching; hashed assets are immutable for one year. CSP, header-delivered `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, permissions policy, and `X-Frame-Options: DENY` are present. The designed unknown route and deployment configuration URL both return 404.
- Live Lighthouse: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 0.93 s, LCP 1.35 s, TBT 125 ms, CLS 0, 105,458 bytes.

Evidence: [live summary](evidence/repair-5-live/summary.json), [identity](evidence/repair-5-live/identity.json), [accessibility](evidence/repair-5-live/accessibility.json), live Lighthouse JSON, URL verification JSON, and desktop/mobile screenshots in `evidence/repair-5-live/`.

## Known gap

The brief’s moderated 30-page, under-five-minute human study remains unmeasured and is not advertised as a tested product claim. No release-blocking product or deployment gap remains.

---

# Verification 6 handoff — historical FAIL

- Work order: `accessible-table-ocr-check-verify-6`
- Candidate: `bd6fa15a4e94c3de00e26871a553dbe71cec31ee`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2026-09-01 UTC

## Outcome

**FAIL.** The candidate and live deployment pass the first-read, claims, build, functional, privacy, accessibility, responsive, offline, update, caching, bundle, and Lighthouse checks. The server allowance does not hold for simultaneous requests from one client.

The sequential live check observed the documented **20 requests per 60 seconds**: requests 1–20 returned `200`; request 21 returned `429` with `Retry-After: 58`. A separate 25-request simultaneous check completed in 1,119 ms with **25 × 200**, no `429`, and no `Retry-After`. All responses reported function instance `17ed5def4d21`, while remaining counts repeated 19 or 18.

This is a high-severity release blocker. Use an authoritative, atomic product-scoped count shared by simultaneous function work, then add a live regression that starts more than 20 requests together and requires requests beyond the allowance to return `429` with a positive `Retry-After`.

## Verification summary

```text
34 claims.json commands, separately       PASS — 34/34
npm ci                                    PASS — 0 vulnerabilities
npm test                                  PASS — 15 unit/API; 53 browser; 7 declared skips
npm run lint                              PASS
npm run typecheck                         PASS
npm run build                             PASS — dist/ produced
npm run test:e2e:live                     PASS — 52 browser; 8 declared skips
npm run test:live-rate-limit              PASS — 20 × 200, then 429 + Retry-After
25 simultaneous live verification calls  FAIL — 25 × 200; no 429 or Retry-After
```

All 21 checked live artifacts are byte-identical to `dist/`. Root SHA-256 is `6f80d0b9f7299454050a4f7c1005999833ca3b6cea92eb75c71370030fca3cf1` at 58,121 bytes.

Independent axe checks found zero violations at any severity across five routes at desktop and 390px mobile. Keyboard-only correction, 44px targets, 200% zoom layout, reduced motion, legal routes, history focus, invalid-input recovery, local storage, four exports, and offline reload pass. The service-worker update notice appears with an accessible 44px action.

Privacy logging found only same-origin requests; the private marker appeared in no request body. Demo data used only `demo:table-proofing-desk` IndexedDB, with no unlicensed localStorage key or cookie. Response security and caching headers pass.

Lighthouse mobile: **93 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. LCP 1.35 s, CLS 0, total transfer 105,452 bytes. Production JavaScript is 13.01 KB gzip and CSS is 4.98 KB gzip before inlining.

## Evidence and next step

The full report is [verification-6.md](verification-6.md). Fresh evidence is in [evidence/verification-6](evidence/verification-6/), especially:

- `live-concurrency.json` — release-blocking simultaneous allowance result.
- `live-rate-limit.txt` — passing sequential boundary.
- `live-identity.json` — 21 candidate/live artifact comparisons.
- `independent-live.json` — desktop/mobile, axe, keyboard, privacy, headers, links, manifest, and offline evidence.
- `service-worker-update.json` — visible update notice.
- `lighthouse-live.json` — live mobile performance report.

No product code was modified. After the server allowance is corrected, rerun both sequential and simultaneous live checks, all claim commands, the full local/live suites, and the exact build.

The brief’s moderated 30-page, under-five-minute study remains unmeasured and is not advertised as a tested claim.
