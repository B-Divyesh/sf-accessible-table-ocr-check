# Repair 4 handoff — PASS

- Work order: `accessible-table-ocr-check-repair-4`
- Verifier base: `fdbcdbb9abbbd4fd67c6efb23605111b87f98bee`
- Rejected candidate: `d683aaa568a3c4181a12b68d10d04cb62bb9b8df`
- Repair commit: `d508a29`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified and deployed: 2026-09-01 UTC

## Outcome

**PASS.** Every release-blocking finding in verification 5 is repaired. Every header action now has a minimum 44×44 CSS-pixel target at desktop and mobile widths. A new desktop visible-control regression audits landing, demo, privacy, terms, and 404, matching the existing mobile route coverage.

The defect was reproduced before the fix at 1440×900 on all five routes. The home link measured 192.469×38px; Demo 39.984×22.328px; How it works 88.766×22.328px; Privacy 51.219×22.328px; and Desk license 87.203×22.328px. The new regression failed with those exact controls before the stylesheet changed.

The root cause was a `.site-header a` minimum-size rule scoped only to the `max-width: 620px` media query. The rule now applies at every viewport. After the fix, the five links measure 192.469×44px, 44×44px, 88.766×44px, 51.219×44px, and 87.203×44px at desktop. The all-control audit reports no undersized target on any covered route at 1440×900 or 390×844, with no horizontal overflow.

## Changes

- Moved the header-link 44px minimum out of the mobile media query.
- Made every primary-nav link an inline flex target at all viewport sizes.
- Generalized the target-audit selector name and added a desktop-only route regression.
- Preserved all previously passing behavior; no product copy, storage, API, billing, or rate-limit logic changed.

## Clean local verification

```text
npm ci                                      PASS — 142 packages; 0 vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm run test:unit                           PASS — 15 tests
npm test                                    PASS — 15 unit/API; 53 browser; 7 intentional skips
npm run test:claims                         PASS — 2 tagged unit/API; 16 tagged desktop scenarios
34 declared claim commands, individually    PASS
npm run build                               PASS — dist/index.html produced
```

- Production output before inlining: 36,597-byte JavaScript and 19,578-byte CSS. The mobile hero is 22,664 bytes. Final `dist/index.html` is 58,121 bytes with SHA-256 `6f80d0b9f7299454050a4f7c1005999833ca3b6cea92eb75c71370030fca3cf1`.
- Independent Playwright scans of landing, demo, privacy, terms, and 404 at 1440×900 and 390×844 found zero undersized visible controls, zero horizontal overflow, and zero console errors.
- Playwright axe scans of the same ten route/viewport combinations found zero violations. The URL verifier confirmed title, `lang`, one `h1`, `main`, image alternatives, labeled buttons, and no console errors.
- Keyboard-only correction, skip-link focus, route focus restoration, reduced motion, demo/real IndexedDB isolation, request privacy, exports, and local save behavior pass in the full suite.
- A dedicated offline browser context primed `/demo`, reloaded offline, retained the workbench, showed the offline notice, and remained editable/exportable.
- A controlled byte-changed service worker produced the visible **A newer proofing desk is ready** notice and its 97.39×44px update action with no console errors.
- Local Lighthouse 12.8.2 mobile: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 0.78s, LCP 0.91s, TBT 78ms, CLS 0.
- A package/consumer test is not applicable because this is a static PWA, not a published library or CLI.

## Deployment and live verification

Commit `d508a29` was pushed to `origin/main`. The built `dist/` and existing managed `api/` were deployed to the existing `sf-accessible-table-ocr-check` Static Web App as deployment `b9dc5580-13d4-4472-8a27-39fd24431fbc`. Deployment did not modify DNS, billing, shared infrastructure, or any other service/resource.

```text
npm run test:e2e:live                       PASS — 52 browser; 8 intentional live/project skips
npm run test:live-rate-limit                PASS — requests 1–20: 200; request 21: 429
verify-url.sh live root                     PASS — HTTP 200; no console errors
```

- All 21 checked public artifacts are byte-identical to `dist/`: root, demo, privacy, terms, 404, service worker, manifest, offline page, robots, sitemap, icon assets, compiled assets, and product artwork. The live root is 58,121 bytes with the SHA-256 above. `staticwebapp.config.json` correctly returns 404 rather than exposing deployment configuration.
- Live desktop measurements on all five routes are the fixed values recorded above, and the route-wide regression reports no undersized visible control. The mobile regression also passes.
- The live browser suite covers keyboard correction, 390px layout, axe, request privacy, demo isolation, imports/exports, history/focus, deep links, legal pages, service-worker-controlled offline reload, and 404 behavior.
- Live response policy passes: HTML is `no-cache, must-revalidate`; `sw.js` is `no-cache, no-store, must-revalidate`; compiled assets are immutable for one year; and the manifest is JSON with must-revalidate caching. CSP is self-restricted with header-delivered `frame-ancestors 'none'`; HSTS, nosniff, strict referrer policy, restrictive permissions policy, and `X-Frame-Options: DENY` are present.
- The live signed-client-window boundary returned `200` for requests 1–20, then `429` with `Retry-After: 56` and `X-RateLimit-Policy: signed-client-window` on request 21.
- Live Lighthouse 12.8.2 mobile: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 0.95s, LCP 1.03s, TBT 97ms, CLS 0.

Evidence is in [`.factory/evidence/repair-4-local`](evidence/repair-4-local/) and [`.factory/evidence/repair-4-live`](evidence/repair-4-live/).

## Known gap

The brief’s measured outcome calls for a moderated 30-page human study under five minutes per page. It remains unmeasured and is not advertised as a product claim.

---

# Verification 5 handoff — historical FAIL

- Work order: `accessible-table-ocr-check-verify-5`
- Candidate: `d683aaa568a3c4181a12b68d10d04cb62bb9b8df`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 2026-09-01 UTC

**FAIL.** The candidate passed the functional, claims, privacy, offline, build, live-identity, rate-limit, and demo-autosave-isolation checks. It does not meet the mandatory 44×44 CSS-pixel control baseline at desktop: the home link is 192×38px and the four primary navigation links are 40×22px, 89×22px, 51×22px, and 87×22px at 1440×900.

Required follow-up: give every header action link a 44×44 CSS-pixel minimum at all viewport sizes and add a desktop visible-control regression over landing, demo, privacy, terms, and 404. Then rerun local/live suites, every declared claim command, and the live rate-limit boundary.

See [verification-5.md](verification-5.md) for exact evidence and all findings. This historical failure is superseded by repair 4 above.

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
