module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/jest.config.js",
    "!**/migrations/**",
    "!**/seeders/**",
  ],
  setupFiles: ["./jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 10000,
};
