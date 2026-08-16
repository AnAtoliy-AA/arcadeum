'use client';

import SettingsPage from './SettingsPage';
import type { SettingsPageProps } from './SettingsPage';

function SettingsClient(props: SettingsPageProps) {
  return <SettingsPage {...props} />;
}

export default SettingsClient;
