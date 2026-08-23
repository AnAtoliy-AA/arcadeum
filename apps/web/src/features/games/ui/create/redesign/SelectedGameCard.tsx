'use client';

import Link from 'next/link';
import { useRoutes } from '@/shared/config/useRoutes';
import { getThemeById } from '@/features/games/lib/shared-themes';
import {
  GAMES,
  findCriticalTheme,
  findSeaBattleTheme,
  type GameId,
} from './data/themes';
import s from './SelectedGameCard.module.scss';

interface Props {
  gameId: GameId;
  themeId: string;
  roomNumber?: number;
  labels: {
    changeGame: string;
  };
  onCycleTheme?: () => void;
}

function resolveThemeName(gameId: GameId, themeId: string): string | null {
  const theme = getThemeById(themeId);
  if (theme) {
    return (
      theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-/g, ' ')
    );
  }
  if (gameId === 'critical_v1') return findCriticalTheme(themeId).name;
  if (gameId === 'sea_battle_v1') return findSeaBattleTheme(themeId).name;
  return null;
}

export function SelectedGameCard({
  gameId,
  themeId,
  roomNumber,
  labels,
  onCycleTheme,
}: Props) {
  const routes = useRoutes();
  const game = GAMES[gameId];
  const themeName = resolveThemeName(gameId, themeId);

  return (
    <section className={s.card} data-testid="selected-game-card">
      <div className={s.left}>
        <div className={s.titleRow}>
          <h2 className={s.title}>{game.title}</h2>
          {roomNumber ? (
            <span className={s.roomNumberBadge} data-testid="room-number-badge">
              #{roomNumber}
            </span>
          ) : null}
          {themeName ? (
            onCycleTheme ? (
              <button
                type="button"
                onClick={onCycleTheme}
                className={s.themeBadge}
                data-testid="selected-theme-badge"
                title="Click to cycle theme"
                aria-label={`Theme: ${themeName}. Click to change theme`}
              >
                <span className={s.themeDot} aria-hidden="true" />
                <span>{themeName}</span>
                <span aria-hidden="true">↻</span>
              </button>
            ) : (
              <span className={s.themeBadge} data-testid="selected-theme-badge">
                <span className={s.themeDot} aria-hidden="true" />
                {themeName}
              </span>
            )
          ) : null}
        </div>

        <div className={s.metaRow}>
          <span className={s.metaItem}>{game.category}</span>
          <span className={s.metaDot} aria-hidden="true">
            ·
          </span>
          <span className={s.metaItem}>{game.players.label} players</span>
          <span className={s.metaDot} aria-hidden="true">
            ·
          </span>
          <span className={s.metaItem}>{game.duration}</span>
        </div>

        <p className={s.desc}>{game.desc}</p>
      </div>

      <div className={s.right}>
        <Link
          href={routes.games}
          className={s.changeLink}
          data-testid="change-game-link"
        >
          <span>←</span>
          <span>{labels.changeGame}</span>
        </Link>
      </div>
    </section>
  );
}
