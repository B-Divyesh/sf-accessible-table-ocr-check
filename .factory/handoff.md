# Polish 3 handoff — PASS

- Work order: `accessible-table-ocr-check-polish-3`
- Product: <https://accessible-table-ocr-check.sociobot.in>
- Application repair commit deployed: `eea4d4464b803631f520a17eb81a27dbff9cec26`
- Base review: `ae4f748e928d2b094c26e9e5b3374b38af37100d`
- Deployment: existing product-owned Static Web App `sf-accessible-table-ocr-check`, production static deployment with the managed `api/` function.

## What changed

- Replaced circular purchase-copy assertions with a deterministic recorded checkout contract in `tests/fixtures/billing-checkout-contract.json`. It records a read-only 303 from the registered Sociobot checkout endpoint, public Dodo hosted-checkout fields for the USD 12 one-time session, Sociobot business, and Dodo order-help disclosure. `npm run refresh:billing-fixture` safely refreshes it without placing an order.
- Narrowed buyer-facing terms to what that independent record proves: “Checkout is processed by Dodo Payments, with Sociobot shown as the business” and “Dodo Payments handles order questions and returns.” Unsupported merchant/refund/revocation causation claims were removed.
- Replaced visitor-facing `localStorage` language with “browser storage.” The implementation remains local-first and the technical storage boundary remains tested.
- Registered `generated-art-provenance` in `.factory/claims.json`, shipped `public/assets/proofing-table.provenance.json`, and test SHA-256s for the hero, mobile derivative, and social crop against the public build.
- Updated the PWA cache/version, catalog description, copy audit, README, visual provenance record, and build ID (`polish-3`).

## How verified

- Fresh clone `/tmp/accessible-table-ocr-check-clean-IKNzOO` at `eea4d4464b803631f520a17eb81a27dbff9cec26`: `npm ci` completed with 0 vulnerabilities; `npm run lint`, `npm run typecheck`, and `npm run build` passed. Build output was `37.71 kB` JS (`13.20 kB` gzip) and `20.50 kB` CSS (`5.16 kB` gzip).
- The fresh clone’s `npm test` passed: 16 Vitest unit/API tests and 72 Playwright browser tests across desktop and 390×844 mobile.
- All 38 exact claim commands from `.factory/claims.json` were then executed independently from that clean clone and passed, including `paid-purchase-terms` and `generated-art-provenance`.
- Local regression also passed: `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- After deployment, `npm run test:e2e:live` passed all 72 browser tests against the cold production URL.
- `/opt/fleet/lib/verify-url.sh` passed on the live root: title present, `lang=en`, one h1, main landmark, no missing image alt text, and no console errors. Evidence: [`evidence/polish-3-live/root/verify.json`](evidence/polish-3-live/root/verify.json).
- The standalone Axe CLI was attempted but cannot find a Chrome binary in this worker. The equivalent project Playwright Axe integration ran in the installed browser and found zero serious/critical issues on `/`, `/demo`, `/privacy/`, `/terms/`, and a real 404. Evidence: [`evidence/polish-3-live/live-a11y.json`](evidence/polish-3-live/live-a11y.json).
- The live unknown route returned HTTP 404 with the designed recovery page. Direct Demo, Privacy, and Terms each returned 200 with route titles and one h1.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 931 ms, LCP 1072 ms, CLS 0, and TBT 97 ms. Evidence: [`evidence/polish-3-live/lighthouse-mobile.json`](evidence/polish-3-live/lighthouse-mobile.json).

## Evidence and operations

- [Polish mapping](polish-3.md)
- [Live root screenshots and basic verification](evidence/polish-3-live/root/)
- [Live mobile root](evidence/polish-3-live/root-mobile.png), [demo](evidence/polish-3-live/demo-mobile.png), [Privacy](evidence/polish-3-live/privacy-mobile.png), [Terms](evidence/polish-3-live/terms-mobile.png), and [404](evidence/polish-3-live/definitely-not-a-real-route-qa-mobile.png)
- Run locally: `npm ci && npm test && npm run lint && npm run typecheck && npm run build`.
- Deploy: `/opt/fleet/lib/deploy-static.sh accessible-table-ocr-check dist` after `npm run build`.

## Known gaps

None. The product has no unaddressed review finding. The standalone Axe CLI limitation is an environment browser-discovery issue, not an app issue; the same Axe engine passed in the installed Playwright browser on every required live route.
