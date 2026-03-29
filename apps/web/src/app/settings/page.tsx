import { appConfig } from '@/shared/config/app-config';
import { SettingsClient } from './SettingsClient';

export const metadata = {
  title: 'Settings',
  description: `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`,
};

export default function SettingsRoute() {
  return (
    <SettingsClient
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={metadata.description}
    />
  );
}
