# Accessible Table OCR Check

Check whether OCR preserved a scanned table’s reading order and cells. This browser tool is for readers, librarians, and accessibility reviewers.

Compare the scan with numbered OCR cells and fix structure errors. Export accessible HTML, CSV, project JSON, or a text report.

This tool helps a person check OCR. It does not create OCR or guarantee that a table is accessible.

Documents are not uploaded. Reviewers must compare text with the source and have permission to process copyrighted material.

Live product: <https://accessible-table-ocr-check.sociobot.in>

One-click sample: <https://accessible-table-ocr-check.sociobot.in/demo>

## Run locally

Use Node.js 20 or later.

```sh
npm ci
npm run dev
```

Open the printed local URL. Choose **Try it with sample data** to open an isolated transit-table check.

The demo uses a separate IndexedDB database named `demo:table-proofing-desk`. Resetting or leaving it deletes that demo record.

## Import format

Import a PNG, JPEG, WebP, or SVG page image. Add OCR JSON before or after the image.

JSON can use a top-level `cells` or `blocks` array. It can also use either array inside the first `pages` item.

The importer normalizes `text`, `row`, `column`, `role`, `readingOrder`, and `bbox` fields.

Bounding boxes can use percentages or normalized 0–1 values. Pixel values work when page `width` and `height` are supplied.

Each table check supports 500 cells on a 99 × 99 grid. The app rejects larger imports before saving or rendering them.

It safely bounds older saved coordinates and asks you to review them. Project JSON exports can be imported again as OCR JSON.

Working data and optional saved versions use IndexedDB. Clearing a table check removes its working copy.

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

## Test and build

Playwright 1.58.2 matches the factory browser image.

```sh
npm test          # unit, claim, desktop, mobile, offline, and axe tests
npm run lint      # ESLint across the app, tests, worker, and API gateway
npm run typecheck # TypeScript validation
npm run build     # production output in ./dist
npm run preview   # inspect the production build
```

The deployment root is `dist/`, with `index.html` at its root. It includes direct documents for Demo, Privacy, Terms, and 404 responses.

The build inlines the small app bundle into the page. A primed browser can open the table checker without a network connection.

Production uses the factory’s static deployment command, which uploads `dist/` and the managed `api/` functions:

```sh
/opt/fleet/lib/deploy-static.sh accessible-table-ocr-check dist
```

The license gateway requires `RATE_LIMIT_REDIS_HOST` and `RATE_LIMIT_REDIS_KEY` app settings from the product-owned `sf-accessible-table-ocr-check-rate-limit` cache. It returns `503` if that shared counter is unavailable.

Every public product claim is listed in [`.factory/claims.json`](.factory/claims.json). Each entry names its exact tagged browser test.

## Privacy and paid features

The app has no analytics, trackers, CDN fonts, or third-party runtime scripts.

The optional Desk license costs $19 once. It adds named saved versions stored in IndexedDB on that device.

Core checking and every accessible export remain free. Purchase and verification use the Sociobot billing API.

Verification uses the deployment’s same-origin gateway. One atomic product counter applies the 20-request allowance across function instances. Every request beyond 20 receives `429` with `Retry-After`.

No document content enters the license request. Sociobot/Dodo is the merchant of record.

Run `npm run test:live-rate-limit` after deployment from a fresh 60-second window. It starts 25 requests together and requires atomic counts 1–20 to pass and counts 21–25 to return `429` with a positive `Retry-After`. Run `npm run test:live-rate-limit:sequential` after the next fresh window to check the same boundary in sequence.

See [Privacy](https://accessible-table-ocr-check.sociobot.in/privacy/) and [Terms](https://accessible-table-ocr-check.sociobot.in/terms/).

## Project notes

- [Visual system and generated-art provenance](.factory/design.md)
- [Demo sandbox contract](.factory/demo.md)
- [Build verification and known gaps](.factory/handoff.md)
- [MIT License](LICENSE)
