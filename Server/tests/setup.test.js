/**
 * Configuration for Jest
 * Place this in your project root or reference it in jest.config.js
 */

const { sequelize } = require('../models');

// Global setup - runs once before all tests
global.beforeAll(async () => {
  console.log('Global setup for all tests');
  // Additional global setup if needed
});

// Global teardown - runs once after all tests
global.afterAll(async () => {
  await sequelize.close();
  console.log('Test database connection closed');
});
