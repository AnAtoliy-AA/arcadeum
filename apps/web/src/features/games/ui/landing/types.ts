import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type GameBreadcrumbItem = BreadcrumbItem;

export interface GameLandingLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  accentGlow?:
    | 'cyan'
    | 'emerald'
    | 'indigo'
    | 'purple'
    | 'amber'
    | 'rose'
    | 'orange'
    | 'blue';
}

export interface GameLandingHeroProps {
  gameId: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  intro?: string;
  category?: string;
  playersBadge?: string;
  durationBadge?: string;
  difficultyBadge?: string;
  chips?: string[];
  ctaQuickplayLabel?: string;
  ctaQuickplayErrorLabel?: string;
  ctaPlayHumanLabel?: string;
  ctaPlayHumanErrorLabel?: string;
  browseRoomsLabel?: string;
  createRoomLabel?: string;
  roomsHref: string;
  createRoomHref?: string;
  heroVisual?: ReactNode;
  /** Game disabled by admin — quickplay buttons are rendered disabled. */
  comingSoon?: boolean;
}

export interface GameHighlightItem {
  key: string;
  icon?: string | ReactNode;
  title: string;
  body: string;
}

export interface GameHighlightsGridProps {
  title?: string;
  kicker?: string;
  items: GameHighlightItem[];
}

export interface GameHowToStep {
  key: string;
  stepNumber: number;
  title: string;
  body: string;
  tip?: string;
  icon?: ReactNode | string;
}

export interface GameHowToPlayProps {
  title?: string;
  kicker?: string;
  intro?: string;
  steps: GameHowToStep[];
}

export interface GameThemeItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  tag?: string;
  previewUrl?: string;
  preview?: ReactNode;
}

export interface GameThemesShowcaseProps {
  gameId?: string;
  title?: string;
  kicker?: string;
  subtitle?: string;
  themes: GameThemeItem[];
  baseHref?: string;
  createRoomLabel?: string;
  /** Game disabled by admin — theme cards stop linking to room creation. */
  comingSoon?: boolean;
}

export interface GameRuleItem {
  key: string;
  head: string;
  body: string;
}

export interface GameRulesSectionProps {
  title?: string;
  kicker?: string;
  rules: GameRuleItem[];
  note?: string;
}

export interface GameStrategyTip {
  key: string;
  title: string;
  body: string;
}

export interface GameStrategySectionProps {
  title?: string;
  kicker?: string;
  intro?: string;
  tips: GameStrategyTip[];
}

export interface GameFaqItem {
  key: string;
  question: string;
  answer: string;
}

export interface GameFaqSectionProps {
  title?: string;
  kicker?: string;
  items: GameFaqItem[];
}

export interface RelatedGameCard {
  slug: string;
  name: string;
  category: string;
  players: string;
  description: string;
  href: string;
  badge?: string;
}

export interface GameRelatedGamesProps {
  title?: string;
  kicker?: string;
  currentGameSlug: string;
  games: RelatedGameCard[];
}

export interface GameFinalCtaProps {
  gameId: string;
  title: string;
  subtitle?: string;
  roomsHref: string;
  gamesHref: string;
  ctaQuickplayLabel?: string;
  ctaQuickplayErrorLabel?: string;
  ctaPlayHumanLabel?: string;
  ctaPlayHumanErrorLabel?: string;
  browseRoomsLabel?: string;
  backToGamesLabel?: string;
  /** Game disabled by admin — quickplay buttons are rendered disabled. */
  comingSoon?: boolean;
}

export interface UnifiedGameLandingProps {
  breadcrumbs?: BreadcrumbItem[];
  accentGlow?:
    | 'cyan'
    | 'emerald'
    | 'indigo'
    | 'purple'
    | 'amber'
    | 'rose'
    | 'orange'
    | 'blue';
  hero: GameLandingHeroProps;
  highlights?: GameHighlightsGridProps;
  howToPlay?: {
    title?: string;
    kicker?: string;
    intro?: string;
    steps: GameHowToStep[];
  };
  themes?: GameThemesShowcaseProps;
  rules?: GameRulesSectionProps;
  strategy?: GameStrategySectionProps;
  faq?: GameFaqSectionProps;
  relatedGames?: GameRelatedGamesProps;
  finalCta: GameFinalCtaProps;
  extraSection?: ReactNode;
  /** Game disabled by admin — quickplay buttons are rendered disabled. */
  comingSoon?: boolean;
}
