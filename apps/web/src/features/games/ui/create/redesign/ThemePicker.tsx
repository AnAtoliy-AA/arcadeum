'use client';

import type { CSSProperties } from 'react';
import s from './GameCreateView.module.scss';
import type { GameId } from './data/themes';
import { THEME_PICKER_REGISTRY } from './themePickerRegistry';

interface Props {
  gameId: GameId;
  value: string;
  /** Accessible name for the radio group, already translated. */
  label: string;
  onChange: (themeId: string) => void;
}

/**
 * One tappable card per theme. Selecting a card only changes colors and art,
 * so the picker is a radio group: exactly one theme is always selected.
 */
export function ThemePicker({ gameId, value, label, onChange }: Props) {
  const config = THEME_PICKER_REGISTRY[gameId];
  if (!config || config.themes.length === 0) return null;

  return (
    <div className={s.themeStripWrap}>
      <div
        className={s.themeStrip}
        role="radiogroup"
        aria-label={label}
        data-testid={config.testId}
      >
        {config.themes.map((theme) => {
          const active = value === theme.id;
          return (
            <button
              className={`${s.themeCard} ${active ? s.themeCardActive : ''}`}
              style={{ '--theme-color': theme.color } as CSSProperties}
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
            >
              <div className={s.themeArt}>{config.thumbnail(theme.id)}</div>
              <div className={s.themeBody}>
                <div className={s.themeRow}>
                  <span className={s.themeDot} />
                  <span className={s.themeName}>{theme.name}</span>
                </div>
                <p className={s.themeDesc}>{theme.desc}</p>
              </div>
              <span className={s.themeCheck} aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
