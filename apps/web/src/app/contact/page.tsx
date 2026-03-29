import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { ContactClient } from './ContactClient';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ?? 'Mon – Fri, 10:00 – 18:00 (GMT+4)';

export const metadata = {
  title: `Contact Us - ${appConfig.appName}`,
};

export default async function ContactPage() {
  const messages = await getTranslations();
  const t = messages.legal?.contact;

  return (
    <ContactClient
      t={t}
      SUPPORT_EMAIL={SUPPORT_EMAIL}
      WORKING_HOURS={WORKING_HOURS}
    />
  );
}
