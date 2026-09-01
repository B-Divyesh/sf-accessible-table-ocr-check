# Adversarial first-read review 2 — FAIL

- Product: Accessible Table OCR Check
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Candidate reviewed: `8f5f980f3bf6792cf76f1edf2f9787e6e373ad1b`
- Review date: 1 September 2026 UTC
- Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict

**FAIL.** The landing page is clear, the isolated sample works, all 34 listed claim commands pass, and the built candidate is byte-identical to the live root. The product still has blocking review defects. On a 390 px phone, the first screen after entering the demo does not show the source, cells, issue count, or a correction control. Three listed billing/privacy claims also lack outcome-level tests: the price test reads the page's own price, the merchant test reads the page's own merchant sentence, and the document-privacy test never makes a license request.

There are also unlisted claims on Privacy, Terms, and README; a required first-screen price fact is absent; several controls do not name their result; and the repository's copy audit is stale. Zero findings is required, so passing automation does not change the verdict.

## First screen: cold read before scrolling

### 390 × 844

- What it does: fixes the reading order of OCR cells from a scanned table.
- For whom: librarians and accessibility reviewers checking a scan before sharing a table with screen-reader users.
- What to click first: **Try it with sample data**.

The exact text that answers these questions is “Fix a scanned table’s reading order,” “For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users,” and “Try it with sample data.” All three answers are available before scrolling. This is not a blocking landing-page finding.

### 1440 × 900

The same three answers are immediately available. The sample action is visually primary, the real import action is adjacent, and the original proofing-table artwork explains the source-to-table task.

## Findings

Findings are ordered by severity. Earlier IDs are named where a claimed repair is only partial.

### Blocking

#### F-2-1 — The phone demo's first screen does not show the proofing result

- Exact location: live `/demo` at 390 × 844, immediately after selecting **Try it with sample data**. The viewport contains the site header, demo banner, “Review reading order,” “Transit access survey,” “Community mobility report, p. 42,” and the start of “Compare the page.” The source image, nine cells, “2 reading-order or cell errors,” and every correction control are below the fold.
- Why this fails: the demo is populated, but its first phone screen shows setup metadata rather than the product doing its job. A 30-second visitor cannot yet see the detected problem or an action that fixes it. The demo contract explicitly requires the first screen after one click to show the product being used; a weak demo is blocking.
- Concrete fix: keep the banner, then place a compact result summary directly below it, such as “Transit access survey · 9 cells · 2 order errors,” with the first flagged jump and its **Move Yes later** action visible above the 844 px fold. Move editable name/source metadata below the proofing panels on mobile.

#### F-2-2 — The $19 checkout claim is tested by repeating the UI copy, not by checking the checkout (reopens F-1-12 and part of F-1-35)

- Exact claim: landing and README, “$19 once” / “The optional Desk license costs $19 once.”
- Exact test: `tests/e2e/claims.spec.ts`, “shows the exact one-time price and billing contract.” It asserts the heading contains `$19 once` and that the checkout link has the expected product URL. It never inspects billing metadata or the checkout destination's price and billing frequency.
- Why this fails: changing both the page text and test to the same wrong price would still pass. This does not test the quantitative outcome a buyer relies on. The 303 redirect observed live establishes a checkout route, not its amount or one-time frequency.
- Concrete fix: have the Sociobot product endpoint expose non-mutating product metadata or use a recorded billing fixture sourced from that endpoint. Assert `USD 19` and one-time billing there, then assert the page matches it. If that cannot be tested without creating an order, remove the price claim until it can.

#### F-2-3 — The merchant claim test only asserts that the claim is printed (reopens F-1-17 and F-1-38)

- Exact claim: landing, README, Privacy, and Terms, “Sociobot/Dodo is the merchant of record.” Terms also says it “handles checkout and refunds.”
- Exact test: `@claim:merchant-of-record` checks that the sentence is visible beside a checkout link. It does not inspect a merchant field, terms response, or other billing contract evidence.
- Why this fails: a copy assertion cannot prove who legally processes the sale. The live redirect to `checkout.dodopayments.com` proves only the checkout host.
- Concrete fix: assert merchant identity from a stable, non-mutating Sociobot billing metadata response. Otherwise replace the legal claim with the observable wording “Checkout opens on Sociobot/Dodo” and remove the unproved refund statement.

#### F-2-4 — The license-request privacy claim is not exercised (reopens part of F-1-37)

- Exact quote: README, “No document content enters the license request.” Privacy also says, “this app never receives card details.”
- Exact test gap: `@claim:no-document-upload` puts a marker in demo data and records requests, but it never stores a license token or triggers `/api/license/verify`. `@claim:sociobot-billing-path` triggers a stubbed verification request but does not place a document marker or inspect its URL/body for that marker.
- Why this fails: the test omits the precise request named by the claim. A regression that attached document content only to license verification would pass both current tests.
- Concrete fix: in one tagged privacy test, seed a unique document marker, trigger license verification through a recorded same-origin response, and assert the marker is absent from the request URL, headers, and body. Narrow or remove the card-details sentence unless the checkout boundary is separately verifiable.

### Major

#### F-2-5 — The Privacy page has an unlisted license-storage and verification-cadence claim

- Exact quote/location: `/privacy/`, “If you buy the optional Desk license, the license token is stored in localStorage and sent to Sociobot’s API no more than once per day to verify it.”
- Why this fails: `.factory/claims.json` has no entry for token storage or the 24-hour verification interval. A user can rely on both privacy facts.
- Concrete fix: add a `license-token-cadence` claim. In a fresh context, store a recorded token, inspect the namespaced localStorage keys, advance the clock across the 24-hour boundary, and assert zero requests before and one request after it.

#### F-2-6 — The Privacy page has an unlisted card-data claim

- Exact quote/location: `/privacy/`, “Checkout is hosted by Sociobot/Dodo, the merchant of record; this app never receives card details.”
- Why this fails: the checkout URL is listed, but the stronger card-data boundary is absent from the claims manifest and is not asserted by a sandbox test.
- Concrete fix: split the sentence. Keep and test the observable redirect: “Checkout opens on Sociobot/Dodo.” Remove “this app never receives card details” unless the integration boundary can be established by a deterministic contract test.

#### F-2-7 — The Terms page has an unlisted refund-handling claim

- Exact quote/location: `/terms/`, “Sociobot/Dodo is the merchant of record and handles checkout and refunds.”
- Why this fails: the listed merchant test does not verify refund responsibility. This is information a buyer can rely on.
- Concrete fix: verify the statement from stable Sociobot billing terms/metadata, or rewrite it to the observable checkout destination and link to the applicable refund terms.

#### F-2-8 — The Terms page has an unlisted revocation claim

- Exact quote/location: `/terms/`, “A refunded or revoked license stops paid features.”
- Why this fails: no claims entry tests a previously valid license changing to refunded/revoked and hiding saved-version controls while preserving free exports.
- Concrete fix: add `revoked-license` with a recorded invalid-after-valid verification response. Assert paid controls stop and all four free exports remain usable.

#### F-2-9 — README's 503 behavior is an unlisted claim

- Exact quote/location: README, “It returns `503` if that shared counter is unavailable.”
- Why this fails: the behavior has untagged unit coverage, but `.factory/claims.json` does not list it. Running `@claim:license-rate-limit` executes only the tagged concurrency test, not the separate 503 tests.
- Concrete fix: add a `license-fails-closed` manifest entry and tag the configured-missing and counter-error cases. Assert `503` and the promised retry header.

#### F-2-10 — README's direct-document claim is unlisted

- Exact quote/location: README, “It includes direct documents for Demo, Privacy, Terms, and 404 responses.”
- Why this fails: this is observable routing/build behavior, but it has no claims entry. The untagged route test does not satisfy the claims protocol.
- Concrete fix: add `direct-route-documents` with a build-artifact test for `demo/index.html`, `privacy/index.html`, `terms/index.html`, and `404.html`, plus live status assertions where applicable.

#### F-2-11 — The required first-screen facts omit price

- Exact location: landing trust list, “Runs in your browser,” “No document upload,” and “Works offline after first visit.”
- Why this fails: the standard first-screen shape requires three short privacy/offline/price facts. Price is only available much later in the paid section, so a phone visitor cannot tell from the first screen whether the tool is free or paid.
- Concrete fix: replace or add a fact such as “Core checking and exports are free” and “Saved versions: $19 once.” Keep the first screen compact enough to retain the demo action.

### Minor

#### F-2-12 — Four interactive labels do not name their result

- Exact locations: demo **Clear table check** actually resets the sample; the issue-summary button says **2 total issues**; export buttons say **Issue report** and **Project JSON**; the landing disclosure says **Have a license? Restore it**.
- Why this fails: the first label promises clearing but performs reset, and the others are nouns or an ambiguous pronoun. Users should know the result before activating a control.
- Concrete fix: in demo mode use **Reset demo** instead of **Clear table check**; use **Review 2 issues**, **Export issue report**, **Export project JSON**, and **Restore Desk license**.

#### F-2-13 — README and billing copy retain avoidable jargon

- Exact quotes: “A primed browser,” “the deployment’s same-origin gateway,” “One atomic product counter … across function instances,” and “merchant of record.”
- Why this fails: these phrases require web-platform, distributed-systems, or payments knowledge and can be stated directly.
- Concrete rewrite: “After one connected visit, the browser can open the table checker without a network connection. License checks go through this app’s server. A shared counter allows 20 checks per client in each 60-second window. Sociobot/Dodo handles payment.” Retain the legal term only where legally necessary and explain it immediately.

#### F-2-14 — The copy-audit and claims-summary sentences are stale or false

- Exact locations: `.factory/copy-audit.md` says “The README has 46 prose units and a maximum of 15 words,” but the current README has 62 prose units and a 22-word maximum. That file does not list any README sentences. README says, “Each entry names its exact tagged browser test,” but `issue-detection` and `license-rate-limit` intentionally use Vitest unit tests.
- Why this fails: the proof artifact omits the text it claims to audit, and the README misstates the test type.
- Concrete fix: regenerate `.factory/copy-audit.md` from the current README with all 62 units. Change the README sentence to “Each entry names its exact tagged test.”

## Copy audit

Counts are whitespace-delimited visible words after Markdown formatting. Code blocks are excluded because they are commands or data, not sentences. No banned marketing adjective appears. Landing copy has 59 units and a maximum of 18 words. README has 62 units and a maximum of 22 words.

### Landing page

| # | Words | Exact copy | Result |
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
| 14 | 4 | Runs in your browser | Pass |
| 15 | 3 | No document upload | Pass |
| 16 | 5 | Works offline after first visit | Pass |
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
| 39 | 3 | Optional one-time upgrade | Pass |
| 40 | 3 | Keep saved versions. | Pass |
| 41 | 2 | $19 once. | Claim proof gap: F-2-2 |
| 42 | 8 | Core checking and every accessible export stay free. | Pass |
| 43 | 11 | A Desk license adds named saved versions for comparing OCR passes. | Pass |
| 44 | 4 | Save named before-and-after versions | Pass |
| 45 | 5 | Restore a prior cell structure | Pass |
| 46 | 6 | Saved versions stay in this browser | Pass |
| 47 | 5 | Free table checking is active | Pass |
| 48 | 5 | Buy Desk license — $19 | Claim proof gap: F-2-2 |
| 49 | 3 | Have a license? | Ambiguous interactive copy: F-2-12 |
| 50 | 2 | Restore it | Ambiguous interactive copy: F-2-12 |
| 51 | 2 | One-time purchase | Claim proof gap: F-2-2 |
| 52 | 5 | Sociobot/Dodo is merchant of record | Claim proof/jargon: F-2-3, F-2-13 |
| 53 | 4 | Accessible Table OCR Check | Pass |
| 54 | 6 | Your pages stay in this browser. | Pass |
| 55 | 1 | Terms | Pass |
| 56 | 6 | Source on GitHub (opens external site) | Pass |
| 57 | 4 | Built by Param Factory | Pass |
| 58 | 2 | Build polish-1 | Pass |
| 59 | 8 | The proofing-desk artwork was generated for this product. | Pass; provenance matches `.factory/design.md` |

### README

| # | Words | Exact copy | Result |
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
| 10 | 3 | Live product: https://accessible-table-ocr-check.sociobot.in | Pass |
| 11 | 3 | One-click sample: https://accessible-table-ocr-check.sociobot.in/demo | Pass |
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
| 35 | 11 | It includes direct documents for Demo, Privacy, Terms, and 404 responses. | Unlisted claim: F-2-10 |
| 36 | 10 | The build inlines the small app bundle into the page. | Pass |
| 37 | 12 | A primed browser can open the table checker without a network connection. | Jargon: F-2-13 |
| 38 | 15 | Production uses the factory’s static deployment command, which uploads dist/ and the managed api/ functions: | Pass |
| 39 | 14 | The license gateway requires RATE_LIMIT_REDIS_HOST and RATE_LIMIT_REDIS_KEY app settings from the product-owned sf-accessible-table-ocr-check-rate-limit cache. | Pass; developer configuration |
| 40 | 9 | It returns 503 if that shared counter is unavailable. | Unlisted claim: F-2-9 |
| 41 | 8 | Every public product claim is listed in .factory/claims.json. | False: F-2-14 |
| 42 | 8 | Each entry names its exact tagged browser test. | False: F-2-14 |
| 43 | 4 | Privacy and paid features | Pass |
| 44 | 12 | The app has no analytics, trackers, CDN fonts, or third-party runtime scripts. | Pass |
| 45 | 7 | The optional Desk license costs $19 once. | Claim proof gap: F-2-2 |
| 46 | 11 | It adds named saved versions stored in IndexedDB on that device. | Pass |
| 47 | 8 | Core checking and every accessible export remain free. | Pass |
| 48 | 8 | Purchase and verification use the Sociobot billing API. | Pass |
| 49 | 6 | Verification uses the deployment’s same-origin gateway. | Jargon: F-2-13 |
| 50 | 11 | One atomic product counter applies the 20-request allowance across function instances. | Jargon: F-2-13 |
| 51 | 8 | Every request beyond 20 receives 429 with Retry-After. | Pass |
| 52 | 7 | No document content enters the license request. | Inadequate test: F-2-4 |
| 53 | 6 | Sociobot/Dodo is the merchant of record. | Inadequate test/jargon: F-2-3, F-2-13 |
| 54 | 11 | Run npm run test:live-rate-limit after deployment from a fresh 60-second window. | Pass |
| 55 | 22 | It starts 25 requests together and requires atomic counts 1–20 to pass and counts 21–25 to return 429 with a positive Retry-After. | Pass at cap |
| 56 | 16 | Run npm run test:live-rate-limit:sequential after the next fresh window to check the same boundary in sequence. | Pass |
| 57 | 4 | See Privacy and Terms. | Pass |
| 58 | 2 | Project notes | Pass |
| 59 | 5 | Visual system and generated-art provenance | Pass |
| 60 | 3 | Demo sandbox contract | Pass |
| 61 | 5 | Build verification and known gaps | Pass |
| 62 | 2 | MIT License | Pass |

### Terminology and action audit

The primary product terms are consistent: **table check**, **cells**, **saved versions**, **demo**, **source image**, and **OCR JSON**. The wordmark's “proofing desk” is used as identity rather than as a competing task name. No banned marketing word appears.

Result-naming actions that pass include **Try it with sample data**, **Import your page**, **Reset demo**, **Start for real**, **Move … earlier/later**, **Remove …**, **Add cell**, **Show cell**, **Export HTML**, **Export CSV**, **Save version**, **Restore**, **Buy Desk license — $19**, and **Verify license**. The failed labels and rewrites are in F-2-12.

## Demo and sandbox evidence

- One-click entry: pass. The landing action opens `/demo` directly.
- Realism: pass after scrolling. The sample contains a transit-access survey, a source page, nine OCR cells, header roles, two deliberate reading-order jumps, semantic preview, and four exports.
- First phone screen: **blocking fail**, F-2-1.
- Banner: pass. “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real** remain present in demo mode.
- Reset: pass. Reset restores both seeded errors.
- Isolation: pass. A private real record was preserved byte-for-byte through edit, reset, and exit; `demo:table-proofing-desk` was deleted on exit.
- Requests: pass for the core flow. Root, local artwork, and `sample-table.svg` were the only requests; no off-origin request or console error occurred.
- Offline: pass. A fresh dedicated browser context reloaded, corrected, and exported the primed demo after `context.setOffline(true)`.
- Storage: pass. Demo uses `demo:table-proofing-desk`; real work uses `table-proofing-desk`.

## Claims execution

The repository was cloned from `/work/repo` into a new temporary directory at commit `8f5f980f3bf6792cf76f1edf2f9787e6e373ad1b`. `npm ci` completed with zero vulnerabilities. Every command from `.factory/claims.json` was then run separately.

| Claim id | Command result |
|---|---|
| demo-ready | PASS |
| demo-isolation | PASS |
| proof-and-export | PASS |
| browser-local | PASS |
| no-document-upload | PASS, but incomplete for the license-request wording; F-2-4 |
| pages-stay-local | PASS |
| no-third-party-runtime | PASS |
| indexeddb-only | PASS |
| offline-reload | PASS |
| import-formats | PASS |
| either-import-order | PASS |
| ocr-schema | PASS |
| json-shapes | PASS |
| field-normalization | PASS |
| bbox-formats | PASS |
| reading-order-overlays | PASS |
| cell-corrections | PASS |
| all-exports | PASS |
| free-core | PASS |
| free-state | PASS |
| desk-price | Command PASS; outcome proof invalid, F-2-2 |
| sociobot-billing-path | PASS |
| merchant-of-record | Command PASS; circular copy assertion, F-2-3 |
| licensed-saved-versions | PASS |
| local-saved-versions | PASS |
| import-limits | PASS |
| rejection-before-write | PASS |
| legacy-recovery | PASS |
| project-round-trip | PASS |
| clear-table-check | PASS |
| inline-offline-shell | PASS |
| human-check-only | PASS |
| issue-detection | PASS |
| license-rate-limit | PASS |

The full clean-clone gates also passed:

```text
npm test       PASS — 16 unit/API tests; 53 browser checks; 7 intentional skips
npm run build  PASS — dist/ produced; JS 13.01 KB gzip; CSS 4.98 KB gzip before inlining
npm run lint   PASS
```

The clean built `dist/index.html` and live `/` are both 58,121 bytes with SHA-256 `6f80d0b9f7299454050a4f7c1005999833ca3b6cea92eb75c71370030fca3cf1`.

The live concurrent rate-limit check passed independently: atomic counts 1–20 returned 200 and 21–25 returned 429 with positive `Retry-After` across four function instances.

## History verification

The only earlier review and polish report are `.factory/review-1.md` and `.factory/polish-1.md`. The cumulative handoff was also read. Each prior review finding was checked against both current source and the byte-identical live build.

| Earlier id | Current result |
|---|---|
| F-1-1 | Fixed: separate demo database, banner, reset, exit, and real-record isolation pass live. |
| F-1-2 | **Reopened:** manifest exists, but F-2-5 through F-2-10 identify unlisted or inadequately tested public claims. |
| F-1-3 | Fixed: correction and scoped HTML export pass. |
| F-1-4 | Fixed: browser-local request log passes. |
| F-1-5 | Fixed for the core flow; license-request scope is reopened under F-1-37/F-2-4. |
| F-1-6 | Fixed: dedicated offline context passes. |
| F-1-7 | Fixed: both import orders pass. |
| F-1-8 | Fixed: cells/blocks schema passes. |
| F-1-9 | Fixed: nine overlays and two jumps pass. |
| F-1-10 | Fixed: text, position, and role corrections pass. |
| F-1-11 | Fixed: all four downloads are parsed in tests. |
| F-1-12 | **Reopened:** F-2-2; the price test does not inspect billing truth. |
| F-1-13 | Fixed: all exports work without a license. |
| F-1-14 | Fixed: recorded valid verdict supports save/edit/restore. |
| F-1-15 | Fixed: saved versions are stored in the demo IndexedDB namespace. |
| F-1-16 | Fixed: unlicensed core workflow passes. |
| F-1-17 | **Reopened:** F-2-3; the merchant test asserts only its own copy. |
| F-1-18 | Fixed: edits persist locally and outgoing core requests remain same-origin. |
| F-1-19 | Fixed: README audience/job copy is split and plain. |
| F-1-20 | Fixed: README capability copy is split and covered by workflow tests. |
| F-1-21 | Fixed: no OCR-generation action/result appears after image-only import. |
| F-1-22 | Fixed for core upload/limitation wording. |
| F-1-23 | Fixed: direct README demo URL opens populated isolated data. |
| F-1-24 | Fixed: four image formats and both input orders pass. |
| F-1-25 | Fixed: all four documented JSON containers pass. |
| F-1-26 | Fixed: imported fields normalize into editor values. |
| F-1-27 | Fixed: percentage, normalized, and pixel boxes pass. |
| F-1-28 | Fixed: 500/99 pass and 501/100 fail. |
| F-1-29 | Fixed: rejection preserves work and legacy coordinates are bounded with notice. |
| F-1-30 | Fixed: project JSON round-trip preserves cell text. |
| F-1-31 | Fixed: user-facing terminology is “saved versions”; storage checks pass. |
| F-1-32 | Fixed: **Clear table check** removes the real working record. Demo misuse of that label is new F-2-12. |
| F-1-33 | Fixed: built JS/CSS is inline and offline reload passes. |
| F-1-34 | Fixed: no third-party core runtime requests were observed. |
| F-1-35 | **Partly reopened:** free scope/local versions pass; price proof fails under F-2-2. |
| F-1-36 | Fixed: checkout and same-origin verification paths are asserted. |
| F-1-37 | **Partly reopened:** live atomic limit passes; license-request document privacy is not exercised, F-2-4. |
| F-1-38 | **Reopened:** same merchant-proof defect as F-1-17/F-2-3. |
| F-1-39 | Fixed: unknown live URL returns HTTP 404 with the designed page and return actions. |
| F-1-40 | Fixed: `/demo`, History API, Back/Forward, heading focus, and announcement pass. |
| F-1-41 | Fixed: canonical, route descriptions, OG/Twitter, social image, favicon, and touch icon exist. |
| F-1-42 | Fixed: route titles follow the required pattern and remain below 60 characters. |
| F-1-43 | Fixed: robots and sitemap return 200 and include public routes. |
| F-1-44 | Fixed: consistent four-link header and provenance footer render on every route. |
| F-1-45 | Fixed: limitations section precedes pricing. |
| F-1-46 | Fixed: README opening units are 11 and 10 words. |
| F-1-47 | Fixed: capability copy is split into 11- and 10-word sentences. |
| F-1-48 | Fixed: import rejection and recovery are separate 10- and 12-word sentences. |
| F-1-49 | Fixed: “QA layer” is absent. |
| F-1-50 | Fixed: user-facing task term is “table check.” |
| F-1-51 | Fixed: “Trace the reading order” names the section. |
| F-1-52 | Fixed: “Label cells and headers” names the section. |
| F-1-53 | Fixed: “Export the checked table” names the section. |
| F-1-54 | Fixed: paid records are consistently “saved versions” in user-facing copy. |
| F-1-55 | Fixed: the primary action is **Try it with sample data** and its outcome sentence is adjacent. |
| F-1-56 | Fixed: Privacy and Terms have plain route-specific h1 text. |
| F-1-57 | Fixed: GitHub link identifies the external destination. |

Earlier handoff defects were also rechecked. The 99 × 99 and 500-cell bounds, hero aspect ratio, accessible wordmark name, 44 px targets, security/caching policy, offline reload, and shared concurrent rate limit pass. The live rate-limit run observed four function instances and the exact 20/5 boundary. The brief's under-five-minute moderated outcome remains unmeasured and is not advertised as measured.

## Structure, links, accessibility, and identity

- Titles: pass. Root, Demo, Privacy, Terms, and 404 use route-specific titles under 60 characters.
- Semantics: pass. Every tested route has `lang="en"`, one h1, and one main.
- Metadata: pass. Route-specific descriptions/canonicals, OG/Twitter metadata, 1200 × 630 social art, SVG favicon, and 180 px touch icon are present.
- Routing: pass. Direct routes return expected status; Back/Forward restores route and h1 focus; unknown URLs return the designed 404.
- Links: pass. All internal routes/assets, GitHub, robots, and sitemap resolve. The product checkout endpoint returns a 303 to a Dodo checkout session. All root hash targets exist.
- Header/footer: pass on all routes, including 404.
- Accessibility: pass in automated coverage. The fleet URL verifier reports no console errors on root. A fresh axe sweep of five routes at desktop and 390 px found zero violations at any severity. Keyboard operation, reduced motion, and 44 px targets pass.
- Visual identity: pass. The warm-paper risograph proofing desk, coral/teal/mustard palette, hard print shadows, typography, and original art match `.factory/design.md` and are distinct from a generic SaaS template.

The browser logs the expected failed-document message when the intentionally missing URL returns HTTP 404; no app-origin script or asset error occurs.

## Missed leverage

No additional AI feature, sync, or cloud import is an obvious requirement. The brief calls for a local human check and explicitly excludes OCR generation and automatic perfect reconstruction. Model-based correction would add privacy and cost without filling a required gap. HTML, CSV, project JSON, and issue-report exports already cover the implied export need. No decorative AI feature or embedded provider key was found.

## What would make this perfect

1. Put a real issue and correction action above the fold on the 390 px demo.
2. Replace price and merchant copy assertions with billing-source contract tests, or remove those claims.
3. Add manifest entries and deterministic tests for every Privacy, Terms, and README claim listed in F-2-5 through F-2-10.
4. Make every control name its result and replace the flagged jargon.
5. Regenerate the copy audit from current copy and rerun this complete review from a clean browser and clone.
