import SettingsContent, { type SettingsContentProps } from './SettingsContent';

export type SettingsPageProps = SettingsContentProps;

export default function SettingsPage({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsPageProps) {
  return (
    <SettingsContent
      appName={appName}
      downloads={downloads}
      supportCta={supportCta}
      description={description}
    />
  );
}
