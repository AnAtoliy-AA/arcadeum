'use client';

import SettingsContent, { type SettingsContentProps } from './SettingsContent';

export type SettingsPageProps = SettingsContentProps;

export default function SettingsPage(props: SettingsPageProps) {
  return <SettingsContent {...props} />;
}
