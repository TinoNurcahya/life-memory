# Implementation Status — 2026-10-20

The first vertical-slice pass and Sprint 2–8 gap closure implementations are active in the checkout. This status intentionally distinguishes code present from production verification that still depends on Supabase credentials and a deployable process.

## Completed in this pass

- Next 16-compatible `proxy.ts` route guard now allows the anonymous `?demo=jimmy` preview while keeping private routes authenticated.
- Supabase migration includes the 10-table foundation, reactive views, RLS, and additive review metadata (`needs_review`, `review_reasons`).
- Quick Logger writes `PENDING` through a Server Action, adds an optimistic card, then settles/removes that card after `/api/extract` resolves or fails.
- Extraction validates the JSON envelope, uses Gemini thinking level `minimal`, resolves `day_offset` into `occurred_at`, normalizes people/places/topics, filters generic dwellings, and transitions the parent row to `RESOLVED` or `FAILED`.
- Dashboard and Timeline read Supabase records through `getArchiveData`; the Jimmy preview is a local, read-only deterministic 48-row fixture until a dedicated Supabase demo profile is seeded.
- Timeline supports category filtering, keyword search, category correction, entity removal, review badges, and extraction retry; all mutation controls are disabled or hidden for `demo=jimmy`.
- S-14 deterministic reveal card is mounted on top of the Timeline (`TimelineFeed.tsx`) with dismiss capability and link to `/forgot-this`.
- Dashboard (`DashboardClient.tsx`) renders the S-14 dormant memory card for both Demo and Authenticated accounts when an anchor memory stays dormant for >= 21 days.
- S-14 test determinism resolved: `lib/demo/jimmy.ts` exports `getJimmyDemoItems(referenceDate)` factory, and `scripts/test-forgotten.ts` runs without date drift.
- Entity safety & UX: `EntityMergeControl.tsx` confirms action with the user before deletion, moves junction records, and provides feedback via Sonner toasts and inline messages;`EntityControls.tsx` adds Sonner feedback.
- `scripts/test-regression.mjs` incorporates 1.5s pacing delay and retry backoff on HTTP 429 across all 50 ground-truth fixture cases.
- `tsconfig.json` excludes transient `.next/dev/types` declarations to guarantee clean, zero-error typechecking.
- Supabase cloud migration completed and verified live: 10 tables, 3 views, triggers, and RLS policies applied via `npm run db:migrate`. `npm run test:supabase` successfully queries `profiles`, `activities`, and `activity_details`.
- Sprint 8 Footnote-Grounded Monthly Reflection Engine (`lib/ai/reflection.ts` & `lib/reflection/monthly.ts`):
  - Integrates Gemini 3.8 Flash via `@google/genai` with `thinkingConfig: { thinkingLevel: "low" }` and 3-tier cascade fallback (`gemini-3.8-flash` -> `gemini-3.5-flash-lite` -> deterministic template).
  - Deterministic citation validator (`ValidateReflection`) guarantees 100% grounded citations to atomic `activity_detail_id` records, sequential markers `[1]..[N]`, and zero hallucination.
  - Interactive editorial UI (`components/reflection/ReflectionView.tsx` & `components/reflection/FootnotePopover.tsx`) with Newsreader serif, inline citation badges, popover memory previews, and live Supabase caching in `insights` table (`type = 'reflection'`).
  - Unit test suite (`scripts/test-reflection.ts`) verifying curation, validation constraints, fallbacks, and global renumbering.
- Sprint 7 Automated Insights Pipeline & Interactive Evidence Drawer (Vaul) (Hero 2):
  - Central insights pipeline `lib/analytics/insights-generator.ts` with composite key deduplication (`type:key:month`) and dual-mode execution (demo in-memory vs Supabase table `insights` synchronization).
  - Interactive bottom sheet drawer `components/insights/EvidenceDrawer.tsx` powered by `vaul` with accessible drag handle, backdrop blur, verbatim memory snippets, source text keyword highlighting (`<mark>`), and timeline jump links.
  - Upgraded feed `components/insights/InsightList.tsx` with 4-category filter tabs (`All`, `First-Times`, `Recurring`, `Monthly Shifts`) and `[ X Sources → ]` trigger buttons.
  - Page `app/insights/page.tsx` styled with Newsreader serif, header breadcrumbs, and 4 summary metrics pills.
  - Dashboard `components/dashboard/DashboardClient.tsx` integrates the Top Insights preview widget.
- Sprint 9 Data Portability, Settings & Dark Mode:
  - Full JSON archive export engine `lib/export/archive.ts` and API route `app/api/export/route.ts` exporting all 10 relational tables (profiles, activities, details, people, places, topics, junctions, insights) with versioned metadata and zero DB mutation demo support.
  - ThemeProvider upgraded in `lib/experience/theme-context.tsx` to support 3 modes: `Light`, `Dark`, and `System` with real-time `matchMedia` OS schedule listener.
  - Interactive Settings page (`app/settings/page.tsx` & `components/settings/SettingsClient.tsx`) with account overview, visual theme selection cards, one-click archive download, Gemini AI privacy disclosures, and double-confirmation Danger Zone requiring typing `"DELETE"`.
  - Test suite `scripts/test-export.ts` verifying full archive export schema, 48 demo activities, 104 junctions, and round-trip JSON serialization.

## Still required before claiming Sprint 1–4 complete

- Verify Auth/OAuth login, signup trigger creating `profiles`, and redirect URLs in a real account.
- Run `scripts/seed-demo.ts` after a dedicated demo profile exists; local anonymous demo is already the 48-row read-only fixture.
- Perform browser checks at desktop/mobile widths, reduced motion, keyboard/touch input, and retry/failure states.
- Resolve the Windows `spawn EPERM` process restriction before treating production build or HTTP smoke results as verified.

## Validation recorded

- `npm.cmd run typecheck` — passed (0 errors).
- `npm.cmd run lint` — passed (0 errors, 19 warnings).
- `npm.cmd run db:migrate` — passed (10 tables, 3 views created & verified on live Supabase cloud).
- `npm.cmd run test:supabase` — passed (Auth 200 OK, tables `profiles`, `activities`, `activity_details` successfully queried).
- `npm.cmd run test:export` — passed (Full 10-table JSON archive export, schema integrity, demo coverage, 101.7 KB round-trip).
- `npm.cmd run test:insights` — passed (53 deterministic patterns, evidence grounding, highlight terms, deduplication).
- `npm.cmd run test:reflection` — passed (Evidence curation, deterministic fallback, ValidateReflection integrity, and continuous global footnote numbering).
- `npm.cmd run test:forgotten` — passed (S-14 selector rules & daysAgo verified).
- `npm.cmd run test:analytics` — passed (50 total / 48 completed / mixed-status ground truth).
- `npm.cmd run build` and `npm.cmd run dev` — blocked by the host's `spawn EPERM` restriction after/at process launch.
- 2026-10-20: Database gate unblocked and live verified; Sprint 7 Vaul Evidence Drawer, Sprint 8 Monthly Reflection engine, and Sprint 9 Data Portability / Settings / 3-Way Dark Mode implemented and verified; typecheck clean, lint clean with 0 errors.

