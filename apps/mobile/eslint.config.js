// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['**/*.styles.ts', '**/*.styles.tsx'],
    rules: {
      'max-lines': 'off',
    },
  },
]);
