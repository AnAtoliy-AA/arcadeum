import Link from 'next/link';
import type { Metadata } from 'next';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Page not found',
    description: `The page you're looking for doesn't exist on ${appConfig.appName}.`,
    path: '/404',
    index: false,
    locale,
  });
}

const QUICK_LINKS = [
  { href: routes.home, label: 'Home' },
  { href: routes.games, label: 'Browse games' },
  { href: routes.tournaments, label: 'Tournaments' },
  { href: routes.leaderboards, label: 'Leaderboards' },
  { href: routes.help, label: 'Help center' },
];

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}
        >
          404
        </p>
        <h1 style={{ marginTop: '0.5rem', fontSize: '2rem' }}>
          We can&rsquo;t find that page
        </h1>
        <p style={{ opacity: 0.75, marginTop: '0.75rem' }}>
          The link might be broken or the page may have moved. Try one of these
          instead:
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '1.5rem 0 0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            justifyContent: 'center',
          }}
        >
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: 999,
                  border: '1px solid currentColor',
                  textDecoration: 'none',
                  opacity: 0.85,
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
