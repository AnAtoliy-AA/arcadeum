import '@testing-library/jest-dom';
import { vi } from 'vitest';

// server-only throws in non-Server-Component contexts (tests, client).
vi.mock('server-only', () => ({}));

// matchMedia mock (jsdom lacks it)
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
