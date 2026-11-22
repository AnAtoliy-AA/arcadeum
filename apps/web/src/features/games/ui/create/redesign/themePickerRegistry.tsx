'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { CriticalMiniCluster } from './art/CriticalMiniCluster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import { TicTacToeBoardPoster } from './art/TicTacToeBoardPoster';
import { CascadeBoardPoster } from './art/CascadeBoardPoster';
import { ChessBoardPoster } from './art/ChessBoardPoster';
import { CheckersBoardPoster } from './art/CheckersBoardPoster';
import { CatDashBoardPoster } from './art/CatDashBoardPoster';
import { BackgammonBoardPoster } from './art/BackgammonBoardPoster';
import { GoBoardPoster } from './art/GoBoardPoster';
import { PachisiBoardPoster } from './art/PachisiBoardPoster';
import { HeartsBoardPoster } from './art/HeartsBoardPoster';
import { SpadesBoardPoster } from './art/SpadesBoardPoster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  TIC_TAC_TOE_THEMES,
  CASCADE_THEMES,
  CHESS_THEMES,
  CAT_DASH_THEMES,
  BACKGAMMON_THEMES,
  PACHISI_THEMES,
  GLIMWORM_THEMES,
  GO_THEMES,
  HEARTS_THEMES,
  SPADES_THEMES,
  type GameId,
} from './data/themes';
import { CHECKERS_THEMES } from './data/checkers-themes';

const SeaBattleRealPreview = dynamic(() => import('./SeaBattleRealPreview'), {
  ssr: false,
});

export interface BaseThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export interface ThemePickerEntry {
  themes: BaseThemeMeta[];
  testId: string;
  /** Renders the thumbnail for the theme with this id. */
  thumbnail: (themeId: string) => ReactNode;
}

/**
 * Builds a registry entry. Looking the theme up by id inside the closure keeps
 * the per-game theme type intact without any casts.
 */
function entry<T extends BaseThemeMeta>(
  themes: T[],
  testId: string,
  render: (theme: T) => ReactNode,
): ThemePickerEntry {
  return {
    themes,
    testId,
    thumbnail: (themeId) => {
      const theme = themes.find((t) => t.id === themeId);
      return theme ? render(theme) : null;
    },
  };
}

export const THEME_PICKER_REGISTRY: Record<GameId, ThemePickerEntry> = {
  critical_v1: entry(CRITICAL_THEMES, 'theme-picker-critical', (t) => (
    <CriticalMiniCluster cardWidth={54} themeId={t.id} />
  )),
  sea_battle_v1: entry(SEA_BATTLE_THEMES, 'theme-picker-sea-battle', (t) => (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SeaBattleBoardPoster size="sm" theme={t} />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SeaBattleRealPreview
          background={t.palette.bg}
          cellSize={11}
          themeId={t.id}
        />
      </div>
    </div>
  )),
  glimworm_v1: entry(GLIMWORM_THEMES, 'theme-picker-glimworm', (t) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.color + '22',
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 24 }} aria-hidden="true">
        🐛
      </span>
    </div>
  )),
  tic_tac_toe_v1: entry(TIC_TAC_TOE_THEMES, 'theme-picker-tic-tac-toe', (t) => (
    <TicTacToeBoardPoster size="sm" theme={t} />
  )),
  cascade_v1: entry(CASCADE_THEMES, 'theme-picker-cascade', (t) => (
    <CascadeBoardPoster size="sm" theme={t} />
  )),
  chess_v1: entry(CHESS_THEMES, 'theme-picker-chess', (t) => (
    <ChessBoardPoster size="sm" theme={t} />
  )),
  checkers_v1: entry(CHECKERS_THEMES, 'theme-picker-checkers', (t) => (
    <CheckersBoardPoster size="sm" theme={t} />
  )),
  cat_dash_v1: entry(CAT_DASH_THEMES, 'theme-picker-cat-dash', (t) => (
    <CatDashBoardPoster size="sm" theme={t} />
  )),
  backgammon_v1: entry(BACKGAMMON_THEMES, 'theme-picker-backgammon', (t) => (
    <BackgammonBoardPoster size="sm" theme={t} />
  )),
  hearts_v1: entry(HEARTS_THEMES, 'theme-picker-hearts', (t) => (
    <HeartsBoardPoster size="sm" theme={t} />
  )),
  spades_v1: entry(SPADES_THEMES, 'theme-picker-spades', (t) => (
    <SpadesBoardPoster size="sm" theme={t} />
  )),
  go_v1: entry(GO_THEMES, 'theme-picker-go', (t) => (
    <GoBoardPoster size="sm" theme={t} />
  )),
  pachisi_v1: entry(PACHISI_THEMES, 'theme-picker-pachisi', (t) => (
    <PachisiBoardPoster size="sm" theme={t} />
  )),
};
