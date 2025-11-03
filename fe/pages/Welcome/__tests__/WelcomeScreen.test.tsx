import React from 'react';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import type { Router } from 'expo-router';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../WelcomeScreen';
import { useRouter } from 'expo-router';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';

const routerSpy = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
  navigate: jest.fn(),
  dismiss: jest.fn(),
  dismissTo: jest.fn(),
  dismissAll: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  replaceParams: jest.fn(),
  link: jest.fn(),
  reload: jest.fn(),
  prefetch: jest.fn(),
  canDismiss: jest.fn(() => false),
  isReady: jest.fn(() => true),
} as unknown as jest.Mocked<Router>;

const defaultTokens = {
  provider: null,
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  updatedAt: null,
  userId: null,
  email: null,
  username: null,
  displayName: null,
} as const;

type SessionGateState = {
  tokens: typeof defaultTokens;
  hydrated: boolean;
  isAuthenticated: boolean;
  redirectEnabled: boolean;
  shouldBlock: boolean;
};

function buildSessionGate(
  overrides?: Partial<SessionGateState>,
): SessionGateState {
  return {
    tokens: { ...defaultTokens },
    hydrated: true,
    isAuthenticated: false,
    redirectEnabled: false,
    shouldBlock: false,
    ...overrides,
  };
}

const translationTable: Record<string, string> = {
  'welcome.tagline': 'Your community hub',
  'welcome.description': 'Connect with {{appName}} anywhere.',
  'common.actions.getStarted': 'Get started',
  'common.actions.openApp': 'Open app',
  'welcome.supportCta': 'Support the developers',
  'welcome.runningOn': 'Running on {{platform}}',
};

function buildTranslator() {
  return jest.fn((key: string, replacements?: Record<string, unknown>) => {
    const template = translationTable[key] ?? key;
    if (!replacements) {
      return template;
    }
    return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
      const value = replacements[token];
      return value === undefined ? `{{${token}}}` : String(value);
    });
  });
}

type TranslationState = {
  t: ReturnType<typeof buildTranslator>;
  locale: string;
};

type RouterHook = () => Router;
type SessionGateHook = () => SessionGateState;
type TranslationHook = () => TranslationState;
type AppNameHook = (defaultName?: string) => string;

const useRouterMock = useRouter as unknown as jest.MockedFunction<RouterHook>;
const useSessionScreenGateMock =
  useSessionScreenGate as unknown as jest.MockedFunction<SessionGateHook>;
const useTranslationMock =
  useTranslation as unknown as jest.MockedFunction<TranslationHook>;
const useAppNameMock =
  useAppName as unknown as jest.MockedFunction<AppNameHook>;

beforeEach(() => {
  routerSpy.push.mockReset();
  routerSpy.replace.mockReset();
  routerSpy.back.mockReset();
  routerSpy.canGoBack.mockReturnValue(false);

  useRouterMock.mockReturnValue(routerSpy);
  useSessionScreenGateMock.mockReturnValue(
    buildSessionGate({ isAuthenticated: false, redirectEnabled: false }),
  );
  useTranslationMock.mockReturnValue({
    t: buildTranslator(),
    locale: 'en',
  } as TranslationState);
  useAppNameMock.mockReturnValue('Aico App');
});

describe('WelcomeScreen', () => {
  it('renders the hero copy and CTA buttons', () => {
    const { getByText } = render(<WelcomeScreen />);

    expect(getByText('Aico App')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
    expect(getByText('Support the developers')).toBeTruthy();
  });

  it('navigates to auth when unauthenticated', () => {
    const { getByText } = render(<WelcomeScreen />);

    fireEvent.press(getByText('Get started'));

    expect(routerSpy.push).toHaveBeenCalledWith('/auth');
    expect(routerSpy.replace).not.toHaveBeenCalled();
  });

  it('replaces the route when the session is already authenticated', () => {
    useSessionScreenGateMock.mockReturnValue(
      buildSessionGate({ isAuthenticated: true, redirectEnabled: false }),
    );
    useTranslationMock.mockReturnValue({
      t: buildTranslator(),
      locale: 'en',
    } as TranslationState);

    const { getByText } = render(<WelcomeScreen />);

    fireEvent.press(getByText('Open app'));

    expect(routerSpy.replace).toHaveBeenCalledWith('/(tabs)');
    expect(routerSpy.push).not.toHaveBeenCalled();
  });

  it('shows a loading indicator while the session gate is blocking', () => {
    useSessionScreenGateMock.mockReturnValue(
      buildSessionGate({ redirectEnabled: true, shouldBlock: true }),
    );

    const { getByTestId, queryByText } = render(<WelcomeScreen />);

    expect(getByTestId('welcome-loading-indicator')).toBeTruthy();
    expect(queryByText('Get started')).toBeNull();
  });
});
