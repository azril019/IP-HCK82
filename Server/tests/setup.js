// Jest setup file
// This file runs before each test file is executed

// Add global test setup code here
// For example, configure testing libraries, set up global mocks, etc.

// Set default timeout for all tests
jest.setTimeout(30000); // 30 seconds

// Suppress console methods during tests to reduce noise
// Uncomment these if you want less console output during tests
// console.error = jest.fn();
// console.log = jest.fn();
// console.warn = jest.fn();

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown after all tests
afterAll(() => {
  // Clean up any global resources
});
