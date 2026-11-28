// ISR: regenerated every 5 minutes. Not force-static, and the client refetches
// when the server had no metadata, so an API outage during a build or a
// regeneration cannot leave an empty token page cached for good.
export const revalidate = 300;

import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import TokenClient from './TokenClient';
import { fetchTokenMetadata } from '@/shared/api/tokenMetadata';
import { getArcConfig } from '@/shared/api/arc-config';

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
  const [metadata, arcConfig] = await Promise.all([
    fetchTokenMetadata().catch(() => null),
    getArcConfig().catch(() => null),
  ]);

  return (
    <>
      <PageBreadcrumb locale={locale} page="token" />
      <TokenClient
        mintAddress={
          arcConfig?.mintAddress ?? process.env.ARCADEUM_MINT_ADDRESS
        }
        poolAddress={arcConfig?.poolAddress}
        initialMetadata={metadata}
      />
    </>
  );
}
