'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import type { Routes } from '@/shared/config/routes';
import type { FeaturedGame } from '../data/games';

interface HomeCopy {
  demoBadge?: string;
  showMore?: string;
  gamePlayButton?: string;
  gameComingSoon?: string;
}

interface Props {
  game: FeaturedGame;
  homeCopy: HomeCopy;
  onOpenDetails: (gameId: string) => void;
}

function getCardLinkHref(game: FeaturedGame, routes: Routes): string {
  return game.landingHref ?? routes.games;
}

function getPlayHref(game: FeaturedGame, routes: Routes): string {
  if (!game.isPlayable) return '#';
  if (game.landingHref) return game.landingHref;
  return `${routes.gameCreate}?gameId=${game.id}`;
}

export function HomeGameCard({ game, homeCopy, onOpenDetails }: Props) {
  const { t } = useTranslation();
  const routes = useRoutes();

  const playLabel = game.isPlayable
    ? (homeCopy.gamePlayButton ?? 'Play Now')
    : (homeCopy.gameComingSoon ?? 'Coming Soon');

  return (
    <div data-testid={`game-card-${game.id}`} className="game-card-main">
      <div
        className="game-card-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0,
          background: game.gradient ?? 'transparent',
          transition: 'opacity 0.2s ease-out',
        }}
      />
      <div
        className="game-info-wrapper"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--t-space-3)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="game-header-main">
          <Link
            href={getCardLinkHref(game, routes)}
            data-testid={`game-title-link-${game.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--t-space-2)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span className="game-icon-main">{game.emoji}</span>
            <h3
              data-testid={`game-title-${game.id}`}
              className="game-title-main"
              style={{
                background: game.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}
            >
              {t(game.nameKey)}
            </h3>
          </Link>
          {game.isDemo ? (
            <span
              data-testid={`game-demo-badge-${game.id}`}
              style={{
                padding: '3px 9px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: '#fff',
                background: 'linear-gradient(135deg, #ffb05e 0%, #ff5e9c 100%)',
                boxShadow: '0 3px 10px rgba(255,94,156,0.4)',
                border: '1px solid rgba(255,255,255,0.25)',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            >
              {homeCopy.demoBadge ?? 'Demo'}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => onOpenDetails(game.id)}
            title={homeCopy.showMore ?? 'Show Details'}
            aria-label={homeCopy.showMore ?? 'Show Details'}
            data-testid="game-help-button"
            className="game-help-btn-main"
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--color)',
              }}
            >
              ?
            </span>
          </button>
        </div>

        <p className="game-description-main">{t(game.descriptionKey)}</p>

        <div className="game-tags-main">
          {game.tags.map((tag) => (
            <span key={tag} className="game-tag-main">
              {tag}
            </span>
          ))}
        </div>

        <div className="game-card-footer-main">
          <Link
            href={getPlayHref(game, routes)}
            style={{ width: '100%' }}
            className="home-link-button home-link-button-primary"
            data-testid="game-play-button"
            aria-label={`${playLabel} ${t(game.nameKey)}`}
          >
            {playLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
