'use client';

import type { CSSProperties } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import { CardImage } from '@/widgets/CriticalGame/ui/styles/card-image';
import s from './GameCreateView.module.css';
import { CriticalCardPoster } from './art/CriticalCardPoster';
import { useSpriteLoaded } from './useSpriteLoaded';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  type CriticalTheme,
  type SeaBattleThemeMeta,
  type GameId,
} from './data/themes';

interface Props {
  gameId: GameId;
  value: string;
  onChange: (themeId: string) => void;
}

export function ThemePicker({ gameId, value, onChange }: Props) {
  if (gameId === 'critical_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
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
                  <CriticalThumbnail theme={theme} />
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
      </div>
    );
  }

  if (gameId === 'sea_battle_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
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
                  <SeaBattleThumbnail theme={theme} />
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
      </div>
    );
  }

  return null;
}

// Render the SVG poster as a placeholder until the variant's sprite sheet
// has loaded, then crossfade into the real Critical card art. Variants that
// don't ship a sprite (e.g. cyberpunk, galaxy) stay on the poster.
function CriticalThumbnail({ theme }: { theme: CriticalTheme }) {
  const { url, isLoaded } = useSpriteLoaded(theme.id);
  const showRealCard = !!url && isLoaded;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showRealCard ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      >
        <CriticalCardPoster theme={theme} size="sm" />
      </div>
      {url ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 40%, ${theme.color}33 0%, #0a0510 70%)`,
            opacity: showRealCard ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 78,
              height: 108,
              borderRadius: 8,
              border: `1.4px solid ${theme.color}`,
              overflow: 'hidden',
              background: 'rgba(8, 12, 20, 0.8)',
              boxShadow: `0 12px 32px -12px ${theme.color}66`,
              transform: 'rotate(-3deg)',
            }}
          >
            <CardImage variant={theme.id} cardType="critical_event" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SeaBattleThumbnail({ theme }: { theme: SeaBattleThemeMeta }) {
  return (
    <SeaBattleThemeProvider variant={theme.id}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.bg,
          padding: 8,
          boxSizing: 'border-box',
        }}
      >
        <SeaBattleThemePreview selectedVariant={theme.id} cellSize={10} />
      </div>
    </SeaBattleThemeProvider>
  );
}
