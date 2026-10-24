# Compact personal timeline

Verified locally on 23 October 2026. The scope is `/timeline`, its entry editor, and the compact photo presentation.

## Visual acceptance

The production demo was checked at 1440 × 900, 768 × 1024, and 390 × 844 in both light and dark modes. Measurements are from the viewport top to the first story's bounding box.

| Viewport | First story | Search width | Evidence |
| --- | ---: | ---: | --- |
| 1440 × 900 | 215 px | 729 px | [Light](timeline-1440-light.png), [Dark](timeline-1440-dark.png) |
| 768 × 1024 | 317 px | 457 px | [Light](timeline-768-light.png), [Dark](timeline-768-dark.png) |
| 390 × 844 | 306 px | 350 px | [Light](timeline-390-light.png), [Dark](timeline-390-dark.png) |

The first story previously began around 753 px on desktop and 991 px on mobile. The new layout meets the 320 px desktop / 420 px mobile targets. The second complete desktop entry ends around 446 px, comfortably within the 900 px viewport. No horizontal overflow was found at the three tested widths.

Chromium's rendered-font inspection confirmed custom Inter and Newsreader fonts. Controls have visible keyboard focus and at least 44 × 44 px targets. Reduced-motion mode removes timeline transitions.

## Behavior covered

- Search across story, original text, people, places, and topics; category counts and filters; ascending and descending dates; one heading per day; clearing empty search results.
- Fresh `initialItems` props update stories, category counts, and entity links while preserving active filters and ordering. Saved demo memories merge after hydration and remain present after reload.
- Separate empty archive, no search matches, load failure, and partial-load failure presentations.
- Pending, failed, needs-review, planned, cancelled, and first-time states, plus long text and entries with or without photos.
- Editor disclosure and Escape focus return; category pending feedback and rollback; entity addition/removal feedback; retry extraction.
- Compact photo count, navigation, viewport positioning after scrolling, initial focus, Tab containment, and Escape returning focus to the thumbnail. Opening a photo while editing does not let photo Escape close the editor.

The browser harness intercepts every POST before it reaches the network. Success/failure action responses are simulated, and refreshed server props are supplied by an isolated fixture. These checks establish client behavior, not authenticated database persistence or live extraction success.

## Isolation

Compared with the pre-change snapshot, `VaultShell`, sidebar, header, navigation CSS, `DashboardClient`, dashboard CSS, and Calendar's `DayInspectorDrawer` are unchanged. The noncompact photo branch is unchanged. All 133 unrelated rules in `app/globals.css` are identical.

The shared lightbox only gains optional control-label overrides; its existing defaults and presentation remain unchanged. The timeline compact variant supplies English labels, a viewport portal, focus handling, and scoped target sizing.

Adjacent routes were also rendered: [Dashboard](dashboard-unaffected.png) retains its five recent memories and [Calendar](calendar-unaffected.png) retains its existing presentation.

## Final checks

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd run lint` | Passed: 0 errors, 30 existing warnings outside the edited timeline surfaces |
| `npm.cmd run build` | Passed: 34 static pages generated; no temporary audit route in the output |
| Production browser suite | Passed: 15 checks, no runtime exceptions |
| Fixture browser suite | Passed: 19 checks, no runtime exceptions; 14 server-action and 2 extraction POST responses mocked |

The fixture route and its generated development type file were removed after testing. Production screenshots and the result files correspond to the final implementation.

## Reproducing the browser checks

Use an isolated Chromium-compatible browser with remote debugging on port 9333. The harness uses Node's built-in WebSocket client, creates temporary fixture files only when needed, intercepts all POST requests, and removes its fixture route on exit.

```powershell
# Production server, after npm.cmd run build:
$env:TIMELINE_AUDIT_URL = 'http://localhost:3001'
node scripts/verify-timeline.mjs --production

# Development server for isolated UI states:
$env:TIMELINE_AUDIT_URL = 'http://localhost:3000'
node scripts/verify-timeline.mjs --fixtures-only
```

Machine-readable results: [production](results-production.json), [fixtures](results-fixtures.json).
