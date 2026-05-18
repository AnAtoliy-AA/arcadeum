import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import ReferralsClient from './ReferralsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'referrals' })
    : {};
}

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PageBreadcrumb locale={locale} page="referrals" />
      <ReferralsClient />
    </>
  );
}
