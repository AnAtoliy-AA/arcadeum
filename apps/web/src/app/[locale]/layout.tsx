import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { appConfig } from '@/shared/config/app-config';
import { Header } from '@/widgets/header/ui/Header';
import { AnnouncementBanner } from '@/widgets/AnnouncementBanner/ui/AnnouncementBanner';
import { LayoutFooter } from '@/widgets/footer';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa/PWAContext';
import { WalletLiveBridge } from '@/features/wallet/ui/WalletLiveBridge';
import { SoundProvider } from '@/shared/lib/sound';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import {
  isLocale,
  SUPPORTED_LOCALES,
  localeToHreflang,
  type Locale,
} from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  ru: 'ru_RU',
  by: 'be_BY',
};

const SCHEMA_LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
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
    SUPPORTED_LOCALES.map((l) => [
      localeToHreflang(l),
      `${appConfig.siteUrl}/${l}`,
    ]),
  );

  return {
    alternates: {
      canonical: localeUrl,
      languages: { ...languages, 'x-default': appConfig.siteUrl },
    },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE_MAP[locale],
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE_MAP[l],
      ),
      url: localeUrl,
      siteName: appConfig.appName,
      title: appConfig.seoTitle,
      description: appConfig.seoDescription,
      images: [
        {
          url: `${appConfig.siteUrl}/logo.png`,
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

  const [authToken, messages] = await Promise.all([
    getServerAccessToken(),
    getTranslations(locale),
  ]);

  const localeUrl = `${appConfig.siteUrl}/${locale}`;
  const routes = buildRoutes(locale);
  const localizedDescription =
    messages.seo?.home?.description ?? appConfig.seoDescription;
  const inLanguage = SCHEMA_LANGUAGE_MAP[locale];

  // WebSite + SoftwareApplication structured data, localized via `inLanguage`
  // and translated descriptions. The Organization entity is locale-agnostic
  // and lives in the root layout.
  const localeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: appConfig.appName,
      url: localeUrl,
      inLanguage,
      description: localizedDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${appConfig.siteUrl}${routes.games}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: appConfig.appName,
      url: localeUrl,
      inLanguage,
      description: localizedDescription,
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1240',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  return (
    <LanguageProvider locale={locale}>
      <PWAProvider>
        <SoundProvider>
          <JsonLd id={`json-ld-locale-${locale}`} data={localeJsonLd} />
          <AnnouncementBanner />
          <Header />
          {children}
          <LayoutFooter />
          {authToken ? <WalletLiveBridge authToken={authToken} /> : null}
        </SoundProvider>
      </PWAProvider>
    </LanguageProvider>
  );
}
