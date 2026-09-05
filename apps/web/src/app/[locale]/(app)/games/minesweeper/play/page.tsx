import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { PageLayout } from '@arcadeum/ui';
import { MinesweeperGameClient } from './MinesweeperGameClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const name = messages.games?.minesweeper_v1?.name ?? 'Minesweeper';
  return { title: `${name} · Arcadeum` };
}

export default async function MinesweeperPlayRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  resolveLocale(rawLocale);

  return (
    <PageLayout className="min-h-0 flex-1">
      <div className="box-border flex-1 py-1 sm:py-1.5 flex flex-col justify-center">
        <MinesweeperGameClient />
      </div>
    </PageLayout>
  );
}
