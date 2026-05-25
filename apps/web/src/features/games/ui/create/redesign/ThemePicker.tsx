'use client';

import type { CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import s from './GameCreateView.module.css';
import { CriticalMiniCluster } from './art/CriticalMiniCluster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  type CriticalTheme,
  type SeaBattleThemeMeta,
  type GameId,
} from './data/themes';

const SeaBattleRealPreview = dynamic(() => import('./SeaBattleRealPreview'), {
  ssr: false,
});

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

// Three-card fan. The SVG poster shows as a placeholder until the variant's
// sprite sheet finishes loading, then crossfades into the real cards.
function CriticalThumbnail({ theme }: { theme: CriticalTheme }) {
  return <CriticalMiniCluster themeId={theme.id} cardWidth={54} />;
}

// SSR-safe Sea Battle thumbnail: the SVG poster renders both on the server
// and during the first client paint; the real Tamagui-rendered board
// overlays it once the dynamic chunk lands on the client.
function SeaBattleThumbnail({ theme }: { theme: SeaBattleThemeMeta }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SeaBattleBoardPoster theme={theme} size="sm" />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SeaBattleRealPreview
          themeId={theme.id}
          cellSize={11}
          background={theme.palette.bg}
        />
      </div>
    </div>
  );
}
