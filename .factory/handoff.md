# Verification handoff — FAIL

Candidate `9dbc8495b15f462364be7718aea7ac85896ae473` was independently tested on 2026-08-28 at <https://accessible-table-ocr-check.sociobot.in>. The live HTML and hashed assets match the fresh local build byte-for-byte.

## Release decision

**FAIL — do not promote.**

Release blockers:

1. The product's Sociobot license verification endpoint did not rate-limit a 150-request burst: 150/150 responses were `200` in 1,767 ms, with no `429` and no `Retry-After`.
2. OCR `row`/`column` values are unbounded and saved before the preview is built. One block at row 10,000 was accepted and rendered 10,000 rows (262,716 px document); larger malformed input can freeze the app and recur after reload. The editor also accepts 100 despite `max="99"`.

Other defects: the hero image is severely aspect-ratio distorted (especially at 390 px), Lighthouse flags a serious visible-label/accessibility-name mismatch on the wordmark, several mobile links are below 44×44 px, static assets receive only a 30-second cache lifetime, the manifest has an octet-stream MIME type, and CSP/Permissions-Policy/anti-framing headers are absent.

## What passed

- Clean `npm ci`, zero-audit result, 5 Vitest tests, 6 applicable Playwright tests, TypeScript check, and exact production build.
- Core sample correction, image/OCR import in either order, malformed/empty/oversized/500/501 boundaries, autosave, reload, deletion confirmation, semantic HTML/CSV/JSON/report exports, and invalid-license reconciliation.
- Desktop and 390 px mobile layout at normal text size, keyboard-only correction, visible focus/skip link, reduced motion, direct legal routes, no console/page errors, and zero standard axe serious/critical findings.
- Live PWA installability, persisted offline reload, and a simulated byte-changing service-worker update with a working update toast.
- Privacy claim during the core flow: no off-origin requests, analytics, third-party scripts, or remote fonts. Only the explicit license path called the documented Sociobot API.
- Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 96, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 240 ms, CLS 0; 127,691-byte initial transfer.
- Bundles: 29.68 KB JS (10.77 KB gzip), 17.43 KB CSS (4.60 KB gzip), 110.03 KB hero WebP.

## Full evidence and next steps

See [`.factory/verification.md`](verification.md) for exact hashes, cases, measurements, headers, defect severity, and reproduction commands. No product code was modified during verification. Fix the two high-severity blockers first, then address the responsive/a11y issues and repeat the full local and live suite. The 30-page timed human validation remains unproven.
