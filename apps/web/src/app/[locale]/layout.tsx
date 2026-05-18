import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { appConfig } from '@/shared/config/app-config';
import { Header } from '@/widgets/header/ui/Header';
import { AnnouncementBanner } from '@/widgets/AnnouncementBanner/ui/AnnouncementBanner';
import { LayoutFooter } from '@/widgets/footer';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa/PWAContext';
import { WalletLiveBridge } from '@/features/wallet/ui/WalletLiveBridge';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { isLocale, SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  ru: 'ru_RU',
  by: 'be_BY',
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const localeUrl = `${appConfig.siteUrl}/${locale}`;
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${appConfig.siteUrl}/${l}`]),
  );

  return {
    alternates: {
      canonical: localeUrl,
      languages: { ...languages, 'x-default': appConfig.siteUrl },
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale],
      url: localeUrl,
      siteName: appConfig.appName,
      title: appConfig.seoTitle,
      description: appConfig.seoDescription,
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: appConfig.appName,
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const authToken = await getServerAccessToken();

  return (
    <LanguageProvider locale={locale}>
      <PWAProvider>
        <AnnouncementBanner />
        <Header />
        {children}
        <LayoutFooter />
        {authToken ? <WalletLiveBridge authToken={authToken} /> : null}
      </PWAProvider>
    </LanguageProvider>
  );
}
