# Adversarial first-read review 3 — FAIL

- Product: Accessible Table OCR Check
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Candidate reviewed: `794aa3c9765cef1572b83fb7b2a88abada8a30e2`
- Review date: 2 September 2026 UTC
- Contexts: fresh Chromium at 390 × 844 and 1440 × 900; fresh local clone

## Verdict

**FAIL.** The cold landing page, direct demo, table-correction workflow, local-storage isolation, offline reload, accessibility sweep, routing, and all declared claim commands work. Three remaining findings prevent a PASS. Two are regressions of the prior review: paid legal/price assertions are tested only by repeating the product's own wording, and the unexplained legal term “merchant of record” has returned. The landing also makes an unlisted artwork-provenance claim.

## Cold first read

Before scrolling, at both sizes, this reviewer understood:

- **What:** “Fix a scanned table’s reading order.”
- **For whom:** “For librarians and accessibility reviewers who compare OCR with a scan before sharing a table with screen-reader users.”
- **First action:** “Try it with sample data,” followed by “Opens a scanned transit table with two reading-order errors.”

This passes the five-second opening gate. The first mobile demo screen also passes: it has the persistent “Demo — sample data, nothing is saved” banner, “Transit access survey · 9 cells · 2 reading-order errors,” the first flagged jump, and **Move Yes later** above the fold.

## Findings

### Blocking

#### F-2-3 reopened / F-3-1 — The paid-purchase test does not prove the paid-purchase claim

- **Exact claim/location:** landing, Privacy, Terms, and README: “US$12 one-time purchase,” “Sociobot, through Dodo, is the merchant of record and handles payment and refunds,” and “An approved refund revokes the Desk license automatically.”
- **Exact test:** `tests/e2e/claims.spec.ts`, `shows the exact one-time price, merchant, and refund terms before checkout @claim:paid-purchase-terms`.
- **Evidence:** the test visits `/`, `/privacy/`, and `/terms/`, then asserts those same strings are visible. It never reads a signed billing product record, checks hosted checkout terms, or exercises/refutes a refund event. A simultaneous change to the copy and test would still pass. A read-only live check did reach the registered Dodo session and observed `$12.00` and “One-time,” but that manual observation is not the declared clean-clone claim test and does not verify merchant/refund/revocation responsibility.
- **Why this blocks:** price, seller/refund responsibility, and paid-feature loss are buyer-reliance claims. The claims contract requires an observable outcome, not a copy assertion. This reopens the prior merchant/price/refund proof defect (F-2-2, F-2-3, F-2-7).
- **Concrete fix:** split the claim. Add a deterministic recorded product/checkout fixture sourced from the billing product metadata and assert USD 12 plus one-time frequency against it; assert the rendered disclosure matches that fixture. Obtain a stable Sociobot/Dodo terms source for merchant/refund responsibility and a recorded refund/revocation response for the Desk entitlement, or remove those legal claims until such a source exists. The test must inspect that source, not the page's own text.

### Minor

#### F-2-13 reopened / F-3-2 — Payment wording uses unexplained legal jargon

- **Exact location:** landing, Privacy, Terms, and README: “Sociobot, through Dodo, is the merchant of record and handles payment and refunds.” Privacy also says the token is stored in “localStorage.”
- **Why this is a finding:** “merchant of record” and “localStorage” require legal/browser knowledge. The prior repair record says F-2-13 removed legal/payment jargon; the current visitor-facing copy has reintroduced it. A first-time buyer needs to know who takes payment and what happens to their data, not a specialist term.
- **Concrete fix:** use “Sociobot and Dodo take payment and handle refunds.” Use “browser storage” in visitor-facing policy copy. If the legal phrase must remain, explain it in parentheses: “the legal seller responsible for the payment.”

#### F-3-3 — Artwork provenance is an unlisted landing claim

- **Exact location:** landing footer: “The proofing-desk artwork was generated for this product.”
- **Why this is a finding:** this is a factual public claim, but `.factory/claims.json` has no entry for it. The design document records provenance, but it is not a sandbox test that can establish the public statement.
- **Concrete fix:** remove the sentence from the visitor-facing footer and retain provenance in `.factory/design.md`, or add a reproducible provenance-record check if the product intends to make the assertion publicly.

## Copy audit

The complete verbatim landing and README sentence inventory, including word count and result for every unit, was reread in [`.factory/copy-audit.md`](copy-audit.md). It contains **59 landing units** (maximum 18 words) and **66 README units** (maximum 22 words). The inventory is current against the live text and README. No unit exceeds 22 words and no banned marketing adjective was found.

Flagged copy is limited to F-2-13/F-3-2 above. Headings identify their sections; actions name their outcomes, including **Try it with sample data**, **Move Yes later**, **Reset demo**, **Review 2 issues**, **Export issue report**, **Export project JSON**, and **Restore Desk license**. Terms are consistent: table check, cells, saved versions, demo, source image, and OCR JSON.

## Demo, sandbox, and privacy checks

- One click reaches `/demo`; the first view shows a realistic nine-cell transit table, nine numbered overlays, two seeded reading-order errors, and a correction action.
- The banner, **Reset demo**, and **Start for real** are present. Reset restores the two defects. Exit removes `demo:table-proofing-desk` and preserves the real `table-proofing-desk` record byte-for-byte.
- The direct demo and full correction/export flow made only same-origin requests. The document-marker claim test now triggers the recorded license request and confirms the marker is absent from its URL, headers, and body.
- A dedicated fresh browser context primed the demo, went offline, reloaded, corrected the sample, and exported CSV.

## Claims and local gates

A new clean clone at the candidate commit completed `npm ci` with 0 vulnerabilities. Each of the 37 commands listed in `.factory/claims.json` was run from that clone; all returned PASS. This includes the three Vitest commands (`issue-detection`, `license-rate-limit`, and `license-fails-closed`) and 34 Playwright commands. The correctness concern in F-3-1 is therefore about what the passing `paid-purchase-terms` test asserts, not a command failure.

`npm run lint`, `npm run typecheck`, and `npm run build` pass; build output includes `dist/` with 37.77 kB JavaScript (13.23 kB gzip). The final `npm test` regression run is recorded in the handoff.

## Structure, accessibility, and links

- `/`, `/demo`, `/privacy`, `/terms`, and an unknown route render distinct titles, one h1, and one main. Direct `/demo` opens the populated checker; direct legal routes and the designed 404 work. Back navigation returns focus to the target heading.
- Root metadata, canonical, OG/Twitter image, favicon, robots, sitemap, header/footer, and security headers are present. The unknown live route returns HTTP 404.
- The live landing links resolve; the registered checkout returns a 303 to Dodo, and the GitHub repository returns 200. No dead internal link was found.
- Axe reported zero violations on all five routes at both viewports. Normal live routes logged no console/page errors. The visual system is the distinct warm-paper risograph proofing desk specified in `.factory/design.md`, not a generic SaaS treatment.

## Earlier findings

Every earlier review, polish report, and handoff was read. The functional/demo/routing/metadata/accessibility repairs for F-1-1 through F-1-57 and F-2-1, F-2-4 through F-2-12, and F-2-14 are confirmed in current code and live behavior. F-2-2/F-2-3/F-2-7 are reopened by F-3-1 because the current test is still self-referential. F-2-13 is reopened by F-3-2 because the legal jargon has returned. No other earlier finding regressed.

## Missed leverage

No AI feature is missing. The brief asks for a local human check of supplied OCR and explicitly excludes OCR creation and automatic reconstruction. HTML, CSV, project JSON, and issue-report exports cover the implied export need; model inference would add privacy/cost without advancing the stated job.

## What would make this perfect

1. Replace self-referential paid-purchase assertions with deterministic billing-contract evidence, or remove legal claims that cannot be tested.
2. Replace/explain payment and browser-storage jargon.
3. Remove or test the public artwork-provenance statement.
4. Re-run this full clean-clone and cold-browser review with zero findings.
