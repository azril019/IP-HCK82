// Setup file for Jest to ensure proper cleanup after tests

// Add proper teardown for timers and promises
afterEach(() => {
  // Clear all mocks between tests
  jest.clearAllMocks();

  // Clear any timeout or interval that might have been set
  jest.useRealTimers();
});

// Global teardown
afterAll(() => {
  // Ensure all pending timers are cleared
  jest.useRealTimers();
});
