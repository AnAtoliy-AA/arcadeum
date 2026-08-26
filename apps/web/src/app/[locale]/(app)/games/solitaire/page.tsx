import type { Metadata } from 'next';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import SolitaireLanding from './SolitaireLanding';

const SOLITAIRE_SLUG = 'solitaire_v1';

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
  return buildPageMetadata({ locale, page: 'solitaireLanding' });
}

export default async function SolitaireLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const game = messages.games?.solitaire_v1;
  const landing = game?.landing;
  const rules = game?.rules;
  const gameName = game?.name ?? 'Solitaire';
  const description = game?.description ?? landing?.meta.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: SOLITAIRE_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: 1,
      maxPlayers: 1,
      genre: 'Card Game',
      alternateName: ['Klondike', 'Patience', 'Solitaire Online'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  return (
    <>
      <JsonLd id="json-ld-solitaire" data={jsonLd} />
      <SolitaireLanding
        gameId={SOLITAIRE_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        playHref={routes.solitairePlay}
        rules={rules}
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, [
          'Solitaire',
          'Klondike',
          'Card Game',
          'Пасьянс',
        ])}
      />
    </>
  );
}
