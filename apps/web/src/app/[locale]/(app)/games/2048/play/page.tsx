import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { PageLayout } from '@arcadeum/ui';
import { Game2048Client } from './Game2048Client';

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
  const name = messages.games?.game_2048_v1?.name ?? '2048';
  return { title: `${name} · Arcadeum` };
}

export default async function Game2048PlayRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  resolveLocale(rawLocale);

  return (
    <PageLayout>
      <div className="box-border min-h-screen py-2 sm:py-3">
        <Game2048Client />
      </div>
    </PageLayout>
  );
}
