import type { CSSProperties } from 'react';
import s from './GameCreateView.module.css';
import { CriticalCardPoster } from './art/CriticalCardPoster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import { CRITICAL_THEMES, SEA_BATTLE_THEMES, type GameId } from './data/themes';

interface Props {
  gameId: GameId;
  value: string;
  onChange: (themeId: string) => void;
}

export function ThemePicker({ gameId, value, onChange }: Props) {
  if (gameId === 'critical_v1') {
    return (
      <div
        className={s.themeGrid}
        role="radiogroup"
        aria-label="Critical theme"
        data-testid="theme-picker-critical"
      >
        {CRITICAL_THEMES.map((theme) => {
          const active = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              style={{ '--theme-color': theme.color } as CSSProperties}
              className={`${s.themeCard} ${active ? s.themeCardActive : ''}`}
            >
              <div className={s.themeArt}>
                <CriticalCardPoster theme={theme} size="sm" />
              </div>
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
    );
  }

  if (gameId === 'sea_battle_v1') {
    return (
      <div
        className={s.themeGrid}
        role="radiogroup"
        aria-label="Sea Battle theme"
        data-testid="theme-picker-sea-battle"
      >
        {SEA_BATTLE_THEMES.map((theme) => {
          const active = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`theme-${theme.id}`}
              onClick={() => onChange(theme.id)}
              style={{ '--theme-color': theme.color } as CSSProperties}
              className={`${s.themeCard} ${active ? s.themeCardActive : ''}`}
            >
              <div className={s.themeArt}>
                <SeaBattleBoardPoster theme={theme} size="sm" />
              </div>
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
    );
  }

  return null;
}
