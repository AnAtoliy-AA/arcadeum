import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    // Force all @tamagui/web imports across the entire dependency tree
    // to resolve to a single physical copy. Without this, pnpm hoists
    // multiple copies of @tamagui/web and each gets its own module-scoped
    // tokensMerged variable — only the one where createTamagui() ran
    // gets populated, while others stay undefined.
    dedupe: ['@tamagui/web', 'tamagui'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    reporters: process.env.CI ? 'verbose' : 'default',
    pool: 'threads',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**'],
    server: {
      deps: {
        // Inline ALL @tamagui/* packages so they are processed by Vite's
        // resolver (which honours dedupe) rather than Node's resolver (which
        // follows pnpm symlinks to separate copies). This guarantees a
        // single @tamagui/web module instance across all test files.
        inline: [/^@tamagui/],
      },
    },
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
