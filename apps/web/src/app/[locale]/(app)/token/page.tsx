export const revalidate = 300;
export const dynamic = 'force-static';

import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import TokenClient from './TokenClient';
import { fetchTokenMetadata } from '@/shared/api/tokenMetadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'token' }) : {};
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const metadata = await fetchTokenMetadata().catch(() => null);

  return (
    <>
      <PageBreadcrumb locale={locale} page="token" />
      <TokenClient
        mintAddress={process.env.ARCADEUM_MINT_ADDRESS}
        initialMetadata={metadata}
      />
    </>
  );
}
