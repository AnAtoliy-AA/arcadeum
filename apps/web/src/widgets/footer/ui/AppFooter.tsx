import { Footer } from '@arcadeum/ui';
import { appConfig } from '@/shared/config/app-config';

export function AppFooter() {
  const { social, appName, appVersion } = appConfig;

  return (
    <Footer
      appName={appName}
      social={social}
      copyrightLabel={`© ${new Date().getFullYear()} ${appName}`}
      versionLabel={appVersion}
    />
  );
}
