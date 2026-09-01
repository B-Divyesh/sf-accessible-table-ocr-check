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

## Known gaps

None known. Deployment and cold-live verification are recorded after the release command runs.
