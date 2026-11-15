import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { CustomPuzzlesClient } from '@/widgets/BoardGames/ChessPuzzles/ui/CustomPuzzlesClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Custom Chess Puzzles | Arcadeum Games',
    description:
      'Create, validate, play, and share your own custom chess tactics and compositions.',
  };
}

export default async function CustomChessPuzzlesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[var(--textSecondary)] text-sm">
            Loading custom puzzles...
          </div>
        </div>
      }
    >
      <CustomPuzzlesClient locale={locale} />
    </Suspense>
  );
}
