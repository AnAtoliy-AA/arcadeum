import type { Metadata } from "next";

import { appConfig } from "@/shared/config/app-config";

import { SettingsPage as SettingsPageView } from "@/pages/settings/ui/SettingsPage/SettingsPage";

const SETTINGS_DESCRIPTION = `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`;

export const metadata: Metadata = {
  title: `Settings · ${appConfig.appName}`,
  description: SETTINGS_DESCRIPTION,
};

export default function SettingsRoute() {
  return (
    <SettingsPageView
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={SETTINGS_DESCRIPTION}
    />
  );
}
