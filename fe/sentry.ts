import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const dsn = (Constants?.expoConfig?.extra as any)?.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  debug: false,
  enableNative: true,
  sendDefaultPii: true,
  enableLogs: true,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

// Optional: send a test event at startup when explicitly enabled via env
const testFlag = (process.env.EXPO_PUBLIC_SENTRY_TEST_EVENT || '').toLowerCase();
if (dsn && (testFlag === '1' || testFlag === 'true')) {
  Sentry.captureMessage('Sentry setup test event (FE)');
}

export default Sentry;
