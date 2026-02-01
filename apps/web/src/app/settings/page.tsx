

import { appConfig } from "@/shared/config/app-config";
import { SettingsPage as SettingsPageView } from "@/app/settings/SettingsPage";

export const metadata = {
  title: "Settings",
  description: `Manage your appearance, language, and download preferences for the ${appConfig.appName} web experience.`,
};

export default function SettingsRoute() {
  return (
    <SettingsPageView
      appName={appConfig.appName}
      downloads={appConfig.downloads}
      supportCta={appConfig.supportCta}
      description={metadata.description}
    />
  );
}
