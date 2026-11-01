import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildGameLandingJsonLd } from '@/shared/seo/buildGameLandingJsonLd';
import ArcadePetLanding from './ArcadePetLanding';

export const dynamic = 'force-static';
export const revalidate = 300;

const ARCADE_PET_SLUG = 'arcade_pet_v1';
const ARCADE_PET_GENRE = 'Simulation';

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
  const base = await buildPageMetadata({ locale, page: 'arcadePetLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/arcade-pet/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'ArcadePet - Free Virtual Pet Simulation on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [
        `${appConfig.siteUrl}/${locale}/games/arcade-pet/opengraph-image`,
      ],
    },
  };
}

export default async function ArcadePetLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);

  const gameName = messages.games?.arcade_pet_v1?.name ?? 'ArcadePet';
  const description =
    messages.games?.arcade_pet_v1?.description ??
    'Retro virtual pet simulation with cross-game treats and evolution';

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: ARCADE_PET_SLUG,
    slug: 'arcade-pet',
    gameName,
    description,
    locale,
    minPlayers: 1,
    maxPlayers: 1,
    genre: ARCADE_PET_GENRE,
    alternateName: ['Virtual Pet', 'Retro Cyber Pet', 'Arcade Companion'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArcadePetLanding gameName={gameName} description={description} />
    </>
  );
}
