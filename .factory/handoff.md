# Review 1 handoff — FAIL

- Work order: `accessible-table-ocr-check-review-1`
- Reviewed candidate: `cf20e1e7de0070dc367ca248849e6a4c60fd198e`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 2026-08-30 UTC

## What was done

Completed the adversarial first-read review at 390 × 844 and 1440 × 900 from fresh browser contexts. Audited all landing/README copy with word counts, exercised the sample and offline flow, inspected storage isolation, checked every public claim against the required manifest, crawled rendered links and routes, checked metadata/404/history/focus, ran live accessibility and request-log checks, and reverified every defect from the earlier verification reports.

No product code was modified. The complete findings and proposed fixes are in [`.factory/review-1.md`](review-1.md).

## Decision

**FAIL.** The main blockers are:

- the sample autosaves into the same IndexedDB record as real work and has no demo banner, reset, or start-real action;
- `/demo` is not a direct demo entry and `.factory/demo.md` is absent;
- `.factory/claims.json` and all `@claim:*` tests are absent, leaving every public claim unlisted under the supplied protocol;
- arbitrary unknown paths return a 200 landing page instead of a designed 404.

Metadata, focus-on-route-change, navigation/footer completeness, landing limitations, and copy issues are also recorded.

## Verification performed

From a fresh local clone:

```sh
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
```

All commands passed. Vitest passed 12 tests. Playwright passed 15 applicable runs with 5 intentional project skips. The clean `dist/index.html` matched the live root SHA-256 `359fef1eaa680837b63927c9e7e76850c6984097770e735817eff060236f5488`.

Live checks also confirmed:

- zero axe violations on root, Privacy, and Terms at desktop and mobile;
- no console errors in audited flows;
- no off-origin requests during sample correction, export, and offline reload;
- offline reload restored the saved proof;
- prior defects for grid bounds, image ratio, accessible naming, touch targets, response headers, and rate limiting remain fixed;
- first `429` occurred on license-verification request 21 with `Retry-After: 58`.

## Anything left

Resolve every finding in `.factory/review-1.md`, then rerun the complete review from scratch. The existing process-local rate limiter remains the earlier handoff's disclosed operational limitation, and the brief's human completion-time target still needs a moderated study.
