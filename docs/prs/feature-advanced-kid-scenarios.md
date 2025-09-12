# PR: Task 1.1 - Advanced Kid Mode Scenarios

## Summary

Implements Task 1.1 from the remaining tasks by adding 4 new advanced scenarios to Kid Mode: Microtask Chain, Nested Timeouts, Async/Await Mapping, and DOM Click Event. These scenarios demonstrate edge cases like microtask starvation, FIFO macrotask ordering, async/await desugaring, and event handler enqueuing. Narration is enhanced to use dynamic, kid-friendly descriptions. All scenarios are fully integrated with unit tests, E2E tests, and UI controls.

Branch: `feature/advanced-kid-scenarios`
Open PR: https://github.com/mnaimfaizy/under-the-hood/pull/new/feature/advanced-kid-scenarios

## What’s included

### New Scenarios

- **Microtask Chain**: Shows promise chaining that starves macrotasks (3 promises block 1 timer)
- **Nested Timeouts**: Demonstrates FIFO order with 3 setTimeout calls
- **Async/Await Mapping**: Illustrates async/await as microtask continuation
- **DOM Click Event**: Simulates click event enqueuing a handler macrotask

### Enhancements

- **Dynamic Narration**: Updated `updateNarration` in `App.svelte` to use event descriptions for scenario-specific, kid-friendly text
- **Token Types**: Added "async" type to `types.ts` for async/await scenario
- **UI Integration**: Added scenarios to selector in `Controls.svelte` and loading logic in `App.svelte`

### Testing

- **Unit Tests**: Added tests in `scenarios.test.ts` for event sequences of all new scenarios
- **E2E Tests**: Extended `kid-mode.spec.ts` with Playwright tests for each scenario, verifying narration flow
- **Validation**: All tests pass; build succeeds; no regressions in existing scenarios

## Acceptance criteria

- ✅ All 4 scenarios selectable in Kid Mode dropdown
- ✅ Animations match expected event order (microtasks drain before macrotasks)
- ✅ Narration updates dynamically with simple metaphors
- ✅ Unit tests verify event sequences
- ✅ E2E tests confirm end-to-end playback

## How to verify

- Dev: `npm run dev`
- Select each new scenario from dropdown, click Play
- Observe animations and narration (e.g., "VIP lane is busy" for microtask chain)
- Tests: `npm run test:unit` and `npm run test:e2e`

## Files of Note

| File                            | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `src/lib/sim/scenarios.ts`      | New scenario functions with event sequences |
| `src/lib/sim/types.ts`          | Added "async" token type                    |
| `src/App.svelte`                | Updated narration and scenario loading      |
| `src/lib/Controls.svelte`       | Added scenario options                      |
| `tests/e2e/kid-mode.spec.ts`    | E2E tests for all scenarios                 |
| `src/lib/sim/scenarios.test.ts` | Unit tests for new scenarios                |

## Risk & Mitigation

| Risk                                       | Mitigation                                                        |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Animation/visual issues with new scenarios | Tested manually; animations use existing token-move logic         |
| Narration too technical                    | Used kid-friendly descriptions; manual review confirms simplicity |
| Performance impact                         | Scenarios are lightweight; no new heavy computations              |

## Follow-ups (Future Enhancements)

- Refine narration text based on user testing
- Add more visual metaphors for complex scenarios
- Consider scenario thumbnails or previews
- Enhance async/await with code snippets in Pro Mode

## Checklist

- [x] New scenarios implemented with correct event sequences
- [x] Narration uses dynamic descriptions
- [x] UI selector updated
- [x] Unit tests added and passing
- [x] E2E tests added and passing
- [x] Manual testing completed
- [x] Build succeeds
- [x] No regressions in existing functionality

## Suggested PR Title

`feat: add advanced Kid Mode scenarios with dynamic narration`

## Conventional Commit Type

`feat`
