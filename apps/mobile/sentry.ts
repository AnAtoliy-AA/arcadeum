import Constants from 'expo-constants';

type SentryModule = {
  init: (options: {
    dsn?: string;
    enabled?: boolean;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
    debug?: boolean;
    enableNative?: boolean;
    sendDefaultPii?: boolean;
    enableLogs?: boolean;
    integrations?: unknown[];
  }) => void;
  captureMessage: (message: string) => void;
  mobileReplayIntegration: () => unknown;
  feedbackIntegration: () => unknown;
};

const requireSentry = (): SentryModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    return require('@sentry/react-native') as SentryModule;
  } catch {
    return null;
  }
};

const sentry = requireSentry();

const extraConfig = (Constants?.expoConfig?.extra ?? {}) as {
  SENTRY_DSN?: unknown;
};
const envDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const dsnValue =
  typeof extraConfig.SENTRY_DSN === 'string'
    ? extraConfig.SENTRY_DSN
    : envDsn;

if (sentry && dsnValue) {
  sentry.init({
    dsn: dsnValue,
    enabled: true,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    debug: false,
    enableNative: true,
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [
      sentry.mobileReplayIntegration(),
      sentry.feedbackIntegration(),
    ],
  });

  const testFlag = (process.env.EXPO_PUBLIC_SENTRY_TEST_EVENT || '').toLowerCase();
  if (testFlag === '1' || testFlag === 'true') {
    sentry.captureMessage('Sentry setup test event (FE)');
  }
}

export default sentry;
