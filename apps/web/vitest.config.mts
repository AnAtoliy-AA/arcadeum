import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const root = path.resolve(__dirname, '../../');

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      'tamagui': path.resolve(root, 'node_modules/tamagui'),
      '@tamagui/core': path.resolve(root, 'node_modules/@tamagui/core'),
      '@tamagui/web': path.resolve(root, 'node_modules/@tamagui/web'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: process.env.CI ? 'verbose' : 'default',
    pool: 'threads',
    deps: {
      optimizer: {
        web: {
          include: ['@tamagui/web', '@tamagui/core', '@arcadeum/ui'],
        },
      },
    },
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
