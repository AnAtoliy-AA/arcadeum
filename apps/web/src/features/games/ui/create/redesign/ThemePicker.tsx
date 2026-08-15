'use client';

import type { CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import s from './GameCreateView.module.scss';
import { CriticalMiniCluster } from './art/CriticalMiniCluster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import { TicTacToeBoardPoster } from './art/TicTacToeBoardPoster';
import { CascadeBoardPoster } from './art/CascadeBoardPoster';
import { ChessBoardPoster } from './art/ChessBoardPoster';
import { CheckersBoardPoster } from './art/CheckersBoardPoster';
import { CatDashBoardPoster } from './art/CatDashBoardPoster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  TIC_TAC_TOE_THEMES,
  CASCADE_THEMES,
  CHESS_THEMES,
  CAT_DASH_THEMES,
  type CriticalTheme,
  type SeaBattleThemeMeta,
  type TicTacToeThemeMeta,
  type CascadeThemeMeta,
  type ChessThemeMeta,
  type CatDashThemeMeta,
  type GameId,
} from './data/themes';
import {
  CHECKERS_THEMES,
  type CheckersThemeMeta,
} from './data/checkers-themes';

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
                className={`${s.themeCard} ${active ? s.themeCardActive : ''}`}
                style={{ '--theme-color': theme.color } as CSSProperties}
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`theme-${theme.id}`}
                onClick={() => onChange(theme.id)}
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
                className={`${s.themeCard} ${active ? s.themeCardActive : ''}`}
                style={{ '--theme-color': theme.color } as CSSProperties}
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`theme-${theme.id}`}
                onClick={() => onChange(theme.id)}
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

  if (gameId === 'tic_tac_toe_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
          role="radiogroup"
          aria-label="Tic-Tac-Toe theme"
          data-testid="theme-picker-tic-tac-toe"
        >
          {TIC_TAC_TOE_THEMES.map((theme) => {
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
                <div className={s.themeArt}>
                  <TicTacToeThumbnail theme={theme} />
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

  if (gameId === 'cascade_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
          role="radiogroup"
          aria-label="Cascade theme"
          data-testid="theme-picker-cascade"
        >
          {CASCADE_THEMES.map((theme) => {
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
                <div className={s.themeArt}>
                  <CascadeThumbnail theme={theme} />
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

  if (gameId === 'chess_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
          role="radiogroup"
          aria-label="Chess variant"
          data-testid="theme-picker-chess"
        >
          {CHESS_THEMES.map((theme) => {
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
                <div className={s.themeArt}>
                  <ChessThumbnail theme={theme} />
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

  if (gameId === 'checkers_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
          role="radiogroup"
          aria-label="Checkers variant"
          data-testid="theme-picker-checkers"
        >
          {CHECKERS_THEMES.map((theme) => {
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
                <div className={s.themeArt}>
                  <CheckersThumbnail theme={theme} />
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

  if (gameId === 'cat_dash_v1') {
    return (
      <div className={s.themeStripWrap}>
        <div
          className={s.themeStrip}
          role="radiogroup"
          aria-label="Cat Dash theme"
          data-testid="theme-picker-cat-dash"
        >
          {CAT_DASH_THEMES.map((theme) => {
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
                <div className={s.themeArt}>
                  <CatDashThumbnail theme={theme} />
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

function TicTacToeThumbnail({ theme }: { theme: TicTacToeThemeMeta }) {
  return <TicTacToeBoardPoster theme={theme} size="sm" />;
}

function CascadeThumbnail({ theme }: { theme: CascadeThemeMeta }) {
  return <CascadeBoardPoster theme={theme} size="sm" />;
}

function ChessThumbnail({ theme }: { theme: ChessThemeMeta }) {
  return <ChessBoardPoster theme={theme} size="sm" />;
}

function CheckersThumbnail({ theme }: { theme: CheckersThemeMeta }) {
  return <CheckersBoardPoster theme={theme} size="sm" />;
}

function CatDashThumbnail({ theme }: { theme: CatDashThemeMeta }) {
  return <CatDashBoardPoster theme={theme} size="sm" />;
}

// Three-card fan. The SVG poster shows as a placeholder until the variant's
// sprite sheet finishes loading, then crossfades into the real cards.
function CriticalThumbnail({ theme }: { theme: CriticalTheme }) {
  return <CriticalMiniCluster themeId={theme.id} cardWidth={54} />;
}

// SSR-safe Sea Battle thumbnail: the SVG poster renders both on the server
// and during the first client paint; the real client-rendered board
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
