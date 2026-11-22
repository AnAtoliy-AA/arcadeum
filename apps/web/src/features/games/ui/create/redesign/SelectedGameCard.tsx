'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
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
  pickerOpen: boolean;
  /** Id of the panel the change button controls (for aria-controls). */
  pickerId: string;
  onTogglePicker: () => void;
  onCycleTheme?: () => void;
}

export function resolveThemeName(
  gameId: GameId,
  themeId: string,
): string | null {
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

/**
 * Shows which game the room is for and lets the user swap it right here.
 * Changing the game opens an inline picker instead of leaving the page, so the
 * settings the user already made are not lost.
 */
export function SelectedGameCard({
  gameId,
  themeId,
  roomNumber,
  pickerOpen,
  pickerId,
  onTogglePicker,
  onCycleTheme,
}: Props) {
  const { t } = useTranslation();
  const game = GAMES[gameId];
  const themeName = resolveThemeName(gameId, themeId);

  return (
    <section className={s.card} data-testid="selected-game-card">
      <div className={s.left}>
        <div className={s.titleRow}>
          <h3 className={s.title}>{game.title}</h3>
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
                title={t('createRoom.game.cycleTheme')}
                aria-label={`${t('createRoom.theme.current', { name: themeName })}. ${t('createRoom.game.cycleTheme')}`}
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
          <span className={s.metaItem}>
            {t('createRoom.game.players', { label: game.players.label })}
          </span>
          <span className={s.metaDot} aria-hidden="true">
            ·
          </span>
          <span className={s.metaItem}>{game.duration}</span>
        </div>

        <p className={s.desc}>{game.desc}</p>
      </div>

      <div className={s.right}>
        <button
          type="button"
          className={s.changeLink}
          data-testid="change-game-link"
          aria-expanded={pickerOpen}
          aria-controls={pickerId}
          onClick={onTogglePicker}
        >
          <span aria-hidden="true">{pickerOpen ? '↑' : '⇄'}</span>
          <span>
            {pickerOpen
              ? t('createRoom.game.done')
              : t('createRoom.game.change')}
          </span>
        </button>
      </div>
    </section>
  );
}
