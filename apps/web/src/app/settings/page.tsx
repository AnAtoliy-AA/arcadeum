import type { Metadata } from "next";

import { appConfig } from "@/lib/app-config";

import SettingsContent from "./SettingsContent";

const SETTINGS_DESCRIPTION =
  "Manage your appearance, language, and download preferences for the Arcadeum web experience.";

export const metadata: Metadata = {
  title: `Settings · ${appConfig.appName}`,
  description: SETTINGS_DESCRIPTION,
};

export default function SettingsPage() {
  return (
    <SettingsContent
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={SETTINGS_DESCRIPTION}
    />
  );
}
