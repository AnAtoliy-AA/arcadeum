import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    // vite-tsconfig-paths skips aliases whose targets live outside the app
    // root, so map the shared games package explicitly (ARC-900).
    alias: [
      {
        find: /^@arcadeum\/games-core$/,
        replacement: fileURLToPath(
          new URL('../../packages/games-core/src/index.ts', import.meta.url),
        ),
      },
      {
        find: /^@arcadeum\/games-core\/(.*)$/,
        replacement: fileURLToPath(
          new URL('../../packages/games-core/src/', import.meta.url),
        ) + '$1',
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: process.env.CI ? 'verbose' : 'default',
    pool: 'forks',
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
