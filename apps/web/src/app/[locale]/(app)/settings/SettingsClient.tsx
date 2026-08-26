'use client';

import SettingsPage from './SettingsPage';
import type { SettingsPageProps } from './SettingsPage';

function SettingsClient({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsPageProps) {
  return (
    <SettingsPage
      appName={appName}
      downloads={downloads}
      supportCta={supportCta}
      description={description}
    />
  );
}

export default SettingsClient;
