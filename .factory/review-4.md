# Adversarial first-read review 4 — PASS

- Product: Accessible Table OCR Check
- Candidate: `48e38f8d50e6f4472fc838198c15d1d2cb228b97`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Review date: 2026-09-02 UTC
- Contexts: fresh Chromium at 390 × 844 and 1440 × 900; fresh clean clone

## Verdict

**PASS.** There are zero findings. The first screen explains the job, names its users, and gives a result-naming first action. The direct sample is a real, isolated workspace rather than a marketing mock-up. All registered claims passed from a clean clone, and no unlisted live claim, routing defect, dead link, or accessibility regression was found.

## Cold first read

Before scrolling, at both tested sizes, this is what a first-time visitor can determine:

| Question | Answer from the first screen | Exact supporting copy |
|---|---|---|
| What does this do? | It fixes the reading order of a scanned table so the checked table can be exported accessibly. | “Fix a scanned table’s reading order.” |
| Who is it for? | Librarians and accessibility reviewers comparing OCR against a scan before sharing it with screen-reader users. | “For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users.” |
| What should I click first? | **Try it with sample data**. | “Opens a scanned transit table with two reading-order errors.” |

The 390 px page keeps the headline, audience, primary sample action, outcome, and three concrete facts visible without scrolling. The desktop page provides the same information without competing calls to action. The visual language is a distinct risograph proofing desk, not a generic SaaS surface.

## Copy audit

Counts use whitespace-delimited visible words. Labels and headings are included so the audit is stricter than a sentence-only pass. No unit exceeds 22 words. No banned marketing adjective, unexplained metaphor, meaningless slogan, inconsistent task term, or non-result-naming action was found. “Table check,” “cells,” “saved versions,” “demo,” “source image,” and “OCR JSON” are used consistently.

### Landing page

| Words | Copy |
|---:|---|
| 4 | For scanned-table accessibility checks |
| 6 | Fix a scanned table’s reading order. |
| 18 | For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users. |
| 5 | Try it with sample data |
| 3 | Import your page |
| 9 | Opens a scanned transit table with two reading-order errors. |
| 3 | No document upload |
| 5 | Works offline after first visit |
| 6 | Core checking and exports are free |
| 8 | Source page → reading order → semantic table |
| 4 | Start a table check |
| 7 | Add the page and its OCR cells. |
| 4 | Use either input first. |
| 18 | OCR JSON should contain a cells or blocks array with text, row, column, and an optional bounding box. |
| 3 | Add source image |
| 8 | PNG, JPEG, WebP, or SVG · stays local |
| 3 | Add OCR JSON |
| 5 | Cells, blocks, coordinates, and order |
| 3 | The three-pass check |
| 5 | Check structure, not just spelling. |
| 4 | Trace the reading order |
| 12 | Follow numbered overlays on the source and spot jumps in reading order. |
| 4 | Label cells and headers |
| 10 | Correct text, grid positions, and row or column header roles. |
| 4 | Export the checked table |
| 10 | Export semantic HTML, CSV, JSON, and a plain-language issue report. |
| 4 | Limits of this check |
| 5 | What this check cannot confirm |
| 9 | This tool does not create OCR or check spelling. |
| 9 | It flags likely structure errors but cannot guarantee accessibility. |
| 8 | Compare every value with the scan before sharing. |
| 3 | Optional Desk license |
| 3 | Keep saved versions. |
| 8 | Core checking and every accessible export stay free. |
| 11 | A Desk license adds named saved versions for comparing OCR passes. |
| 4 | Save named before-and-after versions |
| 5 | Restore a prior cell structure |
| 6 | Saved versions stay in this browser |
| 5 | Free table checking is active |
| 3 | US$12 one-time purchase. |
| 12 | Checkout is processed by Dodo Payments, with Sociobot shown as the business. |
| 7 | Dodo Payments handles order questions and returns. |
| 3 | Get Desk license |
| 3 | Restore Desk license |
| 5 | Read the Desk license terms |
| 6 | Your pages stay in this browser. |
| 4 | Built by Param Factory |
| 2 | Build polish-3 |
| 8 | The proofing-desk artwork was generated for this product. |

Navigation and footer labels were also checked: “Skip to main content” (4), “Table proofing desk” (3), “Demo” (1), “How it works” (3), “Privacy” (1), “Desk license” (2), “Local by default” (3), “Terms” (1), and “Source on GitHub (opens external site)” (6). They are clear labels, not claims or slogans.

### README

| Words | Copy |
|---:|---|
| 11 | Check whether OCR preserved a scanned table’s reading order and cells. |
| 10 | This browser tool is for readers, librarians, and accessibility reviewers. |
| 11 | Compare the scan with numbered OCR cells and fix structure errors. |
| 10 | Export accessible HTML, CSV, project JSON, or a text report. |
| 7 | This tool helps a person check OCR. |
| 12 | It does not create OCR or guarantee that a table is accessible. |
| 4 | Documents are not uploaded. |
| 14 | Reviewers must compare text with the source and have permission to process copyrighted material. |
| 5 | Use Node.js 20 or later. |
| 5 | Open the printed local URL. |
| 12 | Choose Try it with sample data to open an isolated transit-table check. |
| 8 | The demo uses separate browser storage named demo:table-proofing-desk. |
| 8 | Resetting or leaving it deletes that demo record. |
| 9 | Import a PNG, JPEG, WebP, or SVG page image. |
| 8 | Add OCR JSON before or after the image. |
| 9 | JSON can use a top-level cells or blocks array. |
| 11 | It can also use either array inside the first pages item. |
| 11 | The importer normalizes text, row, column, role, readingOrder, and bbox fields. |
| 9 | Bounding boxes can use percentages or normalized 0–1 values. |
| 10 | Pixel values work when page width and height are supplied. |
| 12 | Each table check supports 500 cells on a 99 × 99 grid. |
| 10 | The app rejects larger imports before saving or rendering them. |
| 12 | It safely bounds older saved coordinates and asks you to review them. |
| 10 | Project JSON exports can be imported again as OCR JSON. |
| 9 | Working data and optional saved versions use browser storage. |
| 8 | Clearing a table check removes its working copy. |
| 7 | Playwright 1.58.2 matches the factory browser image. |
| 10 | The deployment root is dist/, with index.html at its root. |
| 11 | It includes direct documents for Demo, Privacy, Terms, and 404 responses. |
| 10 | The build inlines the small app bundle into the page. |
| 15 | After one connected visit, the browser can open the table checker without a network connection. |
| 15 | Production uses the factory static deployment command, which uploads dist/ and managed api/ functions. |
| 22 | npm run build installs the API’s locked runtime packages before producing dist/, so the managed function is complete in a clean deployment. |
| 14 | The license gateway requires product-owned shared-counter app settings. |
| 9 | It returns 503 if that shared counter is unavailable. |
| 8 | Every public product claim is listed in claims.json. |
| 7 | Each entry names its exact tagged test. |
| 12 | The app has no analytics, trackers, CDN fonts, or third-party runtime scripts. |
| 15 | An optional Desk license adds named saved versions kept in browser storage on that device. |
| 8 | Core checking and every accessible export remain free. |
| 9 | License controls use the registered checkout and verification paths. |
| 8 | The Desk license is a US$12 one-time purchase. |
| 12 | Checkout is processed by Dodo Payments, with Sociobot shown as the business. |
| 7 | Dodo Payments handles order questions and returns. |
| 18 | If a license is no longer active, saved versions are unavailable while free checking and exports remain available. |
| 7 | License checks go through this app’s server. |
| 12 | A shared counter allows 20 checks per client in each 60-second window. |
| 7 | Every later request receives 429 with Retry-After. |
| 7 | No document content enters a license request. |
| 13 | License tokens stay in browser storage and are checked no more than once each day. |
| 11 | Run the concurrent live limit test after deployment from a fresh 60-second window. |
| 21 | It starts 25 requests together and requires requests 1–20 to pass and requests 21–25 to return 429 with a positive Retry-After. |
| 16 | Run the sequential live limit test after the next fresh window to check the same boundary. |
| 4 | See Privacy and Terms. |

Section headings, link labels, JSON example, and shell commands are not prose sentences. They were checked separately; they are descriptive and do not introduce an unlisted product claim.

## Demo and privacy sandbox

- `/demo` opened directly in one step with a realistic transit-access survey, nine editable cells, numbered source overlays, two seeded reading-order errors, a semantic preview, and four exports.
- At 390 px, the persistent banner read “Demo — sample data, nothing is saved,” with functional **Reset demo** and **Start for real** controls. The sample result and **Move Yes later** corrective action were above the fold.
- The source uses `demo:table-proofing-desk` for demo data and `table-proofing-desk` for real data. The clean-clone isolation test seeded real data, exercised/reset/exited the demo, and compared the real record byte-for-byte.
- A fresh live demo request log contained only the same-origin document and `/sample-table.svg`; no console errors occurred. The claim tests further exercised edit/export/offline flows and recorded no document content or third-party runtime request.

## Claims and quality gates

`.factory/claims.json` contains 38 entries. Each named exact `@claim:` command was executed independently in a fresh clone after `npm ci`; all 38 passed. This includes separate tests for demo readiness/isolation, offline reload in its own context, local storage, request logging, imports, correction/export, price/checkout fixture, limits, direct route documents, and generated-art provenance.

The aggregate gates also passed in that clean clone:

- `npm test` — 16 unit/API and 72 browser tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed and produced `dist/` (37.71 kB uncompressed app JS; 13.20 kB gzip).
- `npm run test:e2e:live` — passed against production.

Every live claim-like sentence was mapped to an entry in `claims.json`; no unlisted claim was found. No claim test failed or remained untested.

## Structure, routes, and links

Fresh live checks confirmed:

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200. An arbitrary unknown route returns a designed 404 and the title “Page not found — Accessible Table OCR Check.”
- Each tested route has `lang=en`, exactly one h1, a main landmark, route-specific title and description, canonical URL, OG image, favicon, and consistent header/footer.
- Root title is “Accessible Table OCR Check — fix reading order”; Demo, Privacy, Terms, and 404 titles follow the required route pattern.
- `robots.txt` and `sitemap.xml` are present and enumerate the public routes.
- All links on the landing page, including the registered checkout redirect and the GitHub source link, resolved successfully. The checkout route returned its expected redirect and a successful destination response.
- Back/forward, direct deep links, h1 focus after client-side navigation, and polite route announcements are covered by the production browser suite.
- Production headers include CSP, `frame-ancestors 'none'`, `X-Content-Type-Options`, and `Referrer-Policy`. There were no console CSP errors.

## Earlier findings regression check

I read every earlier `review-*.md`, `polish-*.md`, and handoff. All earlier findings are actually fixed in both live behavior and current code/tests; none was merely marked fixed.

| Earlier IDs checked | Confirmation |
|---|---|
| F-1-1 | Separate demo IndexedDB namespace, direct demo route, persistent banner, reset/exit behavior, and byte-for-byte real-data isolation all passed. |
| F-1-2 through F-1-38 | The 38-entry manifest is present and its independent tagged commands passed. This reconfirms the original workflow, privacy, offline, import, export, limits, storage, licensing, rate-limit, and claim-registration repairs. |
| F-1-39 through F-1-45 | Live designed 404, direct routes, focus/history, metadata, robots/sitemap, shared skeleton, and limitation section all passed. |
| F-1-46 through F-1-57 | The copy audit above confirms short plain wording, stable terminology, contextual headings, result-naming actions, legal headings, and explicit external-link wording. |
| F-2-1 through F-2-14 | The compact demo result remains above the 390 px fold; payment/privacy language is plain and fixture-backed; the rate-limit, revoked-license, direct-document, and copy-audit repairs passed their registered tests. |
| F-3-1 through F-3-3 | The checked-in checkout fixture test passed; payment and storage wording remains plain; the public art provenance record and SHA-256 claim test passed. |

## Missed leverage and AI check

No missing AI feature was found. The brief calls for a local OCR-structure checking tool, not OCR generation or AI judgment; adding an AI step would undermine the explicit local/offline workflow and the honest limitation that a person must compare the scan. The existing import/export capability covers the obvious adjacent value.

## What would make this perfect

Nothing is currently required. Preserve the separate demo namespace, fixture-backed payment disclosures, and the one-claim/one-test discipline when changing copy or behavior.
