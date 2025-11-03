import type { ReactNode } from 'react';
import '@testing-library/jest-native/extend-expect';
import { afterEach, jest } from '@jest/globals';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('expo-router', () => {
  const Link = ({ children }: { children: ReactNode }) => children;
  return {
    useRouter: jest.fn(),
    Link,
  };
});

jest.mock('@/hooks/useSessionScreenGate', () => ({
  useSessionScreenGate: jest.fn(),
}));

jest.mock('@/lib/i18n', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@/hooks/useAppName', () => ({
  useAppName: jest.fn(),
}));

jest.mock('@/stores/settings', () => ({
  useSettings: jest.fn(() => ({
    themePreference: 'light',
    language: 'en',
    hydrated: true,
    setThemePreference: jest.fn(),
    setLanguage: jest.fn(),
  })),
  settingsLanguages: [],
  themePreferences: [],
}));

jest.mock('@/hooks/useThemedStyles', () => {
  const paletteStub = {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#0A7EA4',
    icon: '#687076',
  } as const;

  const useThemedStylesMock = <T,>(
    factory: (palette: typeof paletteStub) => T,
  ): T => factory(paletteStub);

  return { useThemedStyles: useThemedStylesMock };
});

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
  revoke: jest.fn(),
}));

jest.mock('expo-auth-session', () => {
  const response = { Code: 'code' };
  return {
    fetchDiscoveryAsync: jest.fn(async () => ({})),
    AuthRequest: jest.fn().mockImplementation(() => ({
      codeVerifier: 'verifier',
      state: 'state',
      makeAuthUrlAsync: jest.fn(async () => 'https://example.com/auth'),
    })),
    ResponseType: response,
    revokeAsync: jest.fn(async () => {}),
  };
});