import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import TermsClient from './TermsClient';

const LEGAL_NAME =
  process.env.NEXT_PUBLIC_LEGAL_NAME ??
  'Individual Entrepreneur Anatoliy Aliaksandrau';
const ID_CODE = process.env.NEXT_PUBLIC_ID_CODE ?? '';
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@arcadeum.app';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ??
  'Monday – Friday, 10:00 – 18:00 (GMT+4)';

export const metadata = {
  title: `Terms of Service - ${appConfig.appName}`,
};

export default async function TermsPage() {
  const messages = await getTranslations();

  return (
    <TermsClient
      t={messages.legal?.terms}
      contactT={messages.legal?.contact}
      LEGAL_NAME={LEGAL_NAME}
      ID_CODE={ID_CODE}
      SUPPORT_EMAIL={SUPPORT_EMAIL}
      WORKING_HOURS={WORKING_HOURS}
    />
  );
}
