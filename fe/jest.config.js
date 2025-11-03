module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?expo|@?react-native|@react-native(-community)?|@expo(nent)?|expo-modules-core|react-clone-referenced-element|@react-navigation|@unimodules|sentry-expo)/)',
  ],
};