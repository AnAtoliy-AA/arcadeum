import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const tamagui = path.resolve(__dirname, '../../node_modules/tamagui');
const tamaguiWeb = path.resolve(__dirname, '../../node_modules/@tamagui/web');
const tamaguiCore = path.resolve(__dirname, '../../node_modules/@tamagui/core');
const tamaguiButton = path.resolve(__dirname, '../../node_modules/@tamagui/button');

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: /^tamagui$/, replacement: tamagui },
      { find: /^@tamagui\/web$/, replacement: tamaguiWeb },
      { find: /^@tamagui\/core$/, replacement: tamaguiCore },
      { find: /^@tamagui\/button$/, replacement: tamaguiButton },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: process.env.CI ? 'verbose' : 'default',
    pool: 'threads',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/layout.tsx',
        '**/page.tsx',
        'e2e/**',
        '.storybook/**',
        '**/index.ts',
        '**/index.tsx',
        '**/translations.ts',
        '**/registry.ts',
        'public/**',
      ],
    },
  },
});
