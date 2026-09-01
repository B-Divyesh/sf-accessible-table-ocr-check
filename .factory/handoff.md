# Review 2 handoff — FAIL

- Work order: `accessible-table-ocr-check-review-2`
- Candidate: `8f5f980f3bf6792cf76f1edf2f9787e6e373ad1b`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Reviewed: 1 September 2026 UTC

## Outcome

The adversarial review is recorded in [`review-2.md`](review-2.md). No product code, infrastructure, DNS, billing configuration, or product data was modified.

**FAIL.** The landing page is clear and the core product is functional, but the first 390 px demo screen does not expose the source, issue result, cells, or a correction action. Price, merchant-of-record, and license-request privacy tests do not prove their claimed outcomes. Additional public claims on Privacy, Terms, and README are absent from `.factory/claims.json`. Minor copy/action and audit-document defects also remain.

## Verification performed

From a fresh clone at the candidate commit:

```text
34/34 claims.json commands independently  PASS
npm test                                  PASS — 16 unit/API; 53 browser; 7 skipped
npm run build                             PASS — dist/ produced
npm run lint                              PASS
```

The clean `dist/index.html` and live root are byte-identical: 58,121 bytes, SHA-256 `6f80d0b9f7299454050a4f7c1005999833ca3b6cea92eb75c71370030fca3cf1`.

Live checks confirmed:

- cold first screens at 390 × 844 and 1440 × 900;
- demo population, reset, exit, real-data isolation, same-origin requests, and offline reload;
- route titles, metadata, Back/Forward focus, designed HTTP 404, links, robots, sitemap, icons, and social image;
- zero axe violations on root, demo, Privacy, Terms, and 404 at both widths;
- the concurrent rate limit: counts 1–20 returned 200 and 21–25 returned 429 plus positive `Retry-After` across four instances.

## Required next work

Resolve F-2-1 through F-2-14 in `review-2.md`, especially the phone demo and outcome-level billing/privacy claim tests. Re-run every claims command independently and repeat the complete review; do not accept on aggregate suite results alone.
