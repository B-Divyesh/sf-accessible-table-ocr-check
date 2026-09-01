# Independent product verification 6 — FAIL

- Work order: `accessible-table-ocr-check-verify-6`
- Candidate and clean-checkout HEAD: `bd6fa15a4e94c3de00e26871a553dbe71cec31ee`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Date: 2026-09-01 UTC
- Environment: Node 22.23.2, npm 10.9.8, Chromium / Playwright 1.58.2
- Result: **FAIL — the license-verification endpoint does not enforce its documented request allowance during simultaneous requests from one client.**

No product source code was changed during this verification.

## Release-blocking finding

### High — simultaneous requests are not counted against one shared allowance

The documented allowance is 20 verification requests per client per 60-second window. The sequential live check passed: requests 1–20 returned `200`, then request 21 returned `429` with `Retry-After: 58` and `X-RateLimit-Policy: signed-client-window`.

A separate live check sent 25 verification requests simultaneously from one client. All 25 completed in 1,119 ms with `200`. No response returned `429` or `Retry-After`. Every response reported function instance `17ed5def4d21`; reported remaining counts repeatedly returned to 19 or 18 instead of advancing through one shared count.

This does not meet the acceptance requirement that a single client receives `429` with `Retry-After` after request 20. The release must remain blocked until simultaneous requests share an authoritative, atomic product-scoped count. Add a live regression that starts more than 20 requests together and requires every request beyond the allowance to return `429` with a positive `Retry-After`.

Evidence: [live-concurrency.json](evidence/verification-6/live-concurrency.json) and [live-rate-limit.txt](evidence/verification-6/live-rate-limit.txt).

## First-read gate — PASS

The cold live first screen answers all three required questions in plain words:

- What it does: “Fix a scanned table’s reading order.”
- Who it is for: librarians and accessibility reviewers comparing OCR with a scan before sharing with screen-reader users.
- What to choose first: **Try it with sample data**, followed by “Opens a scanned transit table with two reading-order errors.”

The action opens `/demo` in one click. The demo contains nine cells, nine numbered source overlays, two seeded reading-order issues, and the persistent “Demo — sample data, nothing is saved” banner.

## Claims contract — PASS

`.factory/claims.json` is present with 34 entries. Every listed command was run separately from the clean checkout through the demo entry point. **34 of 34 commands passed.** This includes demo isolation, local storage, all imports and exports, boundaries and recovery, offline reload, paid saved-version fixtures, issue detection, and the sequential allowance fixture.

The live concurrency finding above is additional required backend evidence. The current allowance claim test covers sequential carried state but does not cover simultaneous requests.

## Candidate and live identity — PASS

`npm ci` was run from the clean checkout, followed by the exact production build. All 21 checked public artifacts are byte-identical to `dist/`, including the root, demo, legal pages, 404, service worker, manifest, icons, compiled assets, and product artwork.

```text
dist/index.html and live root
SHA-256  6f80d0b9f7299454050a4f7c1005999833ca3b6cea92eb75c71370030fca3cf1
Size     58,121 bytes
```

Evidence: [live-identity.json](evidence/verification-6/live-identity.json).

## Local quality gates — PASS

```text
npm ci             PASS — 142 packages; 0 audit vulnerabilities
npm test           PASS — 15 unit/API tests; 53 browser tests; 7 declared skips
npm run lint       PASS
npm run typecheck  PASS
npm run build      PASS — dist/ produced
```

The production build emitted 36,597 bytes of JavaScript (13.01 KB gzip) and 19,578 bytes of CSS (4.98 KB gzip) before inlining. The mobile hero is 22,664 bytes, the full hero is 110,030 bytes, and no fonts load at runtime. These are within the 200 KB JavaScript, 50 KB CSS, 120 KB font, and 300 KB mobile-image budgets.

## End-to-end product checks — PASS

- `npm run test:e2e:live`: **52 passed, 8 declared live/project skips** across desktop and 390×844 mobile.
- Normal flow: the sample opens populated, a keyboard correction removes both seeded reading-order issues, and HTML, CSV, project JSON, and issue-report downloads complete.
- Export checks confirm scoped column and row headers, corrected reading order, and the source-page reference.
- Boundaries: 500 cells and grid coordinate 99 are accepted; 501 cells and coordinate 100 are rejected before replacing stored work.
- Invalid JSON produces “This is not valid JSON. Export OCR results as JSON and try again.” in a status region, and the landing workflow remains available.
- Older out-of-range stored coordinates are bounded to 99 with a visible review notice.
- Image-only input remains an honest empty OCR state; the product does not claim to create OCR.
- A 640 CSS-pixel viewport, representing 200% browser zoom from 1280×900, retains the landing action and demo exports without document-level horizontal overflow.

## Accessibility, keyboard, and responsive checks — PASS

Fresh axe checks on landing, demo, privacy, terms, and 404 at both 1440×900 and 390×844 found **zero violations at any severity**. Every route has `lang="en"`, one main `h1`, a `main` landmark, complete image alternatives, and no undersized visible control. Neither viewport had unexpected horizontal overflow.

The first Tab focuses **Skip to main content**. Enter moves to `#main`. Keyboard focus uses a visible 3px coral outline. Enter opens the demo, and Space activates the reading-order correction. Reduced-motion behavior passed the browser suite. Normal routes produced no console or page errors; the expected 404 document request is the only recorded failed-resource console line.

The factory URL check passed: title, language, one `h1`, main landmark, image alternatives, labeled buttons, and no load errors.

Evidence: [independent-live.json](evidence/verification-6/independent-live.json), [verify.json](evidence/verification-6/verify.json), and the desktop/mobile screenshots in `evidence/verification-6/`.

## Privacy and response policy — PASS

The complete independent demo edit, four-export, and reload flow made five requests, all to the product origin. A unique document marker appeared in no request body. The unlicensed demo created no localStorage key or cookie; its working data appeared only in `demo:table-proofing-desk` IndexedDB. No analytics, CDN font, tracker, or third-party runtime script request was observed.

Live HTML responses use `no-cache, must-revalidate`; `sw.js` uses `no-cache, no-store, must-revalidate`; the manifest uses JSON with must-revalidate caching; and the hero asset uses one-year immutable caching. Response headers include a self-restricted CSP with header-delivered `frame-ancestors 'none'`, HSTS, `nosniff`, `X-Frame-Options: DENY`, strict referrer policy, and a restrictive permissions policy.

## PWA and offline checks — PASS

The manifest has a versioned start URL, standalone display, 192px and 512px icons, and a maskable 512px icon. The live service worker controls `/demo`, activates cache `proof-desk-v3`, and completes `registration.update()` without errors. After a connected prime, `/demo` reloads offline, shows the offline notice, retains the populated workbench, and remains editable.

A controlled byte-changed worker served from the candidate build displayed “A newer proofing desk is ready” with a 97.39×44px **Update now** action and no console error.

Evidence: [service-worker-update.json](evidence/verification-6/service-worker-update.json) and [independent-live.json](evidence/verification-6/independent-live.json).

## Performance — PASS

Lighthouse 12.8.2 mobile against the live URL:

```text
Performance      93
Accessibility   100
Best Practices  100
SEO             100
FCP              0.93 s
LCP              1.35 s
TBT              326.5 ms
CLS              0
Total bytes      105,452
```

The required Performance score, LCP, CLS, and bundle budgets pass. Evidence: [lighthouse-live.json](evidence/verification-6/lighthouse-live.json).

## Other contract checks

- README, MIT license, privacy page, terms page, demo documentation, design thesis, provenance, and copy audit are present.
- Landing and README claim-like statements are represented in `.factory/claims.json`; no unlisted product claim was found.
- The single-mode light visual thesis is documented and product-specific.
- Sign-in is not required, so the tenant check is not applicable.
- Package-consumer checks are not applicable because this is a PWA, not a library or CLI.

## Defects by severity

- **High, release-blocking:** simultaneous verification requests from one client do not share the documented 20-request allowance.
- **Medium:** none found.
- **Low:** none found.

## Known gap

The brief’s success measure calls for a moderated 30-page study demonstrating that every seeded order issue is found and each page exports in under five minutes. That study remains unmeasured and is not presented as a tested product claim.
