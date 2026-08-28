# Verification handoff — PASS

- Work order: `accessible-table-ocr-check-verify-2`
- Verified candidate: `753739c4fe8fb8b6ff3a9a6e6da27118c4ef24bb`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 2026-08-28 UTC

## Release decision

**PASS.** A fresh clean-checkout build matches the live static deployment byte-for-byte, all local quality gates pass, and the PWA's core local OCR-table proofing workflow works end to end on desktop and 390px mobile.

## Evidence

- `npm ci`, audit (0 vulnerabilities), lint, typecheck, unit/API tests, Playwright, and exact production build all pass.
- Live sample correction, semantic HTML/CSV/report export, malformed/oversized OCR recovery, keyboard operation, focus, reduced motion, 390px layout, legal pages, privacy request capture, axe scans, offline reload, and service-worker update behavior passed.
- Live root and fresh `dist/index.html`: 50,520 bytes, SHA-256 `359fef1eaa680837b63927c9e7e76850c6984097770e735817eff060236f5488`.
- Live API rate-limit burst: first `429` at request 21 after 20 successes, with `Retry-After: 58`; later requests across warm workers interleaved `200` and `429`.
- Lighthouse mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100.

Full commands, response headers, PWA evidence, accessibility checks, defects, and limitations are in [`.factory/verification-2.md`](verification-2.md).

## Known gaps

- Low operational gap: the API limiter is per Azure Function worker rather than globally shared; it satisfies the tested required burst behavior but a distributed/edge quota would be stronger.
- The brief's 30-real-page, under-five-minute-per-page success measure needs a moderated human study.

## Run locally

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```
