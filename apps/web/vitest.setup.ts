import '@testing-library/jest-dom';
import config from './src/shared/config/tamagui.config';

// Tamagui global config key not in Window type
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
