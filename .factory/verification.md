# Independent product verification — FAIL

- Verified candidate: `9dbc8495b15f462364be7718aea7ac85896ae473`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Verification date: 2026-08-28 UTC
- Environment: Node.js 22.23.2, npm 10.9.8, Chromium from Playwright 1.58.2
- Result: **FAIL — do not promote this candidate.** Core proofing works, but the mandatory API rate-limit check fails and malformed grid coordinates can create an effectively unbounded, persistent render workload. Additional accessibility and responsive-image defects remain.

## Candidate and deployment identity

- The checkout was clean before verification and `HEAD` was exactly the requested commit.
- `origin/main` resolved to the same commit.
- A fresh `npm run build` produced `dist/index.html` SHA-256 `827313ab96188ce3a24dcc83ac5537863c09eb24bc746de2a0a0f4efb4bbf5fd` (47,828 bytes). The live root returned the identical hash and byte count.
- Live JS and CSS also matched the fresh build byte-for-byte:
  - `index-G5yYUnPI.js`: `a8672891023a520340adad4320c74a727388c69e30aca445826e64cd3d2edb7d`
  - `index-DR6SXlW6.css`: `6b75a1ee0285c2efd498ea3997cf5d47cf5b434d815266cd12c55b8b967f93ae`

This confirms that the live deployment under test is the candidate, not a stale build.

## Release-blocking defects

### High — required license API rate limiting is absent

The product calls `GET https://api.sociobot.in/api/v1/products/accessible-table-ocr-check/verify?license=...`, so the work order explicitly requires a burst to start returning `429` with `Retry-After`.

Fresh test evidence: 150 sequential requests completed in 1,767 ms. All 150 returned `200`; none returned `429`, and no `Retry-After` header was observed. Therefore there is no threshold to record through at least 150 requests per 1.77 seconds. A normal invalid-token response was `200`, `cache-control: no-store`, and `{"expires_at":null,"reason":"invalid","valid":false}`.

Expected: the endpoint starts returning `429` during the burst and supplies `Retry-After`.

### High — unbounded row/column values can persist an enormous render workload

OCR block count is capped at 500, but imported `row` and `column` values have no upper bound. The preview and all exports allocate a matrix from the maximum values. The editor likewise declares `max="99"` but accepts and persists `100` because the change handler only applies a lower bound.

Fresh browser evidence:

- Entering row `0` recovered to `1`, but row `100` remained `100` despite the declared maximum.
- Importing one cell at row `10000` was accepted, saved, and rendered 10,000 preview rows. It took 601 ms on the test machine and produced a 262,716 px document.
- Import saves to IndexedDB before rendering. A sufficiently large accidental or hostile coordinate can therefore freeze/crash the tab and repeat on reload until site data is manually cleared.

Expected: reject or safely clamp out-of-range dimensions before persistence, provide a clear error and recovery action, and bound matrix construction independently of the number of blocks.

## Other defects

### Medium — hero artwork is severely distorted responsively

The hero image is naturally 1280×853, but its HTML height remains fixed while CSS changes only width. Measured CSS dimensions were 953.844×853 at 1440 px and 437.5×853 at 390 px. The mobile image is therefore rendered at roughly one-third of its intended aspect ratio and occupies an unnecessarily tall section. Lighthouse failed `image-aspect-ratio` and estimated 69 KiB of avoidable image delivery.

Expected: preserve the intrinsic 1.50:1 ratio (for example with responsive width and `height: auto`) and supply an appropriately sized mobile source.

### Medium — visible wordmark does not match its accessible name

Lighthouse reported `label-content-name-mismatch` with serious impact (WCAG 2.1 A / 2.5.3). The visible link says “Table proofing desk,” while `aria-label="Accessible Table OCR Check home"` omits that visible phrase. This impairs speech-input activation.

The default axe rules reported zero serious/critical findings; this mismatch is in axe's experimental rule set and was surfaced by Lighthouse.

### Medium — several 390 px touch targets are below the required 44×44 px

The merchant “Terms” link measured 34.1×14.3 px. Footer Privacy, Terms, and Source links measured 51.2×22.3, 42.1×22.3, and 48.8×22.3 px respectively. The large labels around visually hidden file inputs are usable; those hidden input rectangles were not counted as failures.

### Low — production caching and response-policy hardening are incomplete

- The HTML, service worker, hero image, icons, and hashed JS/CSS all return `cache-control: public, must-revalidate, max-age=30`; hashed immutable assets do not receive a long-lived immutable policy.
- `manifest.webmanifest` is served as `application/octet-stream` rather than a manifest/JSON MIME type. Chromium still parsed it and reported no installability errors.
- HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff` are present. CSP, Permissions-Policy, and an anti-framing policy (`frame-ancestors` or X-Frame-Options) are absent.

## Passing evidence

### Clean install, tests, and exact build

- `npm ci`: pass; 60 packages installed from lockfile.
- `npm audit --audit-level=low`: pass; 0 vulnerabilities.
- `npm test`: pass; 5/5 Vitest tests and 6/6 applicable Playwright tests passed, with 2 intentional cross-project skips.
- No lint script exists. Type checking is included in `npm run build` as `tsc --noEmit` and passed.
- `npm run build`: pass; output created in `dist/`.
- Bundle output: JS 29.68 KB (10.77 KB gzip), CSS 17.43 KB (4.60 KB gzip), hero WebP 110.03 KB. No runtime font files.

### Core product and recovery paths

- Opened the deliberately scrambled sample, observed both order defects, moved “Yes” later using pointer and keyboard-only operation, and reached “No structural errors detected.”
- Edited text containing `<`, `>`, `&`, and quotes; the value survived reload and exports remained escaped/valid.
- Exported and inspected semantic HTML, CSV, and project JSON. HTML retained `lang`, title, main landmark, source reference, and both `th scope="col"` and `th scope="row"`; CSV quoting was correct.
- Confirmed IndexedDB autosave, refresh recovery, close-proof cancel, confirmed deletion, and empty-state restoration.
- Confirmed image-only and OCR-only starts, followed by adding the missing counterpart.
- Invalid JSON produced actionable text; an empty cell array was rejected; a 12,000,001-byte image was rejected; a 500-block document was accepted in 972 ms; 501 blocks were rejected; valid input recovered after errors.
- Project names/source references, cell role and text editing, issue navigation, add/remove confirmation, and legal routes were exercised.
- A returned fake license was stored under the documented localStorage key, removed from the URL, checked against the production Sociobot endpoint, and reconciled to the quiet inactive-license notice. Core proofing and exports remained available.

### Accessibility and responsive behavior

- Desktop and 390×844 mobile: one `h1`, `lang="en"`, title, main landmark, and no image missing `alt`; no horizontal overflow at normal text size.
- Playwright axe 4.10.2: zero serious/critical violations on landing and populated workbench at desktop and mobile widths.
- Keyboard-only smoke: skip link was first, visible on focus with a 3 px outline, Enter moved to `#main`, and Tab/Space reached and activated “Move Yes later” without a trap.
- Reduced-motion context matched the media query, changed smooth scrolling to `auto`, and reduced transition duration to 0.01 ms.
- No console errors or uncaught page errors were observed on local or live landing/workbench/legal/offline flows.

### PWA and privacy

- Chromium parsed the live manifest and returned no installability errors. The service worker controlled the page and populated versioned cache `proof-desk-v1`.
- After a connected reload, a hard offline reload restored the saved proof and displayed the offline status banner.
- A controlled test server changed the service-worker bytes, `registration.update()` installed it, the “A newer proofing desk is ready / Update now” toast appeared, and the update action reloaded without console errors.
- During source/OCR import, correction, persistence, and export, no request left the product origin. Initial live load made zero third-party requests and loaded no external fonts, analytics, trackers, or scripts.
- The only observed external runtime call was the user-triggered/returned-license request to the documented Sociobot API. With an `Origin` header, it returned the specific product origin in `Access-Control-Allow-Origin` and `Vary: origin`.
- `/privacy/` and `/terms/` both return direct 200 HTML responses.

### Performance

Independent Lighthouse 12.8.2 mobile results on the live URL:

- Performance 96
- Accessibility 100
- Best Practices 96
- SEO 100
- FCP 1.0 s; LCP 1.5 s; TBT 240 ms; CLS 0; Speed Index 1.1 s
- Initial transfer: 127,691 bytes over 5 requests; 0 script, stylesheet, font, or third-party requests because JS/CSS are inlined in the compressed HTML.

Lighthouse did not produce a field/lab INP value, so the `<200 ms` INP budget was not directly measurable in this non-interactive audit. The 30-page, under-five-minute human success study also cannot be claimed from the supplied automated fixture and was not independently established.

## Reproduction commands

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

Browser checks used Playwright 1.58.2 with Chromium at desktop and 390×844 mobile sizes, `@axe-core/playwright` 4.10.2, offline emulation, reduced-motion emulation, downloads, IndexedDB reloads, console/page-error listeners, request capture, and Chrome DevTools manifest/installability inspection. Lighthouse was run with:

```sh
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome \
  npx --yes lighthouse@12.8.2 https://accessible-table-ocr-check.sociobot.in/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' \
  --no-enable-error-reporting --quiet
```

## Retest required

Do not mark the product complete until the rate-limiting contract and bounded-grid recovery are fixed and retested. Then retest the hero ratio, accessible wordmark name, mobile touch targets, production MIME/cache/security headers, offline reload/update, all exports, axe, Lighthouse, and byte-for-byte deployment identity.
