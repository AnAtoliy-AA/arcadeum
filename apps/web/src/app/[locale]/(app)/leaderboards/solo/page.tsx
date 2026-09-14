import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { PageLayout } from '@arcadeum/ui';
import { SoloLeaderboardsClient } from './SoloLeaderboardsClient';

export const dynamic = 'force-static';
export const revalidate = 2592000; // 30 days – ISR: render on first request, cache until user changes language

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function SoloLeaderboardsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);

  return (
    <PageLayout>
      <div className="box-border min-h-screen py-6">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-6 text-2xl font-bold text-[var(--color)]">
            {messages.games?.soloLeaderboard?.pageTitle ??
              'Solo Games Leaderboard'}
          </h1>
          <Suspense>
            <SoloLeaderboardsClient />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}
