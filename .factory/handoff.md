# Verification handoff — FAIL

- Work order: `accessible-table-ocr-check-verify-5`
- Candidate: `d683aaa568a3c4181a12b68d10d04cb62bb9b8df`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 2026-09-01 UTC

**FAIL.** The candidate passed the functional, claims, privacy, offline, build, live-identity, rate-limit, and demo-autosave-isolation checks. It does not meet the mandatory 44×44 CSS-pixel control baseline at desktop: the home link is 192×38px and the four primary navigation links are 40×22px, 89×22px, 51×22px, and 87×22px at 1440×900.

Required follow-up: give every header action link a 44×44 CSS-pixel minimum at all viewport sizes and add a desktop visible-control regression over landing, demo, privacy, terms, and 404. Then rerun local/live suites, every declared claim command, and the live rate-limit boundary.

See [verification-5.md](verification-5.md) for exact evidence and all findings. The repair-3 handoff below is historical evidence and is superseded by this verification result.

---

# Repair 3 handoff — historical PASS

- Work order: `accessible-table-ocr-check-repair-3`
- Verifier base: `2a47514cf8825d6286e28c930d0e6b7458d0146e`
- Repair commits: `2dc41ef` and `46720f1`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified and deployed: 2026-09-01 UTC

## Outcome

**PASS.** The release-blocking 390px header target defect is fixed and has a global visible-control regression. The passing signed-client-window limiter was preserved: live requests 1–20 returned `200`; request 21 returned `429` with `Retry-After: 58` and `X-RateLimit-Policy: signed-client-window`.

During final live verification, a separate demo-exit autosave race was found and repaired before handoff. A delayed demo save could write after leaving the isolated sample. Queued saves are now cancelled on reset/exit and carry their original project and storage namespace. The regression proves real data remains byte-identical and demo storage is empty after a queued demo edit, reset, and exit.

## What changed

- At 390px, every header link now has a 44×44 CSS-pixel minimum, including **Demo**. The exact pre-fix measurement was 39.984×44px.
- Added a mobile regression that audits every visible actionable target on landing, demo, privacy, terms, and 404 routes. It also surfaced and fixed the legal return link and source-overlay minimums.
- Added explicit demo autosave cancellation and namespace/project capture to prevent a stale queued write crossing demo/real storage boundaries.
- Added the demo-exit race regression to the browser suite.
- The rate-limiter source and policy were not changed.

## Verification

Fresh install and local gates:

```text
npm ci                                      PASS — 0 audit vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 15 unit/API; 52 browser; 6 intentional skips
npm run build                               PASS — dist/ produced
34 declared claim commands, individually    PASS
```

Production output before HTML inlining: 36.60 KB JavaScript (13.01 KB gzip) and 19.54 KB CSS (4.99 KB gzip). The final deployed `dist/index.html` is 58,079 bytes with SHA-256:

```text
390c1a26b0307bbddd9088fd052673adb3da223c497b5abab35337e52b3c821a
```

The live root has the identical hash. It was uploaded directly to the existing `sf-accessible-table-ocr-check` static app with `dist/` and `api/`; no shared infrastructure, DNS, billing, or prohibited services were changed.

Live release checks:

```text
npm run test:e2e:live                       PASS — 51 browser; 7 intentional local-only/project skips
npm run test:live-rate-limit                PASS — 20 × 200, then 429 + Retry-After
verify-url.sh live root                     PASS — title/lang/main/alt/console
```

- The live desktop/mobile suite covers keyboard correction, 390px layout and all visible target sizes, axe serious/critical violations, privacy request logging, route history/focus, imports/exports, legal pages, service-worker-controlled offline reload, and the demo-exit race.
- The final local controlled service-worker update check passed: offline demo reload retained the workbench and showed the offline notice; a byte-changed worker showed **A newer proofing desk is ready**; console errors were empty.
- Live response policy passed: root HTML `no-cache, must-revalidate`; `sw.js` `no-cache, no-store, must-revalidate`; manifest JSON; CSP with header-delivered `frame-ancestors 'none'`; HSTS, nosniff, strict referrer policy, restrictive permissions policy, and `X-Frame-Options: DENY`.
- Lighthouse 12.8.2 mobile: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 0.93s, LCP 1.07s, TBT 94.5ms, CLS 0.
- A separate package/consumer test is not applicable: this artifact is a static PWA, not a published library or CLI package.

Evidence is committed in [`.factory/evidence/repair-3-live`](evidence/repair-3-live/): live identity HTML, desktop/mobile screenshots, URL verification JSON, and the successful Lighthouse report.

## Known gap

The brief’s measured outcome calls for a moderated 30-page human study under five minutes per page. It remains unmeasured and is not advertised as a product claim.
