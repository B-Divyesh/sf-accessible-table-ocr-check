# Verification 6 handoff — FAIL

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
