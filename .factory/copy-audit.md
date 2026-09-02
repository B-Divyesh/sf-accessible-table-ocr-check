# Plain-words copy audit

Audited 2 September 2026. Counts use whitespace-delimited visible words. Every landing-page unit is at most 18 words; the headline is six words. No banned marketing word appears in the landing page, README, or catalog description. The README has 66 prose units and a maximum of 22 words.

| # | Words | Landing-page copy | Result |
|---:|---:|---|---|
| 1 | 4 | Skip to main content | Pass |
| 2 | 3 | Table proofing desk | Pass |
| 3 | 1 | Demo | Pass |
| 4 | 3 | How it works | Pass |
| 5 | 1 | Privacy | Pass |
| 6 | 2 | Desk license | Pass |
| 7 | 3 | Local by default | Pass |
| 8 | 4 | For scanned-table accessibility checks | Pass |
| 9 | 6 | Fix a scanned table’s reading order. | Pass |
| 10 | 18 | For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users. | Pass |
| 11 | 5 | Try it with sample data | Pass |
| 12 | 3 | Import your page | Pass |
| 13 | 9 | Opens a scanned transit table with two reading-order errors. | Pass |
| 14 | 3 | No document upload | Pass |
| 15 | 5 | Works offline after first visit | Pass |
| 16 | 6 | Core checking and exports are free | Pass |
| 17 | 8 | Source page → reading order → semantic table | Pass |
| 18 | 4 | Start a table check | Pass |
| 19 | 7 | Add the page and its OCR cells. | Pass |
| 20 | 4 | Use either input first. | Pass |
| 21 | 18 | OCR JSON should contain a cells or blocks array with text, row, column, and an optional bounding box. | Pass |
| 22 | 3 | Add source image | Pass |
| 23 | 8 | PNG, JPEG, WebP, or SVG · stays local | Pass |
| 24 | 3 | Add OCR JSON | Pass |
| 25 | 5 | Cells, blocks, coordinates, and order | Pass |
| 26 | 3 | The three-pass check | Pass |
| 27 | 5 | Check structure, not just spelling. | Pass |
| 28 | 4 | Trace the reading order | Pass |
| 29 | 12 | Follow numbered overlays on the source and spot jumps in reading order. | Pass |
| 30 | 4 | Label cells and headers | Pass |
| 31 | 10 | Correct text, grid positions, and row or column header roles. | Pass |
| 32 | 4 | Export the checked table | Pass |
| 33 | 10 | Export semantic HTML, CSV, JSON, and a plain-language issue report. | Pass |
| 34 | 4 | Limits of this check | Pass |
| 35 | 5 | What this check cannot confirm | Pass |
| 36 | 9 | This tool does not create OCR or check spelling. | Pass |
| 37 | 9 | It flags likely structure errors but cannot guarantee accessibility. | Pass |
| 38 | 8 | Compare every value with the scan before sharing. | Pass |
| 39 | 3 | Optional Desk license | Pass |
| 40 | 3 | Keep saved versions. | Pass |
| 41 | 8 | Core checking and every accessible export stay free. | Pass |
| 42 | 11 | A Desk license adds named saved versions for comparing OCR passes. | Pass |
| 43 | 4 | Save named before-and-after versions | Pass |
| 44 | 5 | Restore a prior cell structure | Pass |
| 45 | 6 | Saved versions stay in this browser | Pass |
| 46 | 5 | Free table checking is active | Pass |
| 47 | 3 | US$12 one-time purchase. | Pass |
| 48 | 13 | Sociobot, through Dodo, is the merchant of record and handles payment and refunds. | Pass |
| 49 | 8 | An approved refund revokes the Desk license automatically. | Pass |
| 50 | 3 | Get Desk license | Pass |
| 51 | 3 | Restore Desk license | Pass |
| 52 | 5 | Read the Desk license terms | Pass |
| 53 | 4 | Accessible Table OCR Check | Pass |
| 54 | 6 | Your pages stay in this browser. | Pass |
| 55 | 1 | Terms | Pass |
| 56 | 6 | Source on GitHub (opens external site) | Pass |
| 57 | 4 | Built by Param Factory | Pass |
| 58 | 2 | Build repair-7 | Pass |
| 59 | 8 | The proofing-desk artwork was generated for this product. | Pass |

## README

The following extraction includes every prose unit outside commands and JSON. All pass the 22-word cap.

| # | Words | README copy | Result |
|---:|---:|---|---|
| 1 | 4 | Accessible Table OCR Check | Pass |
| 2 | 11 | Check whether OCR preserved a scanned table’s reading order and cells. | Pass |
| 3 | 10 | This browser tool is for readers, librarians, and accessibility reviewers. | Pass |
| 4 | 11 | Compare the scan with numbered OCR cells and fix structure errors. | Pass |
| 5 | 10 | Export accessible HTML, CSV, project JSON, or a text report. | Pass |
| 6 | 7 | This tool helps a person check OCR. | Pass |
| 7 | 12 | It does not create OCR or guarantee that a table is accessible. | Pass |
| 8 | 4 | Documents are not uploaded. | Pass |
| 9 | 14 | Reviewers must compare text with the source and have permission to process copyrighted material. | Pass |
| 10 | 3 | Live product URL | Pass |
| 11 | 3 | One-click sample URL | Pass |
| 12 | 2 | Run locally | Pass |
| 13 | 5 | Use Node.js 20 or later. | Pass |
| 14 | 5 | Open the printed local URL. | Pass |
| 15 | 12 | Choose Try it with sample data to open an isolated transit-table check. | Pass |
| 16 | 9 | The demo uses a separate IndexedDB database named demo:table-proofing-desk. | Pass |
| 17 | 8 | Resetting or leaving it deletes that demo record. | Pass |
| 18 | 2 | Import format | Pass |
| 19 | 9 | Import a PNG, JPEG, WebP, or SVG page image. | Pass |
| 20 | 8 | Add OCR JSON before or after the image. | Pass |
| 21 | 9 | JSON can use a top-level cells or blocks array. | Pass |
| 22 | 11 | It can also use either array inside the first pages item. | Pass |
| 23 | 11 | The importer normalizes text, row, column, role, readingOrder, and bbox fields. | Pass |
| 24 | 9 | Bounding boxes can use percentages or normalized 0–1 values. | Pass |
| 25 | 10 | Pixel values work when page width and height are supplied. | Pass |
| 26 | 12 | Each table check supports 500 cells on a 99 × 99 grid. | Pass |
| 27 | 10 | The app rejects larger imports before saving or rendering them. | Pass |
| 28 | 12 | It safely bounds older saved coordinates and asks you to review them. | Pass |
| 29 | 10 | Project JSON exports can be imported again as OCR JSON. | Pass |
| 30 | 8 | Working data and optional saved versions use IndexedDB. | Pass |
| 31 | 8 | Clearing a table check removes its working copy. | Pass |
| 32 | 3 | Test and build | Pass |
| 33 | 7 | Playwright 1.58.2 matches the factory browser image. | Pass |
| 34 | 10 | The deployment root is dist/, with index.html at its root. | Pass |
| 35 | 11 | It includes direct documents for Demo, Privacy, Terms, and 404 responses. | Pass |
| 36 | 10 | The build inlines the small app bundle into the page. | Pass |
| 37 | 15 | After one connected visit, the browser can open the table checker without a network connection. | Pass |
| 38 | 15 | Production uses the factory static deployment command, which uploads dist/ and managed api/ functions. | Pass |
| 39 | 22 | npm run build installs the API’s locked runtime packages before producing dist/, so the managed function is complete in a clean deployment. | Pass |
| 40 | 14 | The license gateway requires product-owned shared-counter app settings. | Pass |
| 41 | 9 | It returns 503 if that shared counter is unavailable. | Pass |
| 42 | 8 | Every public product claim is listed in claims.json. | Pass |
| 43 | 7 | Each entry names its exact tagged test. | Pass |
| 44 | 4 | Privacy and paid features | Pass |
| 45 | 12 | The app has no analytics, trackers, CDN fonts, or third-party runtime scripts. | Pass |
| 46 | 14 | An optional Desk license adds named saved versions stored in IndexedDB on that device. | Pass |
| 47 | 8 | Core checking and every accessible export remain free. | Pass |
| 48 | 9 | License controls use the registered checkout and verification paths. | Pass |
| 49 | 8 | The Desk license is a US$12 one-time purchase. | Pass |
| 50 | 8 | Sociobot, through Dodo, is the merchant of record. | Pass |
| 51 | 5 | Sociobot/Dodo handles payment and refunds. | Pass |
| 52 | 8 | An approved refund revokes the Desk license automatically. | Pass |
| 53 | 7 | License checks go through this app’s server. | Pass |
| 54 | 12 | A shared counter allows 20 checks per client in each 60-second window. | Pass |
| 55 | 7 | Every later request receives 429 with Retry-After. | Pass |
| 56 | 7 | No document content enters a license request. | Pass |
| 57 | 14 | License tokens stay in localStorage and are checked no more than once each day. | Pass |
| 58 | 11 | Run the concurrent live limit test after deployment from a fresh 60-second window. | Pass |
| 59 | 21 | It starts 25 requests together and requires requests 1–20 to pass and requests 21–25 to return 429 with a positive Retry-After. | Pass |
| 60 | 16 | Run the sequential live limit test after the next fresh window to check the same boundary. | Pass |
| 61 | 4 | See Privacy and Terms. | Pass |
| 62 | 2 | Project notes | Pass |
| 63 | 5 | Visual system and generated-art provenance | Pass |
| 64 | 3 | Demo sandbox contract | Pass |
| 65 | 5 | Build verification and known gaps | Pass |
| 66 | 2 | MIT License | Pass |

## Terminology

| Concept | One term used in product copy |
|---|---|
| The review task and its working record | table check |
| OCR items mapped into a table | cells |
| Paid before-and-after records | saved versions |
| Disposable sample workspace | demo |
| Original scanned input | source image |
| Machine-readable extraction input | OCR JSON |

“Proofing desk” remains only in the visual wordmark and artwork provenance. User actions and saved work consistently use “table check.”
