# Implementation Plan – Testing Suite

## Goal
Add a full testing infrastructure (unit, integration, E2E, load) to the Surya Women’s Health Tracing & Monitoring System.

## User Review Required
> [!IMPORTANT]
> Please confirm the chosen tools:
> - **E2E framework**: Playwright (default). Reply “Cypress” to switch.
> - **Load‑testing tool**: k6 (default). Reply “Artillery” to switch.
>
> Approve to let us commit the changes.

## Open Questions
- Do you want any additional dev‑dependencies (e.g., eslint-plugin‑jest)?
- Should the CI workflow run on every push or only on PRs?

## Proposed Changes
### 1️⃣ `package.json`
- Add devDependencies:
  ```json
  "jest", "ts-jest", "@types/jest", "@testing-library/react", "@testing-library/jest-dom",
  "supertest", "playwright", "k6"
  ```
- Add npm scripts:
  ```json
  "test": "jest",
  "test:unit": "jest --config=jest.config.ts",
  "test:integration": "jest --config=jest.config.ts --testPathPattern=integration",
  "test:e2e": "playwright test",
  "test:load": "k6 run perf/load-test.js"
  ```

### 2️⃣ Jest configuration (`jest.config.ts`)
Create a TypeScript‑aware Jest config with coverage thresholds (80 %).

### 3️⃣ Test directories & sample tests
- `src/__tests__/middleware.test.ts` – unit test for security headers & rate limiting.
- `src/lib/algorithms/__tests__/kruskal.test.ts` – memoisation test.
- `src/app/api/logs/vitals/__tests__/route.test.ts` – pagination integration test.
- `e2e/login.spec.ts` – Playwright login flow.
- `perf/load-test.js` – k6 script hitting `/api/logs/vitals`.

### 4️⃣ Documentation (`TESTING.md`)
Explain how to run each suite locally, CI integration, and coverage reporting.

### 5️⃣ CI workflow (`.github/workflows/ci.yml`)
Run `npm ci` then the four test suites; upload coverage artifact.

## Verification Plan
1. `npm install` – all new packages install.
2. `npm run test` – unit tests pass, coverage ≥ 80 %.
3. `npm run test:integration` – integration tests pass.
4. `npm run test:e2e` – Playwright launches browsers and exits 0.
5. `npm run test:load` – k6 finishes without errors.
6. CI pipeline succeeds.

Once you approve the tool choices, we will apply the changes.
