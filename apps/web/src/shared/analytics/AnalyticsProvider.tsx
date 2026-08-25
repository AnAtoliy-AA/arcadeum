'use client';

// Mounts the configured analytics provider (roadmap 6C). Renders nothing and
// is a no-op when analytics env vars are absent. Also captures campaign
// attribution from the current URL on first client render.

import { useEffect } from 'react';
import { analyticsConfig } from '@/shared/config/analytics-config';
import { setAnalyticsDispatcher } from '@/shared/lib/analytics';
import { captureAttribution } from './attribution';
import { loadPlausible, sendPlausibleEvent } from './providers/plausible';
import { loadPostHog, sendPostHogEvent } from './providers/posthog';

export function AnalyticsProvider() {
  useEffect(() => {
    captureAttribution(window.location.search);

    if (!analyticsConfig.enabled) return undefined;

    switch (analyticsConfig.provider) {
      case 'plausible':
        if (analyticsConfig.plausibleDomain) {
          loadPlausible(
            analyticsConfig.plausibleDomain,
            analyticsConfig.plausibleApiHost,
          );
          setAnalyticsDispatcher(sendPlausibleEvent);
        }
        break;
      case 'posthog':
        if (analyticsConfig.posthogKey) {
          loadPostHog(analyticsConfig.posthogKey, analyticsConfig.posthogHost);
          setAnalyticsDispatcher(sendPostHogEvent);
        }
        break;
      default:
        break;
    }

    return () => setAnalyticsDispatcher(null);
  }, []);

  return null;
}
