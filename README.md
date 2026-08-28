# Accessible Table OCR Check

A local-first proofing desk for readers, librarians, and accessibility practitioners who need to check whether OCR preserved a scanned table’s reading order and cell structure. It compares a source image with numbered OCR blocks, flags likely structural defects, supports cell/header correction, and exports semantic HTML, CSV, project JSON, and a plain-text issue report.

This is a human QA layer, not an OCR engine. It does not upload documents or promise automatic reconstruction. Reviewers remain responsible for comparing text with the source and for having permission to process copyrighted material.

Live product: <https://accessible-table-ocr-check.sociobot.in>

## Run locally

Requires Node.js 20 or later.

```sh
npm install
npm run dev
```

Open the printed local URL. Use **Open a scrambled sample** for a guided first proof.

## Import format

Import a PNG/JPEG/WebP/SVG page image and OCR JSON in either order. JSON may use a top-level `cells` or `blocks` array (or the same array under the first item in `pages`). Common `text`, `row`, `column`, `role`, `readingOrder`, and `bbox` fields are normalized. Bounding boxes may be percentages, normalized 0–1 values, or pixels when page `width` and `height` are supplied.

Each proof is limited to 500 cells on a 99 × 99 grid. Imports outside those limits are rejected before local storage or rendering; older saved proofs with unsafe coordinates are recovered into the supported range with a visible review notice.

```json
{
  "sourcePage": "Collection A, page 42",
  "width": 2000,
  "height": 3000,
  "cells": [
    {
      "id": "cell-1",
      "text": "Route",
      "row": 1,
      "column": 1,
      "role": "columnheader",
      "readingOrder": 1,
      "bbox": [120, 240, 600, 420]
    }
  ]
}
```

The Project JSON export can be re-imported as OCR JSON. Working data and optional named checkpoints are stored only in IndexedDB. Clearing the proof removes its working copy.

## Test and build

Playwright 1.58.2 is pinned to match the factory browser image.

```sh
npm test          # unit + desktop/mobile/offline/axe browser tests
npm run lint      # ESLint across app, tests, worker, and API gateway
npm run typecheck # TypeScript validation
npm run build     # production output in ./dist
npm run preview   # inspect the production build
```

The static deployment root is exactly `dist/`, with `index.html` at its root and direct entry documents for `/privacy/` and `/terms/`. The post-build step inlines the small app bundle into the shell so a hard offline navigation never depends on a second request.

## Privacy and paid unlock

There are no analytics, trackers, CDN fonts, or third-party runtime scripts. The optional one-time $19 Desk license adds named local checkpoints only; core checking and all accessible exports are free. Purchase and verification use the Sociobot billing API. Verification passes through the deployment’s same-origin, rate-limited gateway so bursts receive `429` and `Retry-After`; no document content enters that path. Sociobot/Dodo is the merchant of record.

See [Privacy](https://accessible-table-ocr-check.sociobot.in/privacy/) and [Terms](https://accessible-table-ocr-check.sociobot.in/terms/).

## Project notes

- Visual system and generated-art provenance: [`.factory/design.md`](.factory/design.md)
- Build verification and known gaps: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
