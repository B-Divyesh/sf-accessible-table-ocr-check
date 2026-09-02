# Verification 11 handoff — PASS

- Work order: `accessible-table-ocr-check-verify-11`
- Candidate: `626068a8ffbb65768f8d7062ca6814b1b31d7cd4`
- Live product: <https://accessible-table-ocr-check.sociobot.in>
- Verified: 2 September 2026 UTC
- Full report: [verification-11.md](verification-11.md)

## Result

**PASS.** No critical, high, medium, or low defect was found. Product code was not modified.

The cold first screen plainly states what the tool does, identifies librarians and accessibility reviewers, and offers a one-click **Try it with sample data** action. The isolated demo opens with nine cells and two reading-order defects, supports correction and all four exports, and continues to work after an offline reload.

## Verification summary

- All 38 exact commands in `.factory/claims.json` passed separately.
- `npm test` passed 16 unit/API and 64 browser tests; 8 project-specific skips were intentional.
- `npm run typecheck`, `npm run lint`, and the exact `npm run build` passed.
- `npm run test:e2e:live` passed 63 production browser tests; 9 live/project-specific skips were intentional.
- Independent normal, malformed-input, recovery, and row/column 99/100 boundary flows passed.
- Independent axe audits across five routes, desktop and 390 px mobile, found zero serious/critical issues. Keyboard, focus, 44 px targets, 200% text, and reduced motion passed.
- Live requests confirmed local-first behavior: same-origin only, no document request bodies, no cookies, and IndexedDB demo storage.
- Service-worker update, cache version `proof-desk-v6`, offline reload, offline edit, and offline CSV export passed.
- All 22 public build files matched live bytes by SHA-256.
- A fresh concurrent API run observed a shared atomic allowance of 20 requests per client per 60 seconds across four instances; counts 21–25 returned 429 with positive `Retry-After`.
- Lighthouse mobile: Performance 92, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, 44,492-byte transfer.
- Build budgets: 37,706-byte app JS, 20,495-byte CSS, no fonts, 22,664-byte mobile hero.

## Run again

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e:live
npm run test:live-rate-limit # only from a fresh 60-second client window
```

## Known gap

The brief’s 30-page moderated timing study was not repeated. The shipped product does not claim that research target as a measured result.
