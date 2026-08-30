# Repair 2 handoff — PASS

- Work order: `accessible-table-ocr-check-repair-2`
- Repaired candidate: `4cafb49a1835266a15b5c561c1d0bb6cfa5239fb`
- Verifier report commit: `f525f448745a21a423297dde6ba140b408ea7509`
- Repair commits: `829abd6`, `1a2c467`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 30 August 2026 UTC

## Outcome

The release blocker is repaired without changing the static offline-PWA artifact class. The license proxy now carries an IP-bound, HMAC-signed request-window counter in a secure `HttpOnly` same-site cookie. The signed state follows a browser between function instances, while each instance retains a local replay guard. A missing production signing secret fails closed with `503` and `Retry-After`.

Only the scoped Azure Static Web App `sf-accessible-table-ocr-check` was read, configured, and deployed. Its `RATE_LIMIT_SECRET` app setting was generated during deployment and was not printed or committed. No database, key vault, shared Sociobot service, DNS record, or unrelated resource was read or changed.

## Reproduction before the repair

The original live endpoint was exercised before source changes. Forty rapid requests used fresh HTTP connections to reproduce function-worker distribution. Request 21 returned `200`, no request returned `429`, and ten requests returned upstream `503`. This reproduced the verifier's root cause: the process-local `Map` did not enforce one client window across workers.

## Regression coverage

- `tests/api.test.ts` retains the exact 20-allowed/21st-blocked claim test.
- A new isolated-instance test loads two independent function modules, alternates requests between them, carries the signed client state, and asserts 20×`200` followed by `429`.
- A missing-secret test asserts fail-closed `503` plus `Retry-After`.
- `scripts/verify-live-rate-limit.mjs` exercises the deployed endpoint and validates the policy header, boundary status, and positive `Retry-After`.
- Playwright now accepts `PLAYWRIGHT_BASE_URL`, so the desktop and 390px browser matrix can run unchanged against production with `npm run test:e2e:live`.

## Clean local verification

From a clean dependency install:

```sh
npm ci
npm audit --audit-level=low
npm test
npm run test:claims
npm run lint
npm run typecheck
npm run build
```

Results:

- Audit: 0 vulnerabilities.
- Unit/integration: 15 passed, including the two-instance limiter regression.
- Local browser suite: 49 passed across desktop Chromium and 390×844 mobile; 5 intentional project skips.
- Claims: 2 tagged unit tests and 16 tagged Chromium scenarios passed. All 34 claim records remain covered.
- Lint and TypeScript: passed.
- Production build: `dist/` created; JavaScript 36.52 KB raw / 12.97 KB gzip; CSS 19.46 KB raw / 4.98 KB gzip.
- Existing keyboard, focus, form, mobile target, axe, privacy-request, offline reload, service-worker, import boundary, export, demo isolation, and route tests all remained green.

## Deployment and live verification

The built app and managed API were uploaded to the existing `sf-accessible-table-ocr-check` production Static Web App. DNS and unrelated infrastructure were not touched.

- Live limiter: requests 1–20 returned `200`; request 21 returned `429` with `Retry-After: 58`.
- The same live sequence observed 2 distinct function-instance fingerprints and retained one allowance across them.
- Policy header: `X-RateLimit-Policy: signed-client-window`; limit header: `X-RateLimit-Limit: 20`.
- Local and live `index.html` SHA-256: `f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231`.
- Live Playwright: 48 applicable checks passed across desktop and 390px mobile; 6 expected skips (project-specific checks plus the local-only config-artifact inspection).
- Live browser checks covered the real workflow, keyboard operation, responsive layout, axe serious/critical findings, privacy request capture, offline reload, legal routes, 404 handling, and console/page errors.
- Factory URL verification: HTTP 200, title present, `lang=en`, one `<h1>`, `<main>` present, no missing image alt, no unlabeled button, and no console error.
- Routes `/`, `/demo`, `/privacy/`, `/terms/`, `/manifest.json`, `/sw.js`, `/robots.txt`, `/sitemap.xml`, and the hero asset returned 200. The unknown route returned 404.
- Security headers include CSP with header-only `frame-ancestors`, HSTS, nosniff, frame denial, strict referrer policy, and restrictive permissions policy.
- Live mobile Lighthouse: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0s, LCP 1.4s, TBT 190ms, CLS 0.

Evidence is in `.factory/evidence/repair-2-live/`.

## Run and verify

```sh
npm ci
npm test
npm run test:claims
npm run lint
npm run typecheck
npm run build
npm run test:e2e:live
npm run test:live-rate-limit
```

## Remaining item

The brief's under-five-minutes-per-page success measure still needs a moderated study with real users and 30 scanned pages. The product does not publish that unmeasured timing claim. No release-blocking code or QA finding remains open.
