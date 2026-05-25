import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import TicTacToeClient from './TicTacToeClient';

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
  const meta = messages.games?.tic_tac_toe?.meta;

  return {
    title: meta?.title ?? 'Tic-Tac-Toe',
    description: meta?.description,
  };
}

export default function TicTacToePage() {
  return <TicTacToeClient />;
}
