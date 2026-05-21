import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import SettingsClient from './SettingsClient';

const DESCRIPTION = `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Settings',
    description: DESCRIPTION,
    path: routes.settings,
    index: false,
    locale,
  });
}

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
