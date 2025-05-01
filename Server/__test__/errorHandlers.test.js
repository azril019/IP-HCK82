const request = require('supertest');
const express = require('express');
const errorHandlers = require('../Controllers/errorHandlers');
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');

describe('Error Handlers Middleware', () => {
  let app;

  beforeEach(() => {
    // Create a fresh app for each test
    app = express();
    app.use(express.json());
    
    // Setup routes that throw different types of errors
    app.get('/sequelize-validation-error', (req, res, next) => {
      const err = new Error('Validation error');
      err.name = 'SequelizeValidationError';
      err.errors = [{ message: 'Name cannot be empty' }];
      next(err);
    });

    app.get('/sequelize-unique-error', (req, res, next) => {
      const err = new Error('Unique constraint error');
      err.name = 'SequelizeUniqueConstraintError';
      err.errors = [{ message: 'Email must be unique' }];
      next(err);
    });

    app.get('/bad-request', (req, res, next) => {
      const err = new Error('Invalid input data');
      err.name = 'BadRequest';
      next(err);
    });

    app.get('/unauthorized', (req, res, next) => {
      const err = new Error('You need to login first');
      err.name = 'Unauthorized';
      next(err);
    });

    app.get('/forbidden', (req, res, next) => {
      const err = new Error('You do not have permission');
      err.name = 'Forbidden';
      next(err);
    });

    app.get('/not-found', (req, res, next) => {
      const err = new Error('Resource not found');
      err.name = 'NotFound';
      next(err);
    });

    app.get('/jwt-error', (req, res, next) => {
      const err = new Error('JWT error');
      err.name = 'JsonWebTokenError';
      next(err);
    });

    app.get('/unknown-error', (req, res, next) => {
      const err = new Error('Something went wrong');
      err.name = 'UnknownError';
      next(err);
    });

    // Add the error handler middleware
    app.use(errorHandlers);
  });

  it('should handle SequelizeValidationError with 400 status', async () => {
    const response = await request(app).get('/sequelize-validation-error');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Name cannot be empty' });
  });

  it('should handle SequelizeUniqueConstraintError with 400 status', async () => {
    const response = await request(app).get('/sequelize-unique-error');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email must be unique' });
  });

  it('should handle BadRequest error with 400 status', async () => {
    const response = await request(app).get('/bad-request');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid input data' });
  });

  it('should handle Unauthorized error with 401 status', async () => {
    const response = await request(app).get('/unauthorized');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'You need to login first' });
  });

  it('should handle Forbidden error with 403 status', async () => {
    const response = await request(app).get('/forbidden');
    
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'You do not have permission' });
  });

  it('should handle NotFound error with 404 status', async () => {
    const response = await request(app).get('/not-found');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Resource not found' });
  });

  it('should handle JsonWebTokenError with 401 status', async () => {
    const response = await request(app).get('/jwt-error');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });

  it('should handle unknown errors with 500 status', async () => {
    const response = await request(app).get('/unknown-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "We're experiencing new error" });
  });
});