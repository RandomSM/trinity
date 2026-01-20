module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|expo|expo-.*|@expo|@expo-.*|react-redux|@reduxjs/toolkit|immer)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 11,
      functions: 28,
      lines: 20,
    },
  },
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
};
