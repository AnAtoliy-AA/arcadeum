import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { appConfig } from '@/shared/config/app-config';
import { Header } from '@/widgets/header/ui/Header';
import { AnnouncementBanner } from '@/widgets/AnnouncementBanner/ui/AnnouncementBanner';
import { getActiveAnnouncement } from '@/widgets/AnnouncementBanner/server/getActiveAnnouncement';
import { LayoutFooter } from '@/widgets/footer';
import { LanguageProvider } from '@/app/i18n/LanguageProvider';
import { PWAProvider } from '@/features/pwa/PWAContext';
import { StatsReplay } from '@/shared/ui/StatsReplay';
import { RootModals } from './RootModals';
import { SoundProvider } from '@/shared/lib/sound';
import {
  isLocale,
  SUPPORTED_LOCALES,
  localeToHreflang,
  type Locale,
} from '@/shared/i18n';
import { getInitialTranslations } from '@/shared/i18n/server';

/** Lazy-load only the seo namespace — avoids pulling 20+ modules into the RSC payload. */
async function loadSeo(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import('@/shared/i18n/messages/seo/en')).en;
    case 'es':
      return (await import('@/shared/i18n/messages/seo/es')).es;
    case 'fr':
      return (await import('@/shared/i18n/messages/seo/fr')).fr;
    case 'ru':
      return (await import('@/shared/i18n/messages/seo/ru')).ru;
    case 'by':
      return (await import('@/shared/i18n/messages/seo/by')).by;
    default:
      return (await import('@/shared/i18n/messages/seo/en')).en;
  }
}
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { SCHEMA_LANGUAGE_MAP } from '@/shared/seo/schemaLanguageMap';
import { LayoutShell } from '@/shared/ui/LayoutShell';

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

  const [seoMessages, initialMessages, announcement] = await Promise.all([
    loadSeo(locale),
    getInitialTranslations(locale),
    // Fetched in parallel with the layout deps and rendered into the
    // initial HTML so the banner never appears after first paint (CLS).
    getActiveAnnouncement(locale),
  ]);

  const localeUrl = `${appConfig.siteUrl}/${locale}`;
  const routes = buildRoutes(locale);
  const localizedDescription =
    seoMessages.home?.description ?? appConfig.seoDescription;
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
        // Client-side filtered games list — no separate search page needed.
        // Google uses this for sitelinks searchbox in the SERP.
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
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  return (
    <>
      <JsonLd id={`json-ld-locale-${locale}`} data={localeJsonLd} />
      <LanguageProvider locale={locale} initialMessages={initialMessages}>
        <PWAProvider>
          <SoundProvider>
            <LayoutShell>
              <AnnouncementBanner initialAnnouncement={announcement} />
              <Header />
              <main id="main-content" className="layout-main">
                {children}
              </main>
              <LayoutFooter />
            </LayoutShell>
            <RootModals />
            <StatsReplay />
          </SoundProvider>
        </PWAProvider>
      </LanguageProvider>
    </>
  );
}
