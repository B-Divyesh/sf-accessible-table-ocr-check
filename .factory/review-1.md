# Adversarial first-read review 1 — FAIL

- Product: Accessible Table OCR Check
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Candidate reviewed: `cf20e1e7de0070dc367ca248849e6a4c60fd198e`
- Review date: 2026-08-30 UTC
- Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict

**FAIL.** The core table-proofing workflow works, the visual identity is distinct, and the existing test/build gates pass. The product still has blocking contract failures: the sample overwrites the real storage namespace, no demo controls or direct demo route exist, `.factory/claims.json` is missing, every public product claim is therefore unlisted and untested under the claims protocol, and unknown URLs silently render the landing page instead of a designed 404.

This is not a PASS-adjacent result. The product cannot pass while sample activity can replace real local work or while public claims have no manifest-backed tests.

## First screen: cold read before scrolling

### 390 px

- What it does, in my words: compares a scanned table with its OCR order, lets me correct cells and headers, then exports a screen-reader-friendly table.
- For whom: someone checking scanned-table OCR before sharing it with screen-reader users. The audience is inferable from the task, although the page does not name readers, librarians, or accessibility practitioners.
- What I should click first: **Open a scrambled sample**.

All three answers were recoverable from the first screen. The exact text doing the work was “A local QA layer for scanned tables,” “Compare OCR reading order with the page, correct cell roles, and export a table that screen readers can follow,” and “Open a scrambled sample.” The first screen is therefore not itself blocking, but “QA layer” is jargon and the sample action does not use the required demo wording.

### Desktop

The answers were the same. The headline, explanation, primary sample action, real import action, and three short facts were visible without scrolling. The artwork is product-specific and does not obscure the actions.

## Findings

Findings are ordered by severity. Each finding gives the observed text or location, first-visitor impact, and concrete fix.

### Blocking

#### F-1-1 — The one-click sample is not an isolated demo

- Exact location: landing button “Open a scrambled sample”; workbench status “Open proof · autosaved locally”; `src/main.ts:86-87`; `src/storage.ts:3-4,15-19,26-30`.
- Verified behavior: one click does open a realistic nine-cell transit-access table and immediately shows its source, editable structure, two errors, semantic preview, and exports. However, it writes `id: "current"` into the production IndexedDB database `table-proofing-desk`, the same record used by real imports. The workbench has no “Demo — sample data, nothing is saved” banner, no **Reset demo**, and no **Start for real**. `/demo` and `/?demo=1` both render the ordinary landing page; neither enters demo mode. `.factory/demo.md` is absent.
- Why this fails: sample activity can replace the visitor's real current proof. A visitor cannot distinguish disposable sample work from saved work or reset it safely.
- Concrete fix: make the first action **Try it with sample data** and route it to `/demo` (or `?demo=1`). Store demo data under a separate database/key prefix such as `demo:table-proofing-desk`; never read or write `projects/current` while the banner is shown. Add the persistent required banner with **Reset demo** and **Start for real**, discard demo state on exit, add `.factory/demo.md`, and test that a seeded real proof is byte-for-byte unchanged after the full demo flow.

#### F-1-2 — The required claims manifest and tagged tests do not exist

- Exact location: `.factory/claims.json` is absent; `rg '@claim:' .` returns no matches.
- Why this fails: there is no machine-readable list of what the visitor is promised, no prescribed clean-sandbox command per claim, and no way to establish that every claim remains tested. `npm test` passing does not substitute for the claims protocol.
- Concrete fix: add `.factory/claims.json`. Give every public claim below one stable id, one exact `@claim:<id>` test, its copy locations, and its clean demo sandbox. Run each listed command independently from a fresh clone.

The following public claim-like sentences have no claims entry. Each is independently unlisted.

| ID | Exact quote and location | Why a visitor can rely on it | Concrete test/fix |
|---|---|---|---|
| F-1-3 | Landing: “Compare OCR reading order with the page, correct cell roles, and export a table that screen readers can follow.” | Promises the end-to-end job and accessible output. | Add `@claim:proof-and-export`; in isolated demo data correct the scrambled order, export HTML, and assert ordered cells plus `th` scopes. |
| F-1-4 | Landing: “Runs in your browser” | Promises client-side operation. | Add `@claim:browser-local`; complete the demo with no backend document-processing request. |
| F-1-5 | Landing: “No document upload” | Promises document privacy. | Add `@claim:no-document-upload`; record all requests while importing, editing, and exporting and assert no document bytes leave the origin. |
| F-1-6 | Landing: “Works offline after first visit” | Promises offline use. | Add `@claim:offline-reload` with its own browser context, enter `/demo`, go offline, reload, edit, and export. |
| F-1-7 | Landing: “Use either input first.” | Promises image-first and JSON-first workflows. | Add `@claim:either-import-order`; test both orders in fresh demo contexts. |
| F-1-8 | Landing: “OCR JSON should contain a cells or blocks array with text, row, column, and optional bounding box.” | Defines accepted input. | Add `@claim:ocr-schema`; import both documented top-level shapes and assert normalized visible cells. |
| F-1-9 | Landing: “Follow numbered overlays on the source and spot jumps in reading order.” | Promises aligned overlays and defect detection. | Add `@claim:reading-order-overlays`; assert overlay labels map to cells and the two seeded jumps are reported. |
| F-1-10 | Landing: “Correct text, grid positions, and row or column header roles.” | Promises editable content and semantics. | Add `@claim:cell-corrections`; edit every named field and assert preview/export changes. |
| F-1-11 | Landing: “Export semantic HTML, CSV, JSON, and a plain-language issue report.” | Promises four working exports. | Add one claim per format, or one parametrized `@claim:all-exports`, and validate downloaded contents rather than button presence. |
| F-1-12 | Landing: “$19 once.” | Makes a quantitative price and billing-frequency claim. | Add `@claim:desk-price`; assert displayed/API product price and one-time billing metadata equal USD 19 without creating a paid order. |
| F-1-13 | Landing: “Core checking and every accessible export stay free.” | Defines the free entitlement. | Add `@claim:free-core`; with no license, complete correction and download every export. |
| F-1-14 | Landing: “A Desk license adds named local snapshots, useful when comparing OCR passes.” | Defines the paid entitlement and local storage behavior. | Add `@claim:licensed-snapshots` with a recorded valid-license response; save, change, restore, and inspect local-only storage. |
| F-1-15 | Landing: “Still private and local-first” | Promises privacy for the paid feature. | Replace “local-first” with a concrete sentence and add `@claim:local-snapshots` asserting only same-origin license verification and local snapshot persistence. |
| F-1-16 | Landing: “Free proofing is active” | Promises usable current entitlement. | Add `@claim:free-state`; assert the unlicensed state still permits core correction and all exports. |
| F-1-17 | Landing: “Sociobot/Dodo is merchant of record” | Identifies who handles payment. | Add a billing metadata/redirect contract test without completing payment, or move this legal assertion to tested billing configuration documentation. |
| F-1-18 | Landing footer: “Your pages stay in this browser.” | Makes a broad privacy promise. | Add `@claim:pages-stay-local`; inspect requests and browser storage across import, autosave, reload, and export. |
| F-1-19 | README: “A local-first proofing desk for readers, librarians, and accessibility practitioners who need to check whether OCR preserved a scanned table’s reading order and cell structure.” | Promises local checking for the stated job. | Rewrite in plain words and map it to the local workflow/privacy tests. |
| F-1-20 | README: “It compares a source image with numbered OCR blocks, flags likely structural defects, supports cell/header correction, and exports semantic HTML, CSV, project JSON, and a plain-text issue report.” | Lists observable product capabilities. | Split the sentence and map each behavior to the overlay, issue, correction, and export tests. |
| F-1-21 | README: “This is a human QA layer, not an OCR engine.” | Defines a product limitation. | Rewrite “This tool helps a person check OCR. It does not create OCR.” Add a test that image-only input does not claim OCR extraction. |
| F-1-22 | README: “It does not upload documents or promise automatic reconstruction.” | Promises privacy and a limitation. | Split it; map the privacy clause to request logging and verify the UI never offers or reports automatic reconstruction. |
| F-1-23 | README: “Use Open a scrambled sample for a guided first proof.” | Promises a usable sample path. | Change to the required `/demo` URL and add `@claim:demo-ready` asserting realistic populated UI on direct entry. |
| F-1-24 | README: “Import a PNG/JPEG/WebP/SVG page image and OCR JSON in either order.” | Defines formats and ordering. | Add `@claim:import-formats` and `@claim:either-import-order` using fixtures for each format and order. |
| F-1-25 | README: “JSON may use a top-level `cells` or `blocks` array (or the same array under the first item in `pages`).” | Defines accepted JSON shapes. | Add `@claim:json-shapes` covering all three documented shapes. |
| F-1-26 | README: “Common `text`, `row`, `column`, `role`, `readingOrder`, and `bbox` fields are normalized.” | Promises normalization. | Add `@claim:field-normalization` and assert the resulting editor values and order. |
| F-1-27 | README: “Bounding boxes may be percentages, normalized 0–1 values, or pixels when page `width` and `height` are supplied.” | Defines three coordinate formats. | Add `@claim:bbox-formats`; import all three and assert equivalent overlay geometry. |
| F-1-28 | README: “Each proof is limited to 500 cells on a 99 × 99 grid.” | Makes quantitative limits. | Add `@claim:import-limits` asserting 500/99 pass and 501/100 fail. |
| F-1-29 | README: “Imports outside those limits are rejected before local storage or rendering; older saved proofs with unsafe coordinates are recovered into the supported range with a visible review notice.” | Promises safe rejection, no persistence, recovery, and notice. | Split the sentence and add separate rejection-before-write and legacy-recovery claim tests. |
| F-1-30 | README: “The Project JSON export can be re-imported as OCR JSON.” | Promises round-trip import/export. | Add `@claim:project-round-trip`; export, clear, re-import, and compare all meaningful fields. |
| F-1-31 | README: “Working data and optional named checkpoints are stored only in IndexedDB.” | Promises a storage boundary. | Add `@claim:indexeddb-only`; inspect IndexedDB, localStorage, cookies, Cache Storage, and requests after core and licensed flows. |
| F-1-32 | README: “Clearing the proof removes its working copy.” | Promises deletion. | Add `@claim:clear-proof`; clear, reload, and assert `projects/current` and its UI are gone. |
| F-1-33 | README: “The post-build step inlines the small app bundle into the shell so a hard offline navigation never depends on a second request.” | Makes a specific offline-build claim. | Add `@claim:inline-offline-shell`; inspect the built shell and prove a hard offline navigation from a primed context. |
| F-1-34 | README: “There are no analytics, trackers, CDN fonts, or third-party runtime scripts.” | Makes four privacy/supply-chain claims. | Add `@claim:no-third-party-runtime`; record requests and inspect loaded script/font resources throughout the demo. |
| F-1-35 | README: “The optional one-time $19 Desk license adds named local checkpoints only; core checking and all accessible exports are free.” | Defines price, scope, locality, and free entitlement. | Split it and map each clause to the price, licensed-snapshot, local-storage, and free-core tests. |
| F-1-36 | README: “Purchase and verification use the Sociobot billing API.” | Defines the billing integration. | Add `@claim:sociobot-billing-path`; assert the checkout/verification targets without completing a purchase. |
| F-1-37 | README: “Verification passes through the deployment’s same-origin, rate-limited gateway so bursts receive `429` and `Retry-After`; no document content enters that path.” | Promises same-origin routing, measurable limiting, and privacy. | Split it; add a deterministic gateway contract test for threshold/headers and a request-body/query assertion for document content. |
| F-1-38 | README: “Sociobot/Dodo is the merchant of record.” | Repeats the unlisted payment claim. | Cover it with the billing configuration test used for F-1-17 and list both locations in one manifest entry. |

#### F-1-39 — Unknown routes are a false 200 landing page, not a designed 404

- Exact location: `/definitely-not-a-real-route-qa` and `/404.html` both returned `200 text/html` and rendered “Make the table read the way it looks.” No 404 source file or response override exists.
- Why this fails: mistyped and stale links look valid, crawlers receive a soft 404, and visitors get no explanation or route back.
- Concrete fix: create a product-styled 404 page with a plain heading and home/demo actions. Configure the host's 404 response override to serve it with status 404, then test an arbitrary unknown path.

### Major

#### F-1-40 — `/demo` is not a real route and route changes do not manage focus

- Exact location: `/demo` renders the ordinary landing page with the root title. Clicking Privacy and using Back left `document.activeElement` on `<body>` rather than the new `<h1>`. `src/main.ts:318-325` selects only privacy/terms and does not use `pushState`, `popstate`, an announcement, or heading focus.
- Why this fails: the required demo deep link does not work, and keyboard/screen-reader users receive no programmatic route-change cue.
- Concrete fix: implement `/demo`; centralize route metadata/rendering; use History API navigation where appropriate; on every client-side route change focus a temporarily focusable `<h1>` and announce it in the polite live region. Add direct-load, reload, Back, Forward, scroll, and focus tests.

#### F-1-41 — Required discovery/social metadata is absent

- Exact location: every tested route had no canonical link, Open Graph tags, Twitter card tags, or apple-touch icon. Privacy and Terms reuse the root description. There is no original 1200 × 630 social image.
- Why this fails: shared links have no controlled preview, duplicate routes have no canonical URL, iOS has no declared touch icon, and legal-route search snippets describe the app rather than the route.
- Concrete fix: add canonical, route-specific description, OG/Twitter title/description/image, favicon declarations, and a 180 px apple-touch icon. Produce a 1200 × 630 image from the existing original proofing artwork and test metadata on every route.

#### F-1-42 — The root title exceeds the title contract and `/demo` has no demo title

- Exact quote: “Accessible Table OCR Check — verify table reading order locally” is 63 characters; `/demo` uses the same title.
- Why this fails: the title exceeds the 60-character limit and does not distinguish the demo route.
- Concrete fix: use, for example, “Accessible Table OCR Check — fix reading order” on `/` and “Demo — Accessible Table OCR Check” on `/demo`; assert the exact title per route.

#### F-1-43 — `robots.txt` and `sitemap.xml` are missing

- Exact location: both `/robots.txt` and `/sitemap.xml` returned 404.
- Why this fails: the required route inventory is absent and search engines receive no crawl guidance.
- Concrete fix: ship both files; list `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 policy as appropriate. Add response/content tests.

#### F-1-44 — Header/footer omit required orientation and provenance items

- Exact location: header nav is only “How it works” and “Desk license”; it lacks Demo and Privacy. Footer lacks “Built by Param Factory” and a version/build id.
- Why this fails: visitors cannot reach the demo or privacy policy from the consistent header, and deployed-build provenance is unavailable.
- Concrete fix: add Demo and Privacy within the four-link limit; add “Built by Param Factory” and a build id to every footer; test all routes for the same skeleton.

#### F-1-45 — Landing page omits the required “what it does not do” section

- Exact location: the landing page moves from “How it works” directly to the paid tier. The limitation “This is a human QA layer, not an OCR engine” exists only in README.
- Why this fails: a first-time visitor can mistake issue detection for OCR generation or guaranteed accessibility.
- Concrete fix: before pricing, add a plain section such as “What this check cannot confirm” with: “This tool does not create OCR or check spelling. Compare every value with the scan before sharing.” Register and test any behavioral claims retained there.

### Minor copy findings

#### F-1-46 — README sentence exceeds 22 words

- Exact quote (25 words): “A local-first proofing desk for readers, librarians, and accessibility practitioners who need to check whether OCR preserved a scanned table’s reading order and cell structure.”
- Why this fails: the audience and job are buried in one long, jargon-heavy sentence.
- Rewrite: “Check whether OCR preserved a scanned table’s reading order and cells. This local tool is for readers, librarians, and accessibility reviewers.”

#### F-1-47 — README sentence exceeds 22 words

- Exact quote (28 words): “It compares a source image with numbered OCR blocks, flags likely structural defects, supports cell/header correction, and exports semantic HTML, CSV, project JSON, and a plain-text issue report.”
- Why this fails: four capabilities compete in one sentence.
- Rewrite: “Compare the scan with numbered OCR cells and fix structure errors. Export accessible HTML, CSV, project JSON, or a text report.”

#### F-1-48 — README sentence exceeds 22 words

- Exact quote (28 words): “Imports outside those limits are rejected before local storage or rendering; older saved proofs with unsafe coordinates are recovered into the supported range with a visible review notice.”
- Why this fails: current import validation and legacy recovery are separate ideas.
- Rewrite: “The app rejects larger imports before saving or rendering them. It safely bounds older saved coordinates and asks you to review them.”

#### F-1-49 — “QA layer” is unexplained jargon

- Exact locations: landing “A local QA layer for scanned tables”; README “This is a human QA layer, not an OCR engine.”
- Why this fails: a cold visitor should not need to expand “QA” or interpret “layer.”
- Rewrite: landing “For librarians and accessibility reviewers checking scanned tables.” README “This tool helps a person check OCR. It does not create OCR.”

#### F-1-50 — “Proof” is used as a noun and verb without explanation

- Exact locations: “Start a proof,” “Bring the page and its OCR blocks,” “Proof structure, not just spelling,” “guided first proof,” “Each proof,” and “Clearing the proof.”
- Why this fails: “proof” can mean evidence, a draft, or an action; the app otherwise calls the saved object a project and the task a check.
- Concrete fix: standardize on “table check”: “Start a table check,” “Check structure, not just spelling,” “Each table check,” and “Clear this table check.”

#### F-1-51 — “Trace” does not name its section out of context

- Exact heading: “Trace.”
- Why this fails: a screen-reader heading list does not say what is traced.
- Rewrite: “Trace the reading order.”

#### F-1-52 — “Relabel” does not name its section out of context

- Exact heading: “Relabel.”
- Why this fails: the object of the action is missing.
- Rewrite: “Label cells and headers.”

#### F-1-53 — “Share” does not name the actual result

- Exact heading: “Share.”
- Why this fails: the product exports files; it does not provide a sharing workflow.
- Rewrite: “Export the checked table.”

#### F-1-54 — The paid feature uses three inconsistent terms

- Exact locations: “named checkpoints,” “named local snapshots,” and “named before/after states.”
- Why this fails: visitors cannot tell whether these are the same object or three features.
- Concrete fix: choose one plain term, preferably “saved versions,” throughout landing, workbench, README, Privacy, and Terms.

#### F-1-55 — The primary button does not use the required demo wording

- Exact quote: “Open a scrambled sample.”
- Why this fails: it describes the fixture but not that the action is a safe product trial; “scrambled” can also sound like damaged data.
- Rewrite: “Try it with sample data.” The adjacent note should say: “Opens a scanned transit table with two reading-order errors.”

#### F-1-56 — Legal-page h1s use desk metaphor instead of route names

- Exact quotes: Privacy h1 “Your documents stay at your desk.” Terms h1 “Terms for a careful proofing tool.”
- Why this fails: neither heading is the clearest route name when read alone.
- Rewrite: “How we handle your documents” and “Terms of use.”

#### F-1-57 — The external Source link is not identified as external

- Exact location: footer link “Source” points to GitHub.
- Why this fails: the site-structure contract requires external links to say so; mobile visitors receive no warning that they are leaving the product.
- Rewrite: “Source on GitHub (opens external site)” and provide the same accessible name if an icon is used.

## Complete copy audit

Word count method: whitespace-delimited visible words; code markup is removed; punctuation attached to a word does not add a word. Landing rows include headings, navigation, controls, captions, bullets, and fragments so no visible copy is omitted. No banned marketing word from the supplied plain-words list appears. Landing average across these visible units is 5.04 words; README average is 10.75. Three README sentences exceed the 22-word cap.

### Landing page

| # | Words | Exact visible copy | Flag |
|---:|---:|---|---|
| 1 | 4 | Skip to main content | — |
| 2 | 3 | Table proofing desk | — |
| 3 | 3 | How it works | — |
| 4 | 2 | Desk license | — |
| 5 | 3 | Local by default | Claim: F-1-18 |
| 6 | 7 | A local QA layer for scanned tables | Jargon: F-1-49 |
| 7 | 8 | Make the table read the way it looks. | — |
| 8 | 19 | Compare OCR reading order with the page, correct cell roles, and export a table that screen readers can follow. | Claim: F-1-3 |
| 9 | 4 | Open a scrambled sample | Button/demo wording: F-1-55 |
| 10 | 3 | Import your page | — |
| 11 | 4 | Runs in your browser | Claim: F-1-4 |
| 12 | 3 | No document upload | Claim: F-1-5 |
| 13 | 5 | Works offline after first visit | Claim: F-1-6 |
| 14 | 8 | Source page → reading order → semantic table | — |
| 15 | 3 | Start a proof | Jargon: F-1-50 |
| 16 | 7 | Bring the page and its OCR blocks. | — |
| 17 | 4 | Use either input first. | Claim: F-1-7 |
| 18 | 17 | OCR JSON should contain a cells or blocks array with text, row, column, and optional bounding box. | Claim: F-1-8 |
| 19 | 3 | Add source image | — |
| 20 | 8 | PNG, JPEG, WebP, or SVG · stays local | Claim: F-1-5 |
| 21 | 3 | Add OCR JSON | — |
| 22 | 5 | Cells, blocks, coordinates, and order | — |
| 23 | 3 | The three-pass check | — |
| 24 | 5 | Proof structure, not just spelling. | Jargon: F-1-50 |
| 25 | 1 | Trace | Contextless heading: F-1-51 |
| 26 | 12 | Follow numbered overlays on the source and spot jumps in reading order. | Claim: F-1-9 |
| 27 | 1 | Relabel | Contextless heading: F-1-52 |
| 28 | 10 | Correct text, grid positions, and row or column header roles. | Claim: F-1-10 |
| 29 | 1 | Share | Inaccurate heading: F-1-53 |
| 30 | 10 | Export semantic HTML, CSV, JSON, and a plain-language issue report. | Claim: F-1-11 |
| 31 | 3 | Optional one-time upgrade | — |
| 32 | 3 | Keep named checkpoints. | Terminology: F-1-54 |
| 33 | 2 | $19 once. | Claim: F-1-12 |
| 34 | 8 | Core checking and every accessible export stay free. | Claim: F-1-13 |
| 35 | 12 | A Desk license adds named local snapshots, useful when comparing OCR passes. | Claim/terminology: F-1-14, F-1-54 |
| 36 | 4 | Save named before/after states | Terminology: F-1-54 |
| 37 | 5 | Restore a prior cell structure | Claim: F-1-14 |
| 38 | 4 | Still private and local-first | Jargon/unlisted claim: F-1-15 |
| 39 | 4 | Free proofing is active | Claim: F-1-16 |
| 40 | 5 | Buy Desk license — $19 | — |
| 41 | 3 | Have a license? | — |
| 42 | 2 | Restore it | — |
| 43 | 2 | One-time purchase | Claim: F-1-12 |
| 44 | 5 | Sociobot/Dodo is merchant of record | Claim: F-1-17 |
| 45 | 4 | Accessible Table OCR Check | — |
| 46 | 6 | Your pages stay in this browser. | Claim: F-1-18 |
| 47 | 1 | Privacy | — |
| 48 | 1 | Terms | — |
| 49 | 1 | Source | External destination: F-1-57 |
| 50 | 8 | The proofing-desk artwork was generated for this product. | —; provenance matches `.factory/design.md` |

### README

| # | Words | Exact copy | Flag |
|---:|---:|---|---|
| 1 | 4 | Accessible Table OCR Check | — |
| 2 | 25 | A local-first proofing desk for readers, librarians, and accessibility practitioners who need to check whether OCR preserved a scanned table’s reading order and cell structure. | Over cap/jargon/claim: F-1-46, F-1-19 |
| 3 | 28 | It compares a source image with numbered OCR blocks, flags likely structural defects, supports cell/header correction, and exports semantic HTML, CSV, project JSON, and a plain-text issue report. | Over cap/claim: F-1-47, F-1-20 |
| 4 | 10 | This is a human QA layer, not an OCR engine. | Jargon/claim: F-1-49, F-1-21 |
| 5 | 9 | It does not upload documents or promise automatic reconstruction. | Claim: F-1-22 |
| 6 | 17 | Reviewers remain responsible for comparing text with the source and for having permission to process copyrighted material. | — |
| 7 | 2 | Live product | — |
| 8 | 2 | Run locally | — |
| 9 | 5 | Requires Node.js 20 or later. | — |
| 10 | 5 | Open the printed local URL. | — |
| 11 | 10 | Use Open a scrambled sample for a guided first proof. | Demo/jargon/claim: F-1-23, F-1-50, F-1-55 |
| 12 | 2 | Import format | — |
| 13 | 11 | Import a PNG/JPEG/WebP/SVG page image and OCR JSON in either order. | Claim: F-1-24 |
| 14 | 19 | JSON may use a top-level cells or blocks array (or the same array under the first item in pages). | Claim: F-1-25 |
| 15 | 11 | Common text, row, column, role, readingOrder, and bbox fields are normalized. | Claim: F-1-26 |
| 16 | 17 | Bounding boxes may be percentages, normalized 0–1 values, or pixels when page width and height are supplied. | Claim: F-1-27 |
| 17 | 13 | Each proof is limited to 500 cells on a 99 × 99 grid. | Jargon/claim: F-1-28, F-1-50 |
| 18 | 28 | Imports outside those limits are rejected before local storage or rendering; older saved proofs with unsafe coordinates are recovered into the supported range with a visible review notice. | Over cap/claim: F-1-48, F-1-29 |
| 19 | 10 | The Project JSON export can be re-imported as OCR JSON. | Claim: F-1-30 |
| 20 | 11 | Working data and optional named checkpoints are stored only in IndexedDB. | Terminology/claim: F-1-31, F-1-54 |
| 21 | 7 | Clearing the proof removes its working copy. | Jargon/claim: F-1-32, F-1-50 |
| 22 | 3 | Test and build | — |
| 23 | 10 | Playwright 1.58.2 is pinned to match the factory browser image. | — |
| 24 | 20 | The static deployment root is exactly dist/, with index.html at its root and direct entry documents for /privacy/ and /terms/. | — |
| 25 | 22 | The post-build step inlines the small app bundle into the shell so a hard offline navigation never depends on a second request. | Claim: F-1-33 |
| 26 | 4 | Privacy and paid unlock | — |
| 27 | 11 | There are no analytics, trackers, CDN fonts, or third-party runtime scripts. | Claim: F-1-34 |
| 28 | 19 | The optional one-time $19 Desk license adds named local checkpoints only; core checking and all accessible exports are free. | Claim/terminology: F-1-35, F-1-54 |
| 29 | 8 | Purchase and verification use the Sociobot billing API. | Claim: F-1-36 |
| 30 | 20 | Verification passes through the deployment’s same-origin, rate-limited gateway so bursts receive 429 and Retry-After; no document content enters that path. | Claim: F-1-37 |
| 31 | 6 | Sociobot/Dodo is the merchant of record. | Claim: F-1-38 |
| 32 | 4 | See Privacy and Terms. | — |
| 33 | 2 | Project notes | — |
| 34 | 5 | Visual system and generated-art provenance | — |
| 35 | 5 | Build verification and known gaps | — |
| 36 | 2 | License: MIT | — |

## Demo and sandbox evidence

- One-click value: pass for realism and immediate use. The sample opens a transit accessibility survey with nine populated cells, source overlays, two reading-order errors, an editable structure, semantic preview, and exports.
- Required demo entry: fail. `/demo` and `/?demo=1` do not enter demo mode.
- Required banner/actions: fail. No demo banner, Reset demo, or Start for real exists.
- Isolation: fail. Live IndexedDB contained `table-proofing-desk/projects/current` with `name: "Transit access survey"` after clicking the sample. Source confirms the sample sets `project.id = 'current'` and calls the ordinary persistence path.
- Reset: not testable because it does not exist.
- Real data untouched: fail by construction because sample and real work share the only current-project record.
- Privacy/offline behavior, independent of demo isolation: pass. A fresh live flow loaded the sample, corrected it, exported the report, reloaded, went offline, and reloaded again. All observed requests stayed on `https://accessible-table-ocr-check.sociobot.in`; the corrected nine-cell proof returned offline; no console error occurred.

## Claims execution

There were no listed commands to run because `.factory/claims.json` is missing. This is an untested-claim failure, not a vacuous pass.

For baseline evidence, a fresh clone of commit `cf20e1e7` was installed and tested:

```text
npm ci --ignore-scripts        PASS (0 vulnerabilities)
npm run lint                   PASS
npm run typecheck              PASS
npm test                       PASS (12 Vitest tests; 15 Playwright runs passed, 5 intentional project skips)
npm run build                  PASS
```

The clean build and live root had the same SHA-256: `359fef1eaa680837b63927c9e7e76850c6984097770e735817eff060236f5488`.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists in the current tree or Git history. The previous handoff and two verification reports were read. Each earlier release defect was rechecked rather than accepted from its “fixed” label:

| Earlier defect | Live/code result on 2026-08-30 |
|---|---|
| License verification did not rate-limit | Fixed: requests 1–20 returned 200; request 21 returned 429 with `Retry-After: 58`; all requests 21–40 returned 429 in this run. Code still uses a process-local window, matching the handoff's disclosed operational limitation. |
| Unsafe row/column values could create an unbounded render | Fixed: clean tests cover import rejection, editor rollback, and legacy repair; `MAX_GRID_DIMENSION` is enforced before persistence/rendering. |
| Hero image was distorted | Fixed: live client ratios were 950/632 desktop and 434/288 mobile, with the 640 px mobile source selected. |
| Wordmark visible text did not match accessible name | Fixed: the experimental `label-content-name-mismatch` axe rule returned no violation. |
| Mobile legal/footer targets were below 44 px | Fixed: every audited target was at least 44 px in both dimensions. |
| Cache, MIME, CSP, framing, and related headers were incomplete | Fixed: HTML is no-cache, service worker no-store, assets immutable, manifest is `application/json`, and CSP/HSTS/nosniff/referrer/permissions/frame-denial headers are present. |

The handoff's other disclosed limitation remains accurate: the brief's under-five-minutes-per-page success measure has not been established by a moderated human study. The live page does not publish that speed claim.

## Structure, links, accessibility, and visual identity

- Root, Privacy, and Terms each return 200, contain one h1 and one main landmark, and have `lang="en"`.
- Direct Privacy/Terms loads and browser Back work at the URL level. Focus does not move to the route h1; see F-1-40.
- Every rendered link target was checked. Root anchors point to existing ids; Privacy and Terms return 200; GitHub Source returns 200; the checkout endpoint returns a 303 to the hosted checkout. No dead rendered link was found. The Source link still lacks an external-destination label; see F-1-57.
- `verify-url.sh` passed with no console/page error, one h1, main, title, lang, alt text, and labeled buttons.
- Axe 4.10.2 returned zero violations on root, Privacy, and Terms at desktop and 390 px. Keyboard, reduced-motion, export, offline, and mobile checks also pass in the clean suite.
- The risograph proofing-desk identity is distinct and matches `.factory/design.md`: warm paper, teal/coral/mustard inks, hard print shadows, proof slips, and original product art. It does not look like a generic SaaS template.
- The site skeleton still fails the routing, metadata, 404, navigation/footer, and limitations requirements recorded above.

## Missed leverage

No additional AI feature, sync, or cloud import is an obvious requirement. The brief defines a local human review layer and explicitly excludes automatic perfect reconstruction and OCR-model training. Adding model-based correction would introduce privacy/cost complexity without resolving a required job. The existing HTML, CSV, JSON, and issue-report exports cover the implied export need. No decorative AI feature or embedded provider key was found.

## What would make this perfect

1. Make `/demo` a true, resettable, visibly labeled sandbox that can never read or overwrite the real IndexedDB record.
2. Add `.factory/claims.json` and exact tagged clean-demo tests for every retained claim; remove or narrow any sentence that cannot be proved.
3. Add a real 404, complete route metadata, robots/sitemap, route focus announcements, and the required header/footer items.
4. Replace the flagged jargon, contextless headings, inconsistent saved-version terms, and three overlong README sentences with the supplied rewrites.
5. Re-run this entire checklist from a fresh browser and fresh clone. PASS only when the report has zero findings and every claim test has evidence.
