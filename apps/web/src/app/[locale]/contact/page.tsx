import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import ContactView from './ContactView';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ?? 'Mon – Fri, 10:00 – 18:00 (GMT+4)';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'contact' })
    : {};
}

export default async function ContactPage() {
  const messages = await getTranslations();
  const t = messages.legal?.contact;

  return (
    <ContactView
      t={t}
      SUPPORT_EMAIL={SUPPORT_EMAIL}
      WORKING_HOURS={WORKING_HOURS}
    />
  );
}
