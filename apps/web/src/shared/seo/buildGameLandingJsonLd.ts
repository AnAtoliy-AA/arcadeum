import { appConfig } from '@/shared/config/app-config';
import type { Locale } from '@/shared/i18n';
import { buildVideoGameJsonLd } from './videoGameJsonLd';
import { buildHowToJsonLd } from './howToJsonLd';
import { buildFaqPageJsonLd } from './faqPageJsonLd';

interface HowToStep {
  name: string;
  text: string;
}

interface FaqEntry {
  question: string;
  answer: string;
}

export interface BuildGameLandingJsonLdInput {
  gameId: string;
  slug: string;
  gameName: string;
  description: string;
  locale: Locale;
  minPlayers?: number;
  maxPlayers?: number;
  genre?: string;
  alternateName?: string[];
  featureList?: string[];
  breadcrumb: {
    home: string;
    games: string;
  };
  howTo?: {
    name: string;
    description?: string;
    steps: HowToStep[];
    totalTime?: string;
  };
  faqs?: FaqEntry[];
}

export function buildGameLandingJsonLd({
  gameId,
  slug,
  gameName,
  description,
  locale,
  minPlayers = 2,
  maxPlayers = 4,
  genre = 'Board Game',
  alternateName,
  featureList,
  breadcrumb,
  howTo,
  faqs,
}: BuildGameLandingJsonLdInput): Record<string, unknown>[] {
  const pageUrl = `${appConfig.siteUrl}/${locale}/games/${slug}`;

  const schemas: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId,
      gameName,
      description,
      locale,
      minPlayers,
      maxPlayers,
      genre,
      alternateName,
      featureList,
      breadcrumb: {
        home: breadcrumb.home,
        games: breadcrumb.games,
        game: gameName,
      },
    }),
  ];

  if (howTo && howTo.steps.length > 0) {
    schemas.push(
      buildHowToJsonLd({
        name: howTo.name,
        description: howTo.description,
        steps: howTo.steps,
        totalTime: howTo.totalTime,
        locale,
        pageUrl,
      }),
    );
  }

  if (faqs && faqs.length > 0) {
    schemas.push(
      ...buildFaqPageJsonLd({
        pageName: gameName,
        pageUrl,
        faqs,
      }),
    );
  }

  return schemas;
}
