import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import SettingsClient from './SettingsClient';

const DESCRIPTION = `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`;

export const metadata: Metadata = buildMetadata({
  title: 'Settings',
  description: DESCRIPTION,
  path: routes.settings,
  index: false,
});

export default function SettingsRoute() {
  return (
    <SettingsClient
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={DESCRIPTION}
    />
  );
}
