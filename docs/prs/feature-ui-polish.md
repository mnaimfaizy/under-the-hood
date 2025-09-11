# PR: UI Polish & Theming Improvements

## Summary
Initial UI enhancement pass introducing improved theming tokens, refined controls layout, dark mode friendly styling, and clearer token differentiation (shape + stroke color + shadow). This lays groundwork for upcoming legend, responsive layout refinements, and animation lifecycle enhancements.

## Changes
- Added design tokens (surface, border, accent, radii, transitions) in `src/app.css`.
- New utility classes: `.surface`, `.surface-alt`, button styles (`.btn-primary`, `.btn-neutral`), focus ring normalization.
- Refactored `App.svelte` header & controls: gradient title, descriptive subtitle, theme toggle, reorganized control bar.
- Stage container now uses layered radial accent background.
- Token styling: distinct rounded radii per kind (sync/micro/macro/webapi), consistent icon sizing, shadow filter.
- Added SVG `filter#tokenShadow` and softened grid lines in `Stage.svelte`.
- Minor accessibility improvements: clearer button text hierarchy & semantic structuring.

## Rationale
The prior UI was functional but visually flat and less engaging for educational context. Introducing shape + subtle color hierarchy improves at-a-glance differentiation (supports color vision deficiencies). The design token layer enables faster iterative polish (future dark mode persistence, legend, animations) without repeated hard-coded values.

## Demo / Visual (describe until screenshots added)
- Header: Gradient "Under the Hood" title with subtitle below.
- Control bar: Scenario selector → primary Play button → neutral Pause/Restart → sound toggle → speed slider aligned right.
- Stage: Soft radial highlight behind runtime blocks; tokens have slight depth.

## Accessibility Notes
- All previous ARIA attributes preserved.
- Focus outlines standardized via `:focus-visible` rule.
- Future tasks will add explicit ARIA labels per runtime block and legend mapping.

## Performance Considerations
- Added minimal CSS only; no new runtime dependencies.
- Token rendering unchanged logically; only presentation layer adjusted.

## Follow-up Tasks (T10 series)
Refer to newly appended section in `docs/tasks.md` (T10) for structured next steps:
1. Responsive layout adjustments (stack on small screens)
2. Token entrance/exit animations
3. Legend & ARIA block labelling
4. Dark mode preference persistence
5. Token data structure optimization (Map)
6. Extract `Controls.svelte`
7. Pro Mode tooltips & legend enhancements
8. README + screenshots/docs update

## Testing
- Existing Vitest + Playwright tests should pass (no logic changes). Recommend re-running CI to confirm.
- Manual smoke: load each scenario, trigger play/pause/restart, toggle Pro Mode & theme.

## Migration / Rollback
Purely presentational; rollback by reverting this commit if issues arise.

## Checklist
- [x] No new ESLint errors (only existing warnings remain)
- [x] Dark mode compatible styling
- [x] Reduced motion respected (animations unchanged for now)
- [x] Documentation updated: tasks list extended (T10)

---
Reviewer focus: Confirm no regression in controls functionality, and validate clarity of token shapes vs their semantics.
