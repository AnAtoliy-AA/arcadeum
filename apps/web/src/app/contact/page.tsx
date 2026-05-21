import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, contactPage } from '@/shared/seo/jsonLd';
import ContactView from './ContactView';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ?? 'Mon – Fri, 10:00 – 18:00 (GMT+4)';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description: `Get in touch with the ${appConfig.appName} team — support, partnerships, press, and feedback.`,
  path: routes.contact,
  keywords: ['contact arcadeum', 'support', 'feedback', 'partnerships'],
});

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
