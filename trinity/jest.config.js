const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shop/(.*)$': '<rootDir>/src/app/shop/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/**/page.tsx',  // Exclude Next.js page files (hard to unit test)
    '!src/app/layout.tsx',
    '!src/app/providers.tsx',
    '!src/app/PersistGateWrapper.tsx',
  ],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 15,
      functions: 19,
      lines: 20,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  coverageReporters: ['text', 'lcov', 'cobertura'],
}

module.exports = createJestConfig(customJestConfig)
