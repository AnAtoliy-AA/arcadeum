import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale } from '@/shared/i18n';
import OfflineGameView from './OfflineGameView';

interface PageProps {
  params: Promise<{ locale: string; game: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const msgs = await getTranslations(locale);
  return {
    title: msgs.pwa?.offlineGame?.title ?? 'Offline Practice',
    description: msgs.pwa?.offlineGame?.description,
    robots: { index: false },
  };
}

export default async function OfflineGameRoute({ params }: PageProps) {
  const { game } = await params;
  return <OfflineGameView slug={game} />;
}
