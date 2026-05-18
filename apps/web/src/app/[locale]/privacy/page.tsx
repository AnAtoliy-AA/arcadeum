import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import PrivacyClient from './PrivacyClient';

const PRIVACY_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'arcadeum.care@gmail.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'privacy' })
    : {};
}

export default async function PrivacyPage() {
  const messages = await getTranslations();

  return (
    <PrivacyClient
      t={messages.legal?.privacy}
      contactT={messages.legal?.contact}
      PRIVACY_EMAIL={PRIVACY_EMAIL}
    />
  );
}
