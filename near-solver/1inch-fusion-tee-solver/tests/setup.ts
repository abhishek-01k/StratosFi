// Test setup for 1inch Fusion+ TEE Solver
import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment
const envPath = resolve(__dirname, '../env/.env.test');
config({ path: envPath });

// Ensure NODE_ENV is set
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};