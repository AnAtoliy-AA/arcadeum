import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { buildRoutes } from '@/shared/config/routes';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';

// `not-found.tsx` is rendered outside the normal segment context, so we
// can't read params here. Fall back to the language cookie that the
// middleware/LanguageProvider keeps in sync with the URL.
async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get('app-language')?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // 404 should not be indexed even though it's technically discoverable.
  return buildPageMetadata({ locale, page: 'notFound', noIndex: true });
}

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getTranslations(locale);
  const seo = messages.seo?.notFound;
  const routes = buildRoutes(locale);

  const title = seo?.title ?? 'Page not found';
  const description =
    seo?.description ??
    "The page you're looking for doesn't exist. Browse our games or head back home.";

  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: '24px',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          margin: 0,
          fontWeight: 700,
        }}
      >
        {title}
      </h1>
      <p style={{ maxWidth: 560, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href={routes.home}
          className="home-link-button home-link-button-primary"
        >
          {messages.common?.actions?.openApp ?? 'Open app'}
        </Link>
        <Link
          href={routes.games}
          className="home-link-button"
          style={{ opacity: 0.85 }}
        >
          {messages.navigation?.gamesTab ?? 'Games'}
        </Link>
      </div>
    </main>
  );
}
