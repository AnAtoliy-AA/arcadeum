import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getSeoMessages } from '@/shared/seo/messages';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, contactPage } from '@/shared/seo/jsonLd';
import ContactView from './ContactView';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ?? 'Mon – Fri, 10:00 – 18:00 (GMT+4)';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'contact');
  return buildMetadata({
    ...seo,
    path: routes.contact,
    keywords: ['contact arcadeum', 'support', 'feedback', 'partnerships'],
    locale,
  });
}

const CONTACT_JSON_LD = [
  contactPage(),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Contact', path: routes.contact },
  ]),
];

export default async function ContactPage() {
  const messages = await getTranslations();
  const t = messages.legal?.contact;

  return (
    <>
      <JsonLd data={CONTACT_JSON_LD} />
      <ContactView
        t={t}
        SUPPORT_EMAIL={SUPPORT_EMAIL}
        WORKING_HOURS={WORKING_HOURS}
      />
    </>
  );
}
