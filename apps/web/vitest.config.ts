import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
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
