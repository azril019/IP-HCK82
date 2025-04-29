/**
 * Main test file that runs all test suites
 */
require('dotenv').config({ path: '.env.test' });
const { sequelize } = require('../models');

beforeAll(async () => {
  // Setup test database if needed
  await sequelize.sync({ force: true });
  console.log('Test database synced');
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// List all test suites to run
require('./unit/helpers.test');
require('./unit/middleware.test');
require('./integration/user.test');
require('./integration/preference.test');
require('./integration/recommendation.test');
require('./e2e/api.test');
