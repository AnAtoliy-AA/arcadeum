import type { Metadata } from 'next';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { DuelClient } from '@/widgets/BoardGames/ChessPuzzles/ui/DuelClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '1v1 Chess Puzzle Duel | Arcadeum Games',
    description:
      'Compete in real-time 1v1 tactical puzzle battles against players and bots.',
  };
}

export default async function ChessPuzzleDuelPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return <DuelClient locale={locale} />;
}
