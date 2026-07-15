import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!main.ts',
    '!worker.ts',
    '!**/*.module.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
