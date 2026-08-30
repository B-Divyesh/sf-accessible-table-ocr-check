# Independent product verification 4 — FAIL

- Work order: `accessible-table-ocr-check-verify-4`
- Candidate: `c5ccedda2237cd9ea9f72adc28a7d858f701b597`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Date: 30 August 2026 UTC
- Environment: Node 22.23.2, npm 10.9.8, Chromium/Playwright 1.58.2
- Decision: **FAIL — the repaired rate limit works, but one mobile touch target remains below the mandatory 44×44px minimum.**

No product code was changed during this verification.

## First-read gate

The cold live page answers all three required questions on its first screen:

- What it does: **“Fix a scanned table’s reading order.”**
- Who it serves: librarians and accessibility reviewers comparing OCR with a scan before sharing a table with screen-reader users.
- What to do first: **Try it with sample data**, followed by the concrete result, “Opens a scanned transit table with two reading-order errors.”

The sample action is visible without setup and opens `/demo` in one click. The populated screen immediately shows nine cells, nine source overlays, two seeded order errors, and the persistent isolated-demo banner. This mandatory gate passes.

## Candidate and deployment identity

The clean checkout began at the requested commit, and `origin/main` resolved to the same commit. After the exact production build:

```text
f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231  dist/index.html
f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231  live root
57,920 bytes                                                     both
```

The built page inlines the production JavaScript and CSS, so the byte-identical live document establishes that the deployed UI matches this candidate. The live same-origin function also exposes the candidate's signed-window policy and passes its repaired boundary behavior.

## Claims contract

`.factory/claims.json` exists with 34 records. Every ID has exactly one `@claim:<id>` tag in the test source. After the clean lockfile install, every declared `test` command was run individually and passed. This includes demo isolation, local-only document handling, offline reload, all import shapes and formats, semantic exports, grid limits and rejection-before-write, saved versions, issue detection, and the rate-limit unit claim.

No claim-like sentence on the landing page or README was found without a corresponding claim record. The initial attempt before dependencies were installed could not load `@playwright/test`; `npm ci` installed the locked dependencies, after which all declared claim commands passed with no product assertion failure.

## Local quality gates

```text
npm ci                         PASS
npm audit --audit-level=low    PASS — 0 vulnerabilities
npm run lint                   PASS
npm run typecheck              PASS
npm test                       PASS — 15 unit/integration; 49 browser; 5 intentional skips
npm run build                  PASS — dist/ produced
```

Vite's pre-inline output was 36.52 KB JavaScript (12.97 KB gzip) and 19.46 KB CSS (4.98 KB gzip). There are no runtime font assets. The mobile hero is 22,664 bytes. These remain comfortably inside the 200 KB JS, 50 KB CSS, 120 KB fonts, and 300 KB hero budgets.

## Live product evidence

`npm run test:e2e:live` passed 48 applicable checks across desktop and 390×844 mobile, with six intentional local-only/project skips.

- The direct demo opened with nine editable cells and two reported defects. A keyboard-only path reached **Move Yes later** after 56 Tab presses; Space activated it and the screen reported **No structural errors detected**.
- The independent export flow produced semantic HTML with three `scope="col"` and two `scope="row"` headers plus the source-page reference, three-row CSV, nine-cell project JSON, and a plain-text issue report.
- Invalid JSON, row 100, and 501-cell imports were rejected with announced recovery text. The existing valid record remained unchanged after the over-limit replacement attempt. Valid input worked after errors.
- Desktop and 390px workbench screens had no horizontal overflow. A 640px hero source was selected on mobile and rendered at 434×288 (ratio 1.507 versus the source ratio 1.501).
- The 640px-width reflow check, used as a 1280px viewport at 200% text-size proxy, retained the workbench heading and controls without horizontal overflow.
- Landing and populated-workbench axe-core scans found zero serious or critical findings. The page has `lang="en"`, one `h1`, one `main`, no image missing `alt`, and no console or page errors.
- The skip link is first in keyboard order. Its visible focus indicator is a 3px solid coral outline. Reduced-motion mode was detected and control transitions fell to `0.00001s`.
- Internal routes, the checkout target, and the public source link resolved. `/privacy/` and `/terms/` returned direct 200 pages; an unknown route returned a styled real 404.

## Privacy and response policy

An independent Playwright request log captured the complete cold landing, demo edit, persistence, correction, and export flow. Requests were limited to:

```text
/
/assets/proofing-table.webp
/demo
/sample-table.svg
```

There were no off-origin requests, no request body containing the unique marker `PRIVATE-QA-MARKER-4`, no analytics or CDN assets, no runtime fonts, and no console/page errors. Demo state persisted only in `demo:table-proofing-desk`; localStorage and script-visible cookies stayed empty in the unlicensed flow.

The live HTML response returned CSP restricted to self with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict referrer policy, and a restrictive permissions policy. HTML is `no-cache, must-revalidate`; `sw.js` is `no-cache, no-store, must-revalidate`; versioned assets are `public, max-age=31536000, immutable`; the manifest is `application/json`.

The optional license endpoint returned `Cache-Control: no-store`, a secure `HttpOnly; SameSite=Strict` signed-window cookie, and no document content. The checkout URL returned a 303 to the hosted Dodo checkout. No sign-in is required, so identity-provider requirements do not apply.

## PWA and performance

- The manifest declares standalone display, a versioned start URL, matching theme/background colors, and 192px plus 512px maskable-capable icons.
- The service worker controlled `/demo` with cache `proof-desk-v3`. After priming, a hard offline reload restored the populated workbench, displayed the offline banner, and exported CSV without errors.
- A controlled server changed the production service-worker bytes. `registration.update()` displayed **A newer proofing desk is ready** and its **Update now** control without errors.
- Lighthouse 12.8.2 mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 1.1s, TBT 200ms, CLS 0, Speed Index 0.9s, total transfer 41 KiB. Lab INP was not available.

## Server request allowance

The live same-origin endpoint was tested with the repository's cookie-preserving client:

- Requests 1–20: `200`.
- Request 21: `429` with `Retry-After: 58`.
- Policy: `signed-client-window`; advertised limit: 20.

The observed allowance is therefore **20 requests per 60-second signed client window**. This repairs the previous verification blocker.

## Defects by severity

### Critical / high / medium

None found.

### Low — mobile “Demo” navigation target is 40×44px

At an exact 390×844 viewport, the visible header link **Demo** measures **40×44 CSS px**. The accessibility and design acceptance contract requires every touch target to be at least 44×44px. All other audited navigation, merchant, footer, button, and form-control targets met the threshold; the linked license field label was not counted as a standalone control.

The CSS gives mobile header links `min-height: 44px` but no `min-width: 44px`, which explains the measured result. Add a 44px minimum width or equivalent horizontal padding, then add a mobile assertion that checks every visible actionable target rather than only merchant/footer links.

Because the 44×44px rule is a non-negotiable acceptance baseline, this remaining defect makes the candidate **FAIL**.

## Verification limit

The brief's outcome target requires a moderated study of 30 scanned-table pages completed in under five minutes each. That human study was not available, and the product does not publish the unmeasured timing as a marketing claim.

## Evidence

Artifacts are in `.factory/verification-artifacts-4/`, including the cold screenshots, mobile demo screenshot, URL verifier output, live root bytes, exact rate-limit sequence, and Lighthouse JSON.
