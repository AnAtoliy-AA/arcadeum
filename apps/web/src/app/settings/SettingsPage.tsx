'use client';

import SettingsContent, { type SettingsContentProps } from './SettingsContent';

export type SettingsPageProps = SettingsContentProps;

export function SettingsPage(props: SettingsPageProps) {
  return <SettingsContent {...props} />;
}

export default SettingsPage;
