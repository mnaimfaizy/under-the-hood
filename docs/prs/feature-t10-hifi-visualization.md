# feat(hifi): add high-fidelity event loop visualization with granular web API + queues, animation controls, and history export

## Summary

Introduces a High Fidelity (Hi-Fi) event loop visualization mode:

- Granular simulation events (stack frames, web API lifecycle, micro/macro queue dequeues, phase ticks).
- Animated token flow using GSAP with per-kind arc timing.
- Separate logical simulation speed vs animation speed (with smoothing toggle).
- Console output capture (from emitted sync events resembling `console.log()`).
- Token history timeline with export (JSON) & clear controls.
- Narration callback + optional rolling narration history.
- Web API lifecycle: add → complete → enqueue macrotask.
- Accessibility: aria-labels, polite live regions, focus-safe tooltips, (empty) state markers.

## Key Changes

- Added `src/lib/HighFidelityStage.svelte` (Hi-Fi visualization + animation orchestration).
- Extended sim event types: `webapi-add`, `webapi-complete`, `tick` (phase).
- Updated `scenarioHiFiBasic` to follow real ordering of promise vs timeout.
- Added history utilities: `src/lib/history.ts`.
- Added scenario ordering test: `src/lib/sim/hifi.scenario.test.ts`.
- Added Hi-Fi specific controls & narration history in `src/App.svelte`.
- Integrated GSAP timeScale separation (animation vs logical speed).

## Files of Note

| File                                | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `src/lib/HighFidelityStage.svelte`  | Core Hi-Fi runtime view, animations, token/state history API |
| `src/App.svelte`                    | Wires Hi-Fi mode, controls, narration history, export/clear  |
| `src/lib/sim/types.ts`              | New simulation event variants                                |
| `src/lib/sim/scenarios.ts`          | Revised Hi-Fi scenario event sequence                        |
| `src/lib/history.ts`                | Pure helpers to manage capped histories                      |
| `src/lib/sim/hifi.scenario.test.ts` | Validates web API lifecycle ordering                         |

## Animation & Timing

- Microtask arc: higher & faster (~0.52s) vs macrotask (~0.7s).
- Dynamic arc lift (micro > macro) for visual priority.
- GSAP global timeline scaled independently (0.25× – 3×) via animation speed slider.
- Optional eased transitions (Smooth toggle) using tweened `timeScale`.

## Accessibility

- Live narration (`aria-live="polite"`).
- Explicit `aria-label`s for queues, console, event loop phase.
- Empty states signaled with semantic `(empty)` pseudo content.
- Tooltip text duplicated into `aria-label` for screen readers.

## Developer API (Hi-Fi Stage)

```ts
api = {
  handleSimEvent,
  playTimeline,
  pauseTimeline,
  stepTimeline,
  resetTimeline,
  resetTokens,
  setTimeScale,
  setSmoothSpeed,
  exportHistory,
  clearHistory,
};
```

## Testing

- Scenario test ensures ordering: webapi-add < webapi-complete < enqueue-macro and that microtask drains before macrotask runs.
- All existing Vitest suites pass (5 tests currently).

## Manual Verification

1. Switch to Hi-Fi View.
2. Play: observe console order Start → Promise! → Timeout!.
3. Adjust Animation speed; confirm animation pacing changes without affecting logical sequencing.
4. Toggle Smooth; speed changes interpolate vs snap.
5. Export History: file `token-history.json` downloads with recent events.
6. Clear History: timeline shows placeholder.
7. Toggle narration History: list appears and trims to last 20 lines.

## Risk & Mitigation

| Risk                                       | Mitigation                                               |
| ------------------------------------------ | -------------------------------------------------------- |
| New animation layer interfering with logic | Animation is purely visual; simulation events unchanged. |
| Performance on low-end devices             | Short tweens, minimal DOM nodes, capped histories.       |
| Accessibility regressions                  | ARIA roles/labels added; legacy mode untouched.          |

## Follow-ups (Not Included)

- Playwright E2E coverage for Hi-Fi flows.
- Persist animation/smooth settings (localStorage).
- Reduced motion preference: skip arc or shorten durations.
- Unify narration + token history export format.
- Keyboard shortcuts for export / clear / speed.

## Checklist

- [x] New event types typed and handled.
- [x] Hi-Fi scenario ordering validated by test.
- [x] Separate animation speed control.
- [x] Smooth speed toggle.
- [x] History export & clear.
- [x] Narration aggregation optional.
- [x] Console output captured.
- [x] Token history timeline.
- [x] GSAP dependency present.
- [ ] E2E test (future).
- [ ] Reduced motion pass (future).

## Suggested PR Title

`feat(hifi): add high-fidelity event loop visualization with animation controls & history export`

## Conventional Commit Type

`feat`

---

Generated PR description file for reviewer convenience.
