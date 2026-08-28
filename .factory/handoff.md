# Build handoff — Accessible Table OCR Check

## What shipped

- A complete Vite + vanilla TypeScript PWA for human QA of OCR table structure.
- Source image input and flexible OCR JSON import (`cells`, `blocks`, or first-page arrays), with normalized fractional, percentage, and pixel bounding boxes.
- Numbered source overlays linked to keyboard-accessible cell editors for text, row, column, header role, reading-order moves, addition, and confirmed removal.
- Automated checks for scrambled reading order, duplicate grid positions, blank cells, and missing row/column headers. The included sample deliberately swaps two cells; the checker finds both and clears after one explicit move.
- A live semantic table preview plus free HTML, CSV, project JSON, and plain-text issue-report exports. HTML uses `th scope="col"`/`scope="row"`, a caption, and the source-page reference.
- IndexedDB autosave, explicit project JSON ownership, a cache-first app shell, offline status, an offline fallback, install manifest/icons, and update-ready UI. The small app bundle is inlined into the cached navigation shell so a hard offline reload is dependable.
- Optional one-time $19 Desk license using the Sociobot checkout/verify contract. It unlocks only named local checkpoints; no accessibility or export feature is gated. Return tokens, daily verification caching, optimistic offline behavior, revocation handling, and paste-to-restore are implemented.
- Product-specific risograph proofing-desk design, original generated hero art, responsive 390 px layout, reduced-motion support, privacy and terms routes, and expanded documentation.

## Verification completed

- `npm test`: **pass** — 5 Vitest tests; 6 Playwright tests passed and 2 project-inapplicable cases skipped. Coverage includes the import parser, deliberately scrambled order detection, semantic exports, desktop and 390 px mobile correction paths, axe checks on the landing page and workbench, console-error monitoring, direct legal routes, and an offline reload with IndexedDB state retained.
- `npm run build`: **pass** — reproducible static output in `dist/` with `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html`.
- Production bundle: 29.68 KB JS (10.77 KB gzip), 17.43 KB CSS (4.60 KB gzip); inlined shell is 48 KB. No runtime font, script, analytics, or CDN request. Hero WebP is 108 KB.
- Lighthouse 12.8.2 mobile run against the production preview: **Performance 91, Accessibility 100, Best Practices 96, SEO 92**. FCP 0.8 s, LCP 2.1 s, CLS 0, TBT 347 ms. Lab INP was not produced because the audit had no user interaction.
- Axe 4.10: no serious or critical violations on the landing screen or populated review workbench.
- `npm audit`: 0 vulnerabilities.
- Visual inspection completed at 1440 px and 390 px. The generated art was checked for pseudo-text, seams, brands, and misleading capability claims; none were found.

## Run and deploy

```sh
npm install
npm test
npm run build
npm run preview
```

Deploy the contents of `dist/` as the static root. The factory must register `accessible-table-ocr-check` with the Sociobot billing service before checkout/verification can complete in production. No infrastructure, DNS, billing configuration, secrets, or product IDs were added here.

## Known gaps and next steps

- This intentionally does not perform OCR. Users supply OCR JSON, because the product is the verification/correction layer described in the brief.
- V1 reviews one table/page at a time (maximum 500 imported blocks). Complex spanning headers and `rowspan`/`colspan` authoring are not included; those would need a second grid-relationship editor and more assistive-technology testing.
- Overlay accuracy depends on the OCR provider including correct bounding boxes and, for pixel coordinates, page width/height. Missing boxes receive a visible fallback layout so they can still be reviewed.
- Billing verification was exercised at the UI/contract level only; a live successful purchase requires the factory-registered product and test license.
- The 30-page timed success study from the research brief remains a post-launch validation activity; the included deterministic defect fixture verifies detection behavior, not reviewer timing.
