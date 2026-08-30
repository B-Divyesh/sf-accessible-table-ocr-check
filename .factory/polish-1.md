# Perfection-loop polish 1

- Work order: `accessible-table-ocr-check-polish-1`
- Base review: `1353bf8328297a3890e0df0e6cebcdb0b7381ae5`
- Review source: `.factory/review-1.md`
- Local evidence: `.factory/evidence/`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>

Every review finding is mapped below. Claim evidence names the exact `@claim:*` test in `.factory/claims.json`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Added direct `/demo` and `?demo=1`, separate `demo:table-proofing-desk` IndexedDB, persistent demo banner, Reset demo, and Start for real. Exit deletes demo state and reloads untouched real work. | `@claim:demo-ready`, `@claim:demo-isolation`; `.factory/evidence/polish-1-mobile-demo.png`; `.factory/demo.md` |
| F-1-2 | Added `.factory/claims.json` with one unique tagged test for each of 34 retained public claims. | Claim-tag uniqueness check; `npm run test:claims` |
| F-1-3 | Rewrote the first-screen job sentence and tested the full correction-to-scoped-HTML outcome. | `@claim:proof-and-export` |
| F-1-4 | Retained the concrete “Runs in your browser” fact and recorded the full request boundary. | `@claim:browser-local` |
| F-1-5 | Kept the no-upload fact and asserted a unique document marker never enters any request body. | `@claim:no-document-upload` |
| F-1-6 | Kept the offline fact and moved its check into a dedicated browser context that reloads, edits, and exports offline. | `@claim:offline-reload` |
| F-1-7 | Kept the either-order instruction and exercised image-first and JSON-first flows in fresh contexts. | `@claim:either-import-order` |
| F-1-8 | Kept the short schema instruction and tested documented cell/block inputs. | `@claim:ocr-schema` |
| F-1-9 | Verified all nine overlay names and both seeded order jumps. | `@claim:reading-order-overlays` |
| F-1-10 | Verified text, row, column, and role edits reach the preview and HTML. | `@claim:cell-corrections` |
| F-1-11 | Downloaded and parsed HTML, CSV, JSON, and the issue report. | `@claim:all-exports` |
| F-1-12 | Kept “$19 once” and asserted exact USD price, frequency, and registered checkout URL. | `@claim:desk-price` |
| F-1-13 | Completed every core export in a fresh context without a license. | `@claim:free-core` |
| F-1-14 | Renamed the feature to saved versions and tested save, edit, restore, and IndexedDB persistence with a recorded valid verdict. | `@claim:licensed-saved-versions` |
| F-1-15 | Replaced “local-first” with “Saved versions stay in this browser” and inspected its storage and requests. | `@claim:local-saved-versions` |
| F-1-16 | Reworded the state to “Free table checking is active” and completed the unlicensed workflow. | `@claim:free-state` |
| F-1-17 | Kept the merchant disclosure beside the exact Sociobot checkout target and tested both. | `@claim:merchant-of-record` |
| F-1-18 | Tested footer privacy wording across import, edit, export, storage, and reload. | `@claim:pages-stay-local` |
| F-1-19 | Split the README audience and job into two plain sentences. | `.factory/copy-audit.md`; `@claim:browser-local` |
| F-1-20 | Split the README capability list and mapped each outcome to overlay, correction, issue, and export tests. | `@claim:reading-order-overlays`, `@claim:cell-corrections`, `@claim:issue-detection`, `@claim:all-exports` |
| F-1-21 | Replaced “human QA layer” with “This tool helps a person check OCR. It does not create OCR.” | `@claim:human-check-only` |
| F-1-22 | Split privacy and limitation copy; an image-only import now proves there is no OCR-generation result. | `@claim:no-document-upload`, `@claim:human-check-only` |
| F-1-23 | README now links the direct isolated demo and uses the required action wording. | `@claim:demo-ready`; `.factory/demo.md` |
| F-1-24 | Documented and exercised PNG, JPEG, WebP, and SVG in both input orders. | `@claim:import-formats`, `@claim:either-import-order` |
| F-1-25 | Exercised top-level cells/blocks and first-page cells/blocks. | `@claim:json-shapes` |
| F-1-26 | Exercised text, position, role, reading order, and bounding-box normalization. | `@claim:field-normalization` |
| F-1-27 | Exercised percentage, normalized, and pixel coordinate fixtures. | `@claim:bbox-formats` |
| F-1-28 | Asserted 500 cells and coordinate 99 pass; 501 cells and coordinate 100 fail. | `@claim:import-limits` |
| F-1-29 | Split the README sentence; compared saved data before and after rejected imports, and retained visible legacy recovery. | `@claim:rejection-before-write`, `@claim:legacy-recovery` |
| F-1-30 | Exported sample Project JSON, imported it as OCR JSON, and compared every cell. | `@claim:project-round-trip` |
| F-1-31 | Standardized “saved versions” and inspected IndexedDB, localStorage, cookies, requests, and browser resources. | `@claim:indexeddb-only`, `@claim:local-saved-versions` |
| F-1-32 | Renamed the action “Clear table check”; confirmed, reloaded, and found no real working record. | `@claim:clear-table-check` |
| F-1-33 | Inspected the built shell for inline JS/CSS and hard-reloaded the primed demo offline. | `@claim:inline-offline-shell`, `@claim:offline-reload` |
| F-1-34 | Captured all demo requests and loaded resources; none were third-party. | `@claim:no-third-party-runtime` |
| F-1-35 | Split price, paid scope, local storage, and free entitlement into short sentences with separate tests. | `@claim:desk-price`, `@claim:licensed-saved-versions`, `@claim:local-saved-versions`, `@claim:free-core` |
| F-1-36 | Asserted the registered Sociobot checkout path and same-origin verification path. | `@claim:sociobot-billing-path` |
| F-1-37 | Split the gateway/privacy copy; deterministic API test proves request 21 returns 429 plus Retry-After. | `@claim:license-rate-limit`, `@claim:no-document-upload` |
| F-1-38 | Mapped the repeated merchant statement to the same billing contract test. | `@claim:merchant-of-record` |
| F-1-39 | Added a risograph-styled 404 renderer, physical `404.html`, and Static Web Apps `responseOverrides` so unknown deployed paths retain status 404. | Browser test “sets route metadata…”; `.factory/evidence/polish-1-desktop-404.png`; live `/definitely-not-a-real-route-qa` check |
| F-1-40 | Added real demo routing, History API navigation, popstate restoration, h1 focus, and polite announcements. | Browser test “sets route metadata…”; direct `/demo` reload tests |
| F-1-41 | Added canonical, route-specific descriptions, Open Graph/Twitter tags, 1200×630 original-art crop, SVG favicon, and 180px touch icon. | Browser metadata test; `public/assets/social-preview.jpg`; build output inspection |
| F-1-42 | Root title is 51 characters; Demo, Privacy, Terms, workbench, and 404 each set exact route titles. | Browser metadata and direct-route tests |
| F-1-43 | Added `robots.txt` and a sitemap containing root, demo, privacy, and terms. | Browser routing test request assertions |
| F-1-44 | Added Demo and Privacy to the four-link header; every footer now shows Param Factory and build `polish-1`. | Browser test “keeps the required header and footer skeleton…” |
| F-1-45 | Added “What this check cannot confirm” before pricing with concrete OCR, spelling, and accessibility limits. | `.factory/evidence/polish-1-desktop-root.png`; `@claim:human-check-only` |
| F-1-46 | Replaced the 25-word opening with two short audience/job sentences. | `.factory/copy-audit.md` (README max 15 words) |
| F-1-47 | Split the 28-word capability sentence into two short sentences. | `.factory/copy-audit.md` |
| F-1-48 | Split rejection and legacy recovery into separate short sentences. | `.factory/copy-audit.md`; `@claim:rejection-before-write`, `@claim:legacy-recovery` |
| F-1-49 | Removed “QA layer” everywhere and named librarians/accessibility reviewers directly. | `.factory/copy-audit.md`; first-screen screenshots |
| F-1-50 | Standardized user-facing records/actions on “table check.” | `.factory/copy-audit.md` terminology table |
| F-1-51 | Renamed the heading “Trace the reading order.” | Landing screenshots; copy audit row 28 |
| F-1-52 | Renamed the heading “Label cells and headers.” | Landing screenshots; copy audit row 30 |
| F-1-53 | Renamed the heading “Export the checked table.” | Landing screenshots; copy audit row 32 |
| F-1-54 | Replaced checkpoints/snapshots/before-after-state copy with “saved versions” across app, README, Privacy, and Terms. | `@claim:licensed-saved-versions`; copy audit terminology |
| F-1-55 | Primary action is “Try it with sample data,” followed by the exact two-error outcome. | `.factory/evidence/polish-1-mobile-root.png`; `@claim:demo-ready` |
| F-1-56 | Privacy h1 is “How we handle your documents”; Terms h1 is “Terms of use.” | Direct legal-page browser test |
| F-1-57 | Footer label is “Source on GitHub (opens external site)” with a new-tab relationship. | Skeleton browser test; landing screenshots |

## Earlier verification defects

The full regression suite still passes the previously repaired 99×99 grid bound, 500-cell limit, hero aspect ratio, accessible wordmark name, 44px mobile targets, CSP/framing/cache headers, offline reload, and 21st-request rate limit. No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists beyond review 1 and this report.
