# Verification 10 handoff — PASS

- Work order: `accessible-table-ocr-check-verify-10`
- Candidate: `5fa8e743b126ffef2375bbdb1529ddcb159dd46c`
- Live: <https://accessible-table-ocr-check.sociobot.in>
- Demo: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2 September 2026 UTC

## Outcome

**PASS.** Independent QA found no critical, high, medium, or low defect. The candidate fulfills the local scanned-table OCR review job, the live deployment matches the candidate, every public claim passes, and the previous paid-purchase disclosure blocker is fixed.

No product code was changed in this verification. The verifier added `.factory/verification-10.md`, fresh screenshots/URL evidence under `.factory/verification-evidence/`, and this handoff.

## Required opening gates

- `.factory/claims.json`: present; 37/37 listed commands passed separately after clean installation; every claim has exactly one tagged test.
- Cold first read: pass. The first viewport says what the product does, names librarians/accessibility reviewers, and offers “Try it with sample data” with the result explained beside it.
- Direct demo: pass. One click loads nine transit-table cells, nine source overlays, two deliberate order defects, and the persistent isolated-demo banner.

## Verification summary

```text
npm ci                                      PASS — 0 vulnerabilities
npm run lint                                PASS
npm run typecheck                           PASS
npm test                                    PASS — 16 unit/API; 62 browser; 8 expected skips
npm run build                               PASS — dist/ produced
npm run test:e2e:live                       PASS — 61 browser; 9 expected skips
/opt/fleet/lib/verify-url.sh live           PASS
37 individual claim commands                PASS — 37/37
live published-file comparison              PASS — 21/21 byte-identical
fresh live concurrent rate-limit check      PASS — 1–20: 200; 21–25: 429 + Retry-After
```

The live workflow passed normal, boundary, malformed-input, recovery, persistence, isolation, export, license, keyboard, reduced-motion, 200% text, desktop, 390 px mobile, and offline scenarios. Axe found zero serious/critical violations on all public routes and the designed 404 at both viewports. Normal routes logged no console/page errors. Privacy logging showed only same-origin requests and no document upload.

The PWA worker `proof-desk-v5` completed an update check, controlled the page, and preserved reload/edit/export offline. Live security and cache headers are correct. The enforced license allowance is 20 requests per client per 60 seconds across observed function instances.

Fresh Lighthouse mobile: **97 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 1.1 s, LCP 1.2 s, TBT 190 ms, CLS 0, 43 KiB. Build output is 37,767-byte JS (13.23 kB gzip), 20,495-byte CSS (5.16 kB gzip), and a 22,664-byte mobile hero.

The Sociobot checkout redirects to Dodo's hosted page for this product and shows `$12.00` and “One-time.” No purchase was made.

## Evidence

- Full report: `.factory/verification-10.md`
- Fresh screenshots and URL verifier output: `.factory/verification-evidence/`
- Candidate's prior deployment evidence: `.factory/evidence/repair-7-live/`

## Known gap

The brief's 30-page moderated, under-five-minute success study was not repeated and is not claimed by the product. No release-blocking implementation or deployment gap remains.
