import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { PrivacyClient } from './PrivacyClient';

const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'arcadeum.care@gmail.com';

export const metadata = {
  title: `Privacy Policy - ${appConfig.appName}`,
};

export default async function PrivacyPage() {
  const messages = await getTranslations();

  return <PrivacyClient messages={messages} PRIVACY_EMAIL={PRIVACY_EMAIL} />;
}
