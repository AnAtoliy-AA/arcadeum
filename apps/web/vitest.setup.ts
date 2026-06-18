import '@testing-library/jest-dom';

// Initialize Tamagui config globally so token resolution works in tests.
// Tamagui internals look for globalThis.__tamaguiConfig (double underscore).
import config from './src/shared/config/tamagui.config';
(globalThis as Record<string, unknown>).__tamaguiConfig = config;

// Mock matchMedia for Tamagui
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
