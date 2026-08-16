'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { AccentPill, IconButton, LinkButton } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes, useLocale } from '@/shared/config/useRoutes';
import type { Routes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';
import type { FeaturedGame } from '../data/games';
import { FALLBACK_ACCENT, GameSymbol } from './featured-games/gameMeta';

interface HomeCopy {
  demoBadge?: string;
  demoBadgeLabel?: string;
  showMore?: string;
  gamePlayButton?: string;
  gameTryDemo?: string;
  gameComingSoon?: string;
  gameHowToPlay?: string;
  gameMetaPlayers?: string;
  gameMetaMatch?: string;
  gameMetaPlayingNow?: string;
}

interface Props {
  game: FeaturedGame;
  homeCopy: HomeCopy;
  onOpenDetails: (gameId: string) => void;
  comingSoon?: boolean;
}

function resolveLandingHref(game: FeaturedGame, locale: Locale): string | null {
  if (!game.landingHref) return null;
  return `/${locale}${game.landingHref}`;
}

function getCardLinkHref(
  game: FeaturedGame,
  routes: Routes,
  locale: Locale,
): string {
  return resolveLandingHref(game, locale) ?? routes.games;
}

function getPlayHref(
  game: FeaturedGame,
  routes: Routes,
  locale: Locale,
  comingSoon: boolean,
): string {
  if (!game.isPlayable || comingSoon) return '#';
  const landing = resolveLandingHref(game, locale);
  if (landing) return landing;
  return `${routes.gameCreate}?gameId=${game.id}`;
}

function formatPlayingNow(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export function HomeGameCard({
  game,
  homeCopy,
  onOpenDetails,
  comingSoon = false,
}: Props) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const locale = useLocale();

  const isDisabled = comingSoon || !game.isPlayable;
  const accent = game.accentColor ?? FALLBACK_ACCENT;

  const playLabel = comingSoon
    ? (homeCopy.gameComingSoon ?? 'Coming Soon')
    : game.isDemo
      ? (homeCopy.gameTryDemo ?? 'Try demo')
      : (homeCopy.gamePlayButton ?? 'Play now');

  const accentVar = { '--game-accent': accent } as CSSProperties;

  return (
    <article
      className="featured-card-main relative isolate flex h-full flex-col overflow-hidden rounded-[20px] border border-glass-border bg-glass-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_40px_-22px_rgba(0,0,0,0.7)] transition-[transform,border-color] duration-[250ms] after:pointer-events-none hover:-translate-y-[3px] hover:border-[color:color-mix(in_srgb,var(--game-accent)_30%,var(--glassBorder))]"
      style={accentVar}
      data-testid={`game-card-${game.id}`}
    >
      <div className="featured-card-cover-main relative h-[200px] shrink-0 bg-featured-cover after:absolute after:inset-x-0 after:bottom-0 after:h-[60%] after:bg-card-cover-fade">
        <Link
          href={getCardLinkHref(game, routes, locale)}
          data-testid={`game-title-link-${game.id}`}
          className="featured-card-cover-link absolute inset-0 z-[1] flex items-end p-[18px] text-inherit no-underline focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-4px]"
          aria-label={t(game.nameKey)}
        >
          <AccentPill
            accent={accent}
            className="absolute left-[14px] top-[14px]"
          >
            {game.genre} · {game.pace}
          </AccentPill>

          {game.isDemo ? (
            <span
              data-testid={`game-demo-badge-${game.id}`}
              className="absolute right-[14px] top-[14px] rounded-full bg-[#fde68a] px-[9px] py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b0f12]"
              aria-label={homeCopy.demoBadgeLabel ?? 'Demo build'}
            >
              {homeCopy.demoBadge ?? 'Demo'}
            </span>
          ) : null}

          {comingSoon ? (
            <span
              data-testid="home-game-coming-soon-badge"
              className="absolute right-[14px] top-[14px] rounded-full border border-white/15 bg-[rgba(20,22,28,0.85)] px-[9px] py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            >
              {t('games.create.comingSoon') || 'Coming Soon'}
            </span>
          ) : null}

          <GameSymbol
            gameId={game.id}
            className="featured-card-symbol-main pointer-events-none absolute left-1/2 top-1/2 h-[108px] w-[108px] -translate-x-1/2 -translate-y-[65%] text-[color:color-mix(in_srgb,var(--game-accent)_82%,white_12%)] drop-shadow-[0_6px_28px_color-mix(in_srgb,var(--game-accent)_30%,transparent)]"
            aria-hidden="true"
          />

          <h3
            data-testid={`game-title-${game.id}`}
            className="featured-card-title-main relative z-[1] m-0 text-[26px] font-semibold tracking-[-0.015em] text-white text-shadow-title-soft max-[640px]:text-[22px]"
          >
            {t(game.nameKey)}
          </h3>
        </Link>
      </div>

      <div className="featured-card-body-main flex flex-1 flex-col gap-[14px] p-[16px_18px_18px]">
        <p className="featured-card-desc-main m-0 min-h-[42px] text-[14px] leading-[1.5] text-color opacity-85">
          {t(game.descriptionKey)}
        </p>

        <ul className="featured-card-meta-main m-0 flex list-none flex-wrap gap-x-[14px] gap-y-[6px] p-0 text-[12.5px] text-color opacity-70 [&_b]:font-medium [&_li]:inline-flex [&_li]:items-center [&_li]:gap-[6px]">
          <li>
            <b>{game.players}</b> {homeCopy.gameMetaPlayers ?? 'players'}
          </li>
          <li>
            <b>{game.duration}</b> {homeCopy.gameMetaMatch ?? 'match'}
          </li>
          {game.playingNow != null && (
            <li>
              <b>{formatPlayingNow(game.playingNow)}</b>{' '}
              {homeCopy.gameMetaPlayingNow ?? 'playing now'}
            </li>
          )}
        </ul>

        <div className="featured-card-foot-main mt-auto flex gap-2">
          <LinkButton
            className={
              'featured-card-cta-main flex-1 text-[14px] tracking-[0.01em] [&>span]:font-extrabold'
            }
            href={getPlayHref(game, routes, locale, comingSoon)}
            variant="victory"
            size="sm"
            disabled={isDisabled}
            data-testid="game-play-button"
            aria-label={`${playLabel} ${t(game.nameKey)}`}
          >
            <PlayTriangle aria-hidden />
            <span>{playLabel}</span>
          </LinkButton>
          <IconButton
            className={'opacity-65 hover:opacity-100'}
            variant="icon"
            size="sm"
            onClick={() => onOpenDetails(game.id)}
            title={homeCopy.showMore ?? 'Show Details'}
            aria-label={homeCopy.gameHowToPlay ?? 'How to play'}
            data-testid="game-help-button"
          >
            <InfoIcon aria-hidden />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function PlayTriangle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <polygon points="6 4 20 12 6 20" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
