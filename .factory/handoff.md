# Polish 2 handoff

## Completed

- Fixed every F-2-1 through F-2-14 finding in `.factory/review-2.md`; the exact mapping is in `.factory/polish-2.md`.
- Kept the isolated `/demo` storage boundary and made the phone demo show a live issue result and correction above the 844 px fold.
- Removed price, merchant, card-data, and refund claims that cannot be proved from a non-mutating billing contract.
- Added outcome-level claim coverage for license-request document privacy, local token/cadence, revoked licenses, fail-closed limiting, and direct route documents.
- Updated plain-language copy, catalog description, interactive labels, claims manifest, and build id (`polish-2`).

## Verification

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build` — produced `dist/`; inline JS 13.09 KB gzip and CSS 5.08 KB gzip.
- `npm test` — 15 Vitest tests passed; 59 Playwright tests passed, 7 expected desktop/mobile skips.
- Targeted outcome check: `npm run test:e2e -- --project=chromium --grep '@claim:revoked-license'` passed.
- Fresh clone: all 35 commands named in `.factory/claims.json` passed independently; results are retained at `/tmp/accessible-table-ocr-check-claim-results.log` in the worker.

## Deployment and live verification

- Released commit `2218cd00b1a3a993ebc7ce034bb9aba36f0e49c5` with `/opt/fleet/lib/deploy-static.sh accessible-table-ocr-check dist`.
- Cold live mobile browser suite: 9 passed, 5 expected project skips. It includes the 390 × 844 demo-above-fold check, routes, focus, offline reload, 404, and layout checks.
- `/opt/fleet/lib/verify-url.sh` passed on the live root. Evidence: `.factory/evidence/polish-2-live/verify.json` and its desktop/mobile screenshots. It found title, `lang=en`, one h1, main, image alt text, no unlabeled buttons, and no console errors.
- The live app suite uses Playwright Axe on landing and demo; no serious or critical violations were found. The standalone Axe CLI could not locate a Chrome binary in this worker, so the existing Playwright Axe integration is the recorded accessibility evidence.
- Cold live unknown route check: `/does-not-exist-polish-2` returned HTTP 404. Live `/demo` served `polish-2`, `demo-result`, and `Move Yes later`.

## Known gaps

None known.
