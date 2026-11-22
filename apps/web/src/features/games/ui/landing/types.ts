import type { ReactNode } from 'react';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type {
  GameSpecTableProps,
  PlatformComparisonTableProps,
} from '@arcadeum/ui';

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

export interface QuickNavItem {
  id: string;
  label: string;
  badge?: string;
  href?: string;
}

export interface GameLandingHeroProps {
  gameId: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  intro?: string;
  directAnswer?: string;
  category?: string;
  playersBadge?: string;
  durationBadge?: string;
  difficultyBadge?: string;
  chips?: string[];
  /** Label of the secondary "Play vs bot" action. Defaults to the i18n key. */
  ctaQuickplayLabel?: string;
  ctaQuickplayErrorLabel?: string;
  /** Label of the primary "Play now" action. Defaults to the i18n key. */
  ctaPlayHumanLabel?: string;
  ctaPlayHumanErrorLabel?: string;
  browseRoomsLabel?: string;
  createRoomLabel?: string;
  roomsHref: string;
  createRoomHref?: string;
  heroVisual?: ReactNode;
  initialTheme?: string;
  comingSoon?: boolean;
  /** @deprecated Ignored: the sticky section nav is generated automatically. */
  quickNavItems?: QuickNavItem[];
}

/** Entry of the sticky in-page navigation. `labelKey` is an i18n key. */
export interface GameSectionNavItem {
  id: string;
  labelKey: TranslationKey;
  /**
   * Where the item sits in the nav. `afterPlay` for hubs rendered in
   * `topSection` (right below the hero); `end` (default) places it after
   * Strategy, matching `extraSection` content.
   */
  placement?: 'afterPlay' | 'end';
}

export interface GameHighlightItem {
  key: string;
  icon?: string | ReactNode;
  title: string;
  body: string;
}

export interface GameHighlightsGridProps {
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** Anchor id used by the sticky section nav. Defaults per section. */
  id?: string;
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
  /** @deprecated Final CTA no longer shows a browse-rooms button. */
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
  /** @deprecated Ignored: the sticky section nav is generated automatically. */
  quickNavItems?: QuickNavItem[];
  topSection?: ReactNode;
  /**
   * Extra anchors appended to the sticky section nav, e.g. for sections
   * rendered via `topSection` / `extraSection`. Ids must exist on the page.
   */
  extraNavItems?: GameSectionNavItem[];
  specifications?: GameSpecTableProps;
  comparison?: PlatformComparisonTableProps;
  highlights?: GameHighlightsGridProps;
  howToPlay?: GameHowToPlayProps;
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
