# Polish 1 handoff — PASS

- Work order: `accessible-table-ocr-check-polish-1`
- Repaired review base: `1353bf8328297a3890e0df0e6cebcdb0b7381ae5`
- Product repair commit: `6d149af1a94c3287ed43cf83d5938ad3a0b76d99`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Deployed: 30 August 2026 UTC

## Outcome

All 57 findings in `.factory/review-1.md` are resolved. The product keeps its risograph proofing-desk identity and remains a static offline PWA.

The sample is now an isolated demo backed by `demo:table-proofing-desk`. It has a persistent banner, Reset demo, Start for real, direct `/demo`, and `?demo=1` entry.

The landing page now names the job and audience on the first screen. It uses the required sample action and explains its two-error result beside the button.

The site now has route titles, descriptions, canonical links, social metadata, touch icon, robots, sitemap, History API focus handling, consistent navigation/footer, and a styled real 404.

All public promises are listed in `.factory/claims.json`. Each claim ID appears in exactly one test title.

## Clean verification

The complete suite passed locally on Node 22.23.2 and Playwright 1.58.2:

```sh
npm ci --ignore-scripts
npm audit --audit-level=low
npm run typecheck
npm run lint
npm test
npm run build
```

- Audit: zero vulnerabilities.
- Vitest: 13/13 passed across logic and API tests.
- Playwright: 49 passed across desktop Chromium and Pixel 5 at 390×844; 5 intentional project skips.
- Axe integration: zero serious or critical findings on landing, demo, Privacy, Terms, and 404 states.
- Browser health: zero console or page errors on root, demo, Privacy, and Terms.
- Responsive: no horizontal overflow at 390px; all tested touch targets remain at least 44px.
- Build: `dist/index.html` exists and is 57,920 bytes after inline bundling.
- Pre-inline bundles: JavaScript 36,517 bytes (12,970 gzip); CSS 19,457 bytes (4,980 gzip).
- Art: mobile hero 22,664 bytes; desktop hero 110,030 bytes; social image 138,697 bytes.
- Local Lighthouse mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7s, TBT 180ms, CLS 0.

Every one of the 34 commands in `.factory/claims.json` then passed independently from fresh clone `/tmp/accessible-table-claims.3RZAm2`. This included dedicated offline context, privacy request capture, import limits, all exports, demo isolation, and the 21-request gateway contract.

## Deployment and live evidence

The committed build was deployed only to Azure Static Web App `sf-accessible-table-ocr-check`, including its managed same-origin API. No shared DNS, database, key-vault, or unrelated resource operation was performed.

- Local/live `index.html` SHA-256: `f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231`.
- `/`, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, the social image, and touch icon return 200.
- `/definitely-not-a-real-route-qa` returns HTTP 404 and renders the designed page.
- Factory `verify-url.sh`: title present, `lang=en`, one h1, main present, zero missing alt attributes, zero unlabeled buttons, and zero console errors.
- Live isolated-demo smoke: nine cells and two errors loaded; correction and scoped HTML export passed; Reset demo restored the sample.
- Demo exit restored a seeded real record byte-for-byte and removed the demo record.
- Live route focus passed on Privacy navigation and browser Back.
- Live offline hard reload restored the demo, displayed the offline state, and remained editable.
- Live request log recorded no off-origin requests during the core/demo flow.
- Live axe scans found zero serious or critical findings on root, demo, Privacy, Terms, and 404.
- Live gateway burst: requests 1–20 returned 200; request 21 returned 429 with `Retry-After: 58`.
- Live security headers include CSP with header-only `frame-ancestors`, HSTS, Permissions-Policy, nosniff, strict referrer policy, and frame denial.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 1.1s, TBT 120ms, CLS 0, Speed Index 0.9s.

Evidence files are under `.factory/evidence/`. The finding-by-finding ledger is `.factory/polish-1.md`.

## Run and verify

```sh
npm ci
npm run test:claims
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

## Remaining items

No review finding or product defect is left open. The brief’s under-five-minutes-per-page outcome still requires a moderated human study; the product does not publish that unmeasured speed claim.
