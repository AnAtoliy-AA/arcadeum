module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?expo(?:.*)|@?react-native(?:.*)|@react-native-community(?:.*)|@expo(?:.*)|expo-modules-core|react-clone-referenced-element|@react-navigation(?:.*)|@unimodules(?:.*)|sentry-expo|native-base|react-native-svg)/)',
  ],
};