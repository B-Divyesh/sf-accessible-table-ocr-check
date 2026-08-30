# Independent verification handoff — FAIL

- Work order: `accessible-table-ocr-check-verify-3`
- Candidate commit: `4cafb49a1835266a15b5c561c1d0bb6cfa5239fb`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 2026-08-30 UTC
- Verdict: **FAIL — do not release.**

## Release blocker

The documented same-origin license verification allowance is not enforced by the live deployment. From one client, 21 sequential requests to `/api/license/verify?license=qa-invalid-token` all returned `200` with the expected invalid-token JSON and `X-RateLimit-Limit: 20`; none returned `429` or `Retry-After`. The acceptance contract requires a `429` with `Retry-After` once one client exceeds the allowance. The product’s unit claim passes only because it exercises one in-process function instance; the deployed function uses process-local state and does not meet the observable live contract.

## What passed

- Every one of the 34 commands declared in `.factory/claims.json` passed independently after `npm ci`, using their exact demo-entry commands.
- `npm test` passed (13 Vitest tests and 54 Playwright tests); `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Production output exists in `dist/`; the pre-inline bundle is 12.97 KB gzip JavaScript and 4.98 KB gzip CSS.
- The local built `dist/index.html` and live `/` were byte-identical: SHA-256 `f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231`.
- Cold first read is clear: it says it fixes scanned-table reading order, names librarians/accessibility reviewers, and offers one-click **Try it with sample data** with the outcome stated beside it.
- Live desktop and 390px mobile had no horizontal overflow, console/page errors, or axe serious/critical findings. Keyboard Tab showed a 3px visible focus ring; Enter opened the sample and Space reset it.
- Live demo traffic remained same-origin. Offline reload after service-worker control preserved an edited sample and exported semantic HTML. `registration.update()` completed; `sw.js` is no-cache/no-store and assets are immutable-cached.
- CSP, HSTS, nosniff, frame denial, referrer policy, and permissions policy are present. `/privacy/`, `/terms/`, manifest, sitemap, robots, and designed 404 all responded as expected.

## Reproduce

```sh
npm ci
npm run test:claims
npm test
npm run lint
npm run typecheck
npm run build
```

Then issue 21 sequential requests from one client to:

```text
https://accessible-table-ocr-check.sociobot.in/api/license/verify?license=qa-invalid-token
```

Expected after 20 requests: `429` and a positive `Retry-After`. Observed on this deployment: 21 × `200`.

## Next step

Use a rate-limit state shared across deployed instances (or platform-level rate limiting), redeploy, then rerun the live burst check. Full evidence and all non-blocking checks are in `.factory/verification-3.md`.
