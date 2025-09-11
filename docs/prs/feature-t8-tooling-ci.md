# PR: Task T8 — Tooling & CI

## Summary

Implements Task T8 by adding project-wide linting/formatting, CI pipelines, and a pre-commit hook to keep quality gates green and consistent across contributions.

## Changes

- ESLint (flat config) for JS/TS/Svelte: `eslint.config.js`
  - Svelte + TypeScript parsing and rules
  - Test environment globals (Vitest/Playwright)
  - Reasonable defaults, minimal noise
- Prettier configuration for code style: `.prettierrc`, `.prettierignore`
  - Includes `prettier-plugin-svelte`
- Husky pre-commit hook: `.husky/pre-commit`
  - Runs `format:write` and `lint:fix` to auto-fix before commit
- NPM scripts in `package.json`
  - `lint`, `lint:fix`, `format`, `format:write`, `prepare`
- CI updates in `.github/workflows/ci.yml`
  - Node matrix (20.19.x and 22.x)
  - Steps: install → lint → format check → unit → build → e2e
  - Installs Playwright chromium before e2e
- Dedicated E2E workflow: `.github/workflows/e2e.yml`
  - Runs on PR and manual dispatch
- README badges & Quality section

## Motivation

- Consistent code style and lint rules reduce drift and review overhead.
- Automated CI ensures PRs don’t regress build/tests.
- Pre-commit automation lowers friction by auto-fixing common issues.

## Acceptance

- CI badge visible in README
- `npm run lint` and `npm run format` pass locally
- `npm run test:unit` and `npm run test:e2e` pass locally
- `npm run build` succeeds

## Notes

- Husky v9+ deprecates shim lines; hook uses direct commands.
- Two benign lint warnings remain (unused `onMount` and `vi`), to be addressed or suppressed later.

## How to try locally

- Install deps: `npm install`
- Lint: `npm run lint`
- Format: `npm run format`
- Unit tests: `npm run test:unit`
- E2E tests: `npx playwright install chromium && npm run test:e2e`
- Build: `npm run build`
