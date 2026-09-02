# Perfection-loop polish 3 — PASS

- Work order: `accessible-table-ocr-check-polish-3`
- Repair commit deployed: `eea4d4464b803631f520a17eb81a27dbff9cec26`
- Base review: `ae4f748e928d2b094c26e9e5b3374b38af37100d`
- Live: <https://accessible-table-ocr-check.sociobot.in>
- Evidence: [`evidence/polish-3-live/`](evidence/polish-3-live/)

I read every `review-*.md` and `polish-*.md`. The table maps each finding ID to its current repair or regression check. Earlier functional repairs remain in place; this round adds the independent checkout fixture, plain payment/storage wording, and the provenance record/test that review 3 required.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Direct `/demo` and `?demo=1` use the separate `demo:table-proofing-desk` database; reset and exit discard only demo data. | `@claim:demo-ready`, `@claim:demo-isolation`; [live demo](https://accessible-table-ocr-check.sociobot.in/demo); `evidence/polish-3-live/demo-mobile.png` |
| F-1-2 | Retained the machine-readable 38-claim register and one unique tag for every claim. | Clean-clone independent run of all 38 manifest commands |
| F-1-3 | Retained scoped semantic HTML export after fixing the sample order. | `@claim:proof-and-export` |
| F-1-4 | Retained browser-only core flow. | `@claim:browser-local` |
| F-1-5 | Retained request logging that proves document markers do not leave the app. | `@claim:no-document-upload` |
| F-1-6 | Retained dedicated-context offline reload, edit, and export coverage. | `@claim:offline-reload` |
| F-1-7 | Retained both image-first and JSON-first paths. | `@claim:either-import-order` |
| F-1-8 | Retained documented cells/blocks OCR schema support. | `@claim:ocr-schema` |
| F-1-9 | Retained numbered source overlays and seeded jump detection. | `@claim:reading-order-overlays` |
| F-1-10 | Retained text, grid, and header-role correction. | `@claim:cell-corrections` |
| F-1-11 | Retained content validation for HTML, CSV, JSON, and issue-report downloads. | `@claim:all-exports` |
| F-1-12 | Replaced circular pricing proof with a recorded public hosted-checkout contract. | `@claim:paid-purchase-terms`; `tests/fixtures/billing-checkout-contract.json` |
| F-1-13 | Retained all core exports without a license. | `@claim:free-core` |
| F-1-14 | Retained named saved-version save/edit/restore with recorded valid entitlement. | `@claim:licensed-saved-versions` |
| F-1-15 | Retained local saved-version boundary. | `@claim:local-saved-versions` |
| F-1-16 | Retained clear unlicensed state. | `@claim:free-state` |
| F-1-17 | Replaced the legal merchant assertion with hosted-checkout facts: Dodo Payments processes checkout and handles order questions and returns. | `@claim:paid-purchase-terms`; [live terms](https://accessible-table-ocr-check.sociobot.in/terms/) |
| F-1-18 | Retained local-page storage privacy proof. | `@claim:pages-stay-local` |
| F-1-19 | Retained short, plain README audience and job statements. | `.factory/copy-audit.md` |
| F-1-20 | Retained separately testable README capabilities. | `@claim:reading-order-overlays`, `@claim:cell-corrections`, `@claim:issue-detection`, `@claim:all-exports` |
| F-1-21 | Retained the clear human-check limitation. | `@claim:human-check-only` |
| F-1-22 | Retained separate privacy and no-OCR claims. | `@claim:no-document-upload`, `@claim:human-check-only` |
| F-1-23 | Retained the direct one-click sample URL and isolated sample. | `@claim:demo-ready`; `.factory/demo.md` |
| F-1-24 | Retained all four page-image formats. | `@claim:import-formats` |
| F-1-25 | Retained all documented top-level and page-nested JSON shapes. | `@claim:json-shapes` |
| F-1-26 | Retained normalization of aliased OCR fields. | `@claim:field-normalization` |
| F-1-27 | Retained percentage, normalized, and pixel bounding boxes. | `@claim:bbox-formats` |
| F-1-28 | Retained the 500-cell / 99×99 limit. | `@claim:import-limits` |
| F-1-29 | Retained pre-write rejection and bounded legacy recovery. | `@claim:rejection-before-write`, `@claim:legacy-recovery` |
| F-1-30 | Retained project JSON round trip. | `@claim:project-round-trip` |
| F-1-31 | Retained storage-boundary inspection. | `@claim:indexeddb-only` |
| F-1-32 | Retained confirmed clear of real working data. | `@claim:clear-table-check` |
| F-1-33 | Retained inline-shell and offline navigation checks. | `@claim:inline-offline-shell`, `@claim:offline-reload` |
| F-1-34 | Retained no-tracker/no-CDN runtime inspection. | `@claim:no-third-party-runtime` |
| F-1-35 | Kept free exports and saved versions separate from checkout facts; the purchase term now comes from the fixture. | `@claim:free-core`, `@claim:licensed-saved-versions`, `@claim:paid-purchase-terms` |
| F-1-36 | Retained registered checkout and same-origin verification routing. | `@claim:sociobot-billing-path` |
| F-1-37 | Retained marker-free license request and atomic rate-limit coverage. | `@claim:no-document-upload`, `@claim:license-rate-limit` |
| F-1-38 | Replaced the old merchant sentence everywhere with the plain, fixture-backed checkout wording. | `@claim:paid-purchase-terms` |
| F-1-39 | Retained physical 404 document and 404 response override. | [live 404](https://accessible-table-ocr-check.sociobot.in/definitely-not-a-real-route-qa); `live-a11y.json` |
| F-1-40 | Retained direct routes, History API, heading focus, and polite announcements. | Live `test:e2e:live`; `sets route metadata, supports history focus, and renders a styled 404` |
| F-1-41 | Retained canonical, route metadata, original social art, and touch icon. | Live `test:e2e:live`; [root verification](evidence/polish-3-live/root/verify.json) |
| F-1-42 | Retained distinct, short root/demo/legal/404 titles. | `live-a11y.json` |
| F-1-43 | Retained `robots.txt` and route sitemap. | Live routing test |
| F-1-44 | Retained shared header, footer, Param Factory credit, and build ID. | Live `keeps the required header and footer skeleton on every route` |
| F-1-45 | Retained visible non-goals before pricing. | `@claim:human-check-only`; `root-mobile.png` |
| F-1-46 | Retained short README opening. | `.factory/copy-audit.md` |
| F-1-47 | Retained split capability statements. | `.factory/copy-audit.md` |
| F-1-48 | Retained split rejection/recovery wording. | `.factory/copy-audit.md` |
| F-1-49 | Retained removal of QA jargon. | `.factory/copy-audit.md` |
| F-1-50 | Retained “table check” for the task and record. | `.factory/copy-audit.md` terminology table |
| F-1-51 | Retained “Trace the reading order.” | `root-mobile.png` |
| F-1-52 | Retained “Label cells and headers.” | `root-mobile.png` |
| F-1-53 | Retained “Export the checked table.” | `root-mobile.png` |
| F-1-54 | Retained “saved versions” throughout. | `@claim:licensed-saved-versions`; copy audit |
| F-1-55 | Retained “Try it with sample data” and the immediate two-error outcome. | `root-mobile.png`; `@claim:demo-ready` |
| F-1-56 | Retained route-named legal-page headings. | [live privacy](https://accessible-table-ocr-check.sociobot.in/privacy/); [live terms](https://accessible-table-ocr-check.sociobot.in/terms/) |
| F-1-57 | Retained explicit external-site label on the GitHub link. | Live header/footer test |
| F-2-1 | Retained the compact demo result and **Move Yes later** above the 390×844 fold. | `fits the core workflow on a 390px viewport`; `demo-mobile.png` |
| F-2-2 | Replaced UI-copy price proof with fixture fields from the public hosted checkout: USD 1200 minor units and `one_time`. | `@claim:paid-purchase-terms`; `tests/fixtures/billing-checkout-contract.json` |
| F-2-3 | Removed “merchant of record”; wording is now direct and checked against the hosted checkout’s business, processor, and order-help fields. | `@claim:paid-purchase-terms` |
| F-2-4 | Retained the unique document marker during a recorded license check. | `@claim:no-document-upload` |
| F-2-5 | Retained once-per-day token verification behavior, while visitor wording now says “browser storage.” | `@claim:license-token-cadence`; [live privacy](https://accessible-table-ocr-check.sociobot.in/privacy/) |
| F-2-6 | Retained removal of unsupported card-data wording. | Privacy copy audit |
| F-2-7 | Narrowed payment language to the hosted checkout’s observed order-question/return disclosure; removed unsupported refund responsibility. | `@claim:paid-purchase-terms` |
| F-2-8 | Retained recorded revoked-entitlement behavior without claiming an unobservable refund cause. | `@claim:revoked-license` |
| F-2-9 | Retained tagged unavailable-limiter failure behavior. | `@claim:license-fails-closed` |
| F-2-10 | Retained direct demo/privacy/terms/404 build documents. | `@claim:direct-route-documents` |
| F-2-11 | Retained the free-core fact on the first screen. | `root-mobile.png`; `@claim:free-core` |
| F-2-12 | Retained result-naming action labels. | Live app suite |
| F-2-13 | Replaced visitor-facing `merchant of record` and `localStorage` with “Dodo Payments” and “browser storage.” | `@claim:paid-purchase-terms`; copy audit |
| F-2-14 | Updated the copy audit and retained exact tagged-test wording. | `.factory/copy-audit.md`; clean-clone claim sweep |
| F-3-1 | Added `scripts/refresh-billing-fixture.mjs` and a checked-in read-only checkout fixture; the claim inspects source fields before comparing every product/legal disclosure. | `@claim:paid-purchase-terms`; fixture capture 2026-09-02 UTC |
| F-3-2 | Rewrote payment/storage sentences in landing, Privacy, Terms, and README with no legal/browser jargon. | `@claim:paid-purchase-terms`; [live root](https://accessible-table-ocr-check.sociobot.in/); [live privacy](https://accessible-table-ocr-check.sociobot.in/privacy/) |
| F-3-3 | Registered `generated-art-provenance`, added a public SHA-256 provenance record, and checks shipped hero, mobile, and social-art bytes plus the footer sentence. | `@claim:generated-art-provenance`; `public/assets/proofing-table.provenance.json` |

## Close-out evidence

- Fresh clean clone at `eea4d4464b803631f520a17eb81a27dbff9cec26`: `npm ci`, lint, typecheck, build, and the full 16-unit / 72-browser suite passed. Every one of the 38 exact commands in `.factory/claims.json` then passed independently.
- Deployed root verification reports no console errors, one title, `lang=en`, one h1, main landmark, and no image missing `alt`: [`root/verify.json`](evidence/polish-3-live/root/verify.json).
- Live Playwright Axe found zero serious/critical violations on root, demo, privacy, terms, and the real 404; see [`live-a11y.json`](evidence/polish-3-live/live-a11y.json).
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 931 ms, LCP 1072 ms, CLS 0, TBT 97 ms; see [`lighthouse-mobile.json`](evidence/polish-3-live/lighthouse-mobile.json).
