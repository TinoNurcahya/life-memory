# Dashboard verification — 22 October 2026

The dashboard now presents a compact composer, a linked archive index, five recent memories, and a companion column for one rediscovered memory and up to three insights. The hero, Workspace pulse, decorative Live status, and KPI cards were removed. Writing ideas are collapsed initially. Empty archives show the composer and an invitation to write.

The user's latest shared sidebar, header, and shell refactor was preserved. Their source hashes were unchanged throughout the final verification. That refactor also exposes the local font variables through the root layout and applies the shared shell across archive routes; the previous assumption that other archive routes retain the old shell no longer applies.

## Results

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd run lint` | Passed with 0 errors and 30 warnings in the current checkout |
| `npm.cmd run build` | Passed; production output contains no temporary fixture route |
| `git diff --check` | Passed; line-ending notices only |
| Production dashboard browser checks | Passed; no dashboard or timeline runtime exceptions |
| Empty, error, pending, failed, review, planned, cancelled, long-text fixtures | Passed |

Browser checks used an isolated headless Microsoft Edge profile with the local production server. This is local browser evidence, not a deployed-site or authenticated backend test.

## First-screen measurements

Both themes produced the same positions, measured in CSS pixels from the top of the viewport.

| Viewport | Save button bottom | First memory begins | Second memory bottom |
| --- | ---: | ---: | ---: |
| 1440 × 900 | 309 | 481 | 775 |
| 768 × 1024 | 302 | 518 | 854 |
| 390 × 844 | 319 | 525 | 907 |

At 1440 × 900, the composer and two memories are visible without scrolling. At 390 × 844, Save memory and the first memory are visible. No horizontal overflow was detected at the three widths. The earlier audit placed the first memory around 1,119 px on desktop and 1,731 px on mobile.

Screenshots: [desktop light](dashboard-1440-light.png), [desktop dark](dashboard-1440-dark.png), [tablet light](dashboard-768-light.png), [tablet dark](dashboard-768-dark.png), [mobile light](dashboard-390-light.png), [mobile dark](dashboard-390-dark.png).

## Interaction and accessibility coverage

- Browser platform-font inspection confirmed local **Inter** and **Newsreader** rendering, rather than fallback fonts.
- All visible main-dashboard links, buttons, and date input measured at least 44 × 44 px. Short context links and Undo also have a minimum width of 44 px.
- Tab order between Writing ideas and the textarea works; the keyboard focus outline measures 2 px. Search and mobile navigation return focus after Escape.
- The textarea grows with long content, shrinks when cleared, and recalculates when the sidebar changes the available width.
- Writing ideas opens and inserts a suggestion, returning focus to the textarea.
- Search returns results and a no-results state. Mobile navigation opens and closes.
- Persisted collapsed-sidebar reload hydrates without a mismatch and can expand again.
- Photo selection displays a preview; its visible remove button works.
- Selecting a date and saving with Ctrl+Enter creates a resolved demo memory with the chosen date and clears the composer.
- Evidence opens with the local fonts and closes correctly. Rediscovered-memory dismissal and Undo work.
- Reduced-motion emulation removes dashboard transitions.
- Fixture coverage includes empty archives, a data error, extraction pending/failed, needs-review, planned/cancelled entries, same-day grouping, very long text, and memories with and without photos.

Machine-readable evidence: [production results](results-production.json), [fixture results](results-fixtures.json). The fixture route is created only for development checks and was removed afterward.

## Scope and remaining observations

- Timeline still renders its own content and active navigation with the user's current shared shell. Dashboard layout elements are absent from login and landing.
- The comparison visit to **`/login` produced React hydration error #418**. It is recorded separately under `relatedRouteErrors` in the production report. Dashboard and timeline produced no runtime exceptions. Authentication code was not changed to address this unrelated finding.
- The existing development server timed out compiling `/timeline` during the broad development run. Its earlier report retains that failure. The production timeline check and the separate development fixture run passed.
- The 30 lint warnings include existing state-in-effect and unused-symbol warnings, including those in the user's shared shell. No unrelated warning cleanup was attempted.
- Real-account writes, live photo uploads, extraction services, and database behavior were not exercised. Their existing callbacks and data flow were retained; save interaction was verified in fictional demo mode.

To reproduce with an isolated Chromium instance exposing port 9333, run `node scripts/verify-dashboard.mjs --production` with `DASHBOARD_AUDIT_URL` pointing at the production server. Run `node scripts/verify-dashboard.mjs --fixtures-only` against the development server for the temporary state fixtures.
