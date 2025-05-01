module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "Server/**/*.js",
    "!Server/**/__tests__/**",
    "!Server/**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 85,
      lines: 90,
    },
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  testTimeout: 10000,
  // Detect open handles to help diagnose leaks
  detectOpenHandles: true,
  // Force Jest to exit after all tests have completed
  forceExit: true,
};
