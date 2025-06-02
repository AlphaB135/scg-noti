module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/integration/**/*.+(ts|tsx|js)',
    '**/?(*.)+(integration.spec|integration.test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.integration.ts'],
  globalSetup: '<rootDir>/src/__tests__/globalSetup.integration.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.integration.ts',
  testTimeout: 60000, // Increased timeout for SQL Server operations
  maxWorkers: 1, // Run tests serially to avoid database conflicts
}