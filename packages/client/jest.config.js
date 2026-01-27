/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');

dotenv.config();

// Define global variables for Jest
global.__EXTERNAL_SERVER_URL__ = 'http://localhost:3001';
global.__INTERNAL_SERVER_URL__ = 'http://localhost:3001';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  globals: {
    __SERVER_PORT__: process.env.SERVER_PORT,
  },
};
