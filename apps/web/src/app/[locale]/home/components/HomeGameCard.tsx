'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
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
      data-testid={`game-card-${game.id}`}
      className="featured-card-main"
      style={accentVar}
    >
      <div className="featured-card-cover-main">
        <Link
          href={getCardLinkHref(game, routes, locale)}
          data-testid={`game-title-link-${game.id}`}
          className="featured-card-cover-link"
          aria-label={t(game.nameKey)}
        >
          <span className="featured-card-pill-main">
            <span className="featured-card-pill-dot-main" aria-hidden />
            {game.genre} · {game.pace}
          </span>

          {game.isDemo ? (
            <span
              data-testid={`game-demo-badge-${game.id}`}
              className="featured-card-demo-main"
              aria-label={homeCopy.demoBadgeLabel ?? 'Demo build'}
            >
              {homeCopy.demoBadge ?? 'Demo'}
            </span>
          ) : null}

          {comingSoon ? (
            <span
              data-testid="home-game-coming-soon-badge"
              className="featured-card-coming-soon-main"
            >
              {t('games.create.comingSoon') || 'Coming Soon'}
            </span>
          ) : null}

          <GameSymbol
            gameId={game.id}
            className="featured-card-symbol-main"
            aria-hidden="true"
          />

          <h3
            data-testid={`game-title-${game.id}`}
            className="featured-card-title-main"
          >
            {t(game.nameKey)}
          </h3>
        </Link>
      </div>

      <div className="featured-card-body-main">
        <p className="featured-card-desc-main">{t(game.descriptionKey)}</p>

        <ul className="featured-card-meta-main">
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

        <div className="featured-card-foot-main">
          <Link
            href={getPlayHref(game, routes, locale, comingSoon)}
            className="featured-card-cta-main"
            data-testid="game-play-button"
            aria-disabled={isDisabled ? 'true' : undefined}
            aria-label={`${playLabel} ${t(game.nameKey)}`}
          >
            <PlayTriangle aria-hidden />
            <span>{playLabel}</span>
          </Link>
          <button
            type="button"
            onClick={() => onOpenDetails(game.id)}
            title={homeCopy.showMore ?? 'Show Details'}
            aria-label={homeCopy.gameHowToPlay ?? 'How to play'}
            data-testid="game-help-button"
            className="featured-card-info-main"
          >
            <InfoIcon aria-hidden />
          </button>
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
