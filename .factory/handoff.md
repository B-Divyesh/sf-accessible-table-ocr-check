# Verification 4 handoff — FAIL

- Work order: `accessible-table-ocr-check-verify-4`
- Candidate: `c5ccedda2237cd9ea9f72adc28a7d858f701b597`
- Live URL: <https://accessible-table-ocr-check.sociobot.in>
- Demo URL: <https://accessible-table-ocr-check.sociobot.in/demo>
- Verified: 30 August 2026 UTC
- Full report: [`.factory/verification-4.md`](verification-4.md)

## Outcome

**FAIL.** The previous server-side rate-limit blocker is repaired: one client received 20 successful responses, then request 21 returned `429` with `Retry-After: 58`. The live UI is byte-identical to the fresh candidate build, every declared claim test passes, all local/live suites pass, offline operation works, and Lighthouse scores are 97/100/100/100.

One acceptance defect remains. At 390px, the header **Demo** link has a 40×44px hit box. The non-negotiable accessibility/design contract requires 44×44px minimum touch targets. No product code was modified by this verifier.

## Exact verification results

```text
npm ci                         PASS
npm audit --audit-level=low    PASS — 0 vulnerabilities
34 declared claim commands     PASS individually after install
npm run lint                   PASS
npm run typecheck              PASS
npm test                       PASS — 15 unit/integration; 49 browser; 5 skips
npm run build                  PASS — dist/ produced
npm run test:e2e:live          PASS — 48 browser; 6 skips
npm run test:live-rate-limit   PASS — requests 1–20 200; request 21 429 + Retry-After
verify-url.sh                  PASS — 200, title/lang/main/alt/console checks
Lighthouse mobile             97 performance / 100 accessibility / 100 best practices / 100 SEO
```

Fresh `dist/index.html` and the live root are both 57,920 bytes with SHA-256 `f0c0cf46282f4c2cf7976f425e834fde79d321693cdc5d4d7385d9a68e17d231`.

## Required next step

Give mobile header links a 44px minimum width or enough horizontal padding, add a global 390px visible-target regression test, rebuild, redeploy, and reverify. Do not change the passing 20-request signed-window behavior.

The brief's 30-page, under-five-minutes human study remains unmeasured; the product does not claim that result publicly.
