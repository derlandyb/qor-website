import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

// ARCHITECTURE.md §8.3 — 80% coverage is the CI gate every submodule
// enforces; `npm run test:coverage` (make test-website) is the command
// that checks it, not a plain `npm test`.
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // e2e/ holds Playwright specs (make e2e-website), not Jest ones — Jest's
  // default testMatch would otherwise pick up *.spec.ts there too.
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 80,
    },
  },
};

export default createJestConfig(config);
