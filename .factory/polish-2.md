# Perfection-loop polish 2

`polish-1.md` maps F-1-1 through F-1-57. This round resolves every finding reopened or added in `review-2.md`.

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | Added a compact sample result and **Move Yes later** action directly below the persistent demo banner; moved editable table details below the proofing panels. | Mobile test `fits the core workflow on a 390px viewport`; [live mobile screenshot](evidence/polish-2-live/screenshot-mobile.png); <https://accessible-table-ocr-check.sociobot.in/demo>. |
| F-2-2 | Removed the unprovable USD 19 and one-time-price copy and its circular claim. The checkout link remains without an unsupported price promise. | `@claim:sociobot-billing-path`; live root checked at <https://accessible-table-ocr-check.sociobot.in/>. |
| F-2-3 | Removed merchant-of-record and refund claims rather than infer legal facts from checkout copy. | Copy audit; live Privacy and Terms check at <https://accessible-table-ocr-check.sociobot.in/privacy/> and <https://accessible-table-ocr-check.sociobot.in/terms/>. |
| F-2-4 | The document privacy claim now changes a demo cell to a unique marker, performs a recorded license verification, and inspects its URL, headers, and body. | `@claim:no-document-upload`. |
| F-2-5 | Added token-localStorage and 24-hour verification-cadence claim/test. | `@claim:license-token-cadence`. |
| F-2-6 | Removed the untestable card-details and hosted-checkout boundary statement. | Privacy copy audit; <https://accessible-table-ocr-check.sociobot.in/privacy/>. |
| F-2-7 | Removed the unsupported refund-handling statement. | Terms copy audit; <https://accessible-table-ocr-check.sociobot.in/terms/>. |
| F-2-8 | Added recorded valid-then-revoked verification coverage; saved versions disappear while all free exports remain usable. | `@claim:revoked-license`. |
| F-2-9 | Combined both unavailable-limiter paths into one tagged outcome test and manifest entry. | `@claim:license-fails-closed`. |
| F-2-10 | Added a manifest claim and direct build-document test for Demo, Privacy, Terms, and 404. | `@claim:direct-route-documents`. |
| F-2-11 | Replaced the first-screen browser fact with the immediately useful price fact “Core checking and exports are free.” | Mobile landing inspection, [live screenshot](evidence/polish-2-live/screenshot-mobile.png), and `@claim:free-core`. |
| F-2-12 | Renamed actions to Reset demo, Review N issues, Export issue report, Export project JSON, and Restore Desk license. | App/browser tests; copy audit. |
| F-2-13 | Rewrote README billing/offline language in plain words and removed legal/payment jargon. | `.factory/copy-audit.md`. |
| F-2-14 | Regenerated the copy audit with every current README prose unit and corrected “tagged browser test” to “tagged test.” | `.factory/copy-audit.md`; claim tests include Vitest and Playwright. |
