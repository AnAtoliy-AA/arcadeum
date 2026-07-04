import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { buildRoutes } from '@/shared/config/routes';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';

// `not-found.tsx` is rendered outside the normal segment context, so we
// can't read params. We use a hardcoded default locale for the 404 page
// since translations aren't critical for a not-found page.
const locale: Locale = DEFAULT_LOCALE;
const routes = buildRoutes(locale);

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ locale, page: 'notFound', noIndex: true });
}

export default function NotFound() {
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
        Page not found
      </h1>
      <p style={{ maxWidth: 560, margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
        The page you&apos;re looking for doesn&apos;t exist. Browse our games or
        head back home.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href={routes.home}
          className="home-link-button home-link-button-primary"
        >
          Open app
        </Link>
        <Link
          href={routes.games}
          className="home-link-button"
          style={{ opacity: 0.85 }}
        >
          Games
        </Link>
      </div>
    </main>
  );
}
