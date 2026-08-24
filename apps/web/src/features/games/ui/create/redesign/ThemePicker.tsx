'use client';

import type { CSSProperties, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import s from './GameCreateView.module.scss';
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
  type CriticalTheme,
  type SeaBattleThemeMeta,
  type TicTacToeThemeMeta,
  type CascadeThemeMeta,
  type ChessThemeMeta,
  type CatDashThemeMeta,
  type BackgammonThemeMeta,
  type PachisiThemeMeta,
  type GlimwormThemeMeta,
  type GoThemeMeta,
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

interface BaseThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

interface ThemeCardGroupProps<T extends BaseThemeMeta> {
  themes: T[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  testId: string;
  renderThumbnail: (theme: T) => ReactNode;
}

function ThemeCardGroup<T extends BaseThemeMeta>({
  themes,
  value,
  onChange,
  ariaLabel,
  testId,
  renderThumbnail,
}: ThemeCardGroupProps<T>) {
  return (
    <div className={s.themeStripWrap}>
      <div
        className={s.themeStrip}
        role="radiogroup"
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {themes.map((theme) => {
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
              <div className={s.themeArt}>{renderThumbnail(theme)}</div>
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

export function ThemePicker({ gameId, value, onChange }: Props) {
  if (gameId === 'critical_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Critical theme"
        onChange={onChange}
        renderThumbnail={(t) => <CriticalThumbnail theme={t} />}
        testId="theme-picker-critical"
        themes={CRITICAL_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'sea_battle_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Sea Battle theme"
        onChange={onChange}
        renderThumbnail={(t) => <SeaBattleThumbnail theme={t} />}
        testId="theme-picker-sea-battle"
        themes={SEA_BATTLE_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'glimworm_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Glimworm theme"
        onChange={onChange}
        renderThumbnail={(t) => <GlimwormThumbnail theme={t} />}
        testId="theme-picker-glimworm"
        themes={GLIMWORM_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'tic_tac_toe_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Tic-Tac-Toe theme"
        onChange={onChange}
        renderThumbnail={(t) => <TicTacToeThumbnail theme={t} />}
        testId="theme-picker-tic-tac-toe"
        themes={TIC_TAC_TOE_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'cascade_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Cascade theme"
        onChange={onChange}
        renderThumbnail={(t) => <CascadeThumbnail theme={t} />}
        testId="theme-picker-cascade"
        themes={CASCADE_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'chess_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Chess theme"
        onChange={onChange}
        renderThumbnail={(t) => <ChessThumbnail theme={t} />}
        testId="theme-picker-chess"
        themes={CHESS_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'checkers_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Checkers theme"
        onChange={onChange}
        renderThumbnail={(t) => <CheckersThumbnail theme={t} />}
        testId="theme-picker-checkers"
        themes={CHECKERS_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'cat_dash_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Cat Dash theme"
        onChange={onChange}
        renderThumbnail={(t) => <CatDashThumbnail theme={t} />}
        testId="theme-picker-cat-dash"
        themes={CAT_DASH_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'backgammon_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Backgammon theme"
        onChange={onChange}
        renderThumbnail={(t) => <BackgammonThumbnail theme={t} />}
        testId="theme-picker-backgammon"
        themes={BACKGAMMON_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'go_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Go theme"
        onChange={onChange}
        renderThumbnail={(t) => <GoThumbnail theme={t} />}
        testId="theme-picker-go"
        themes={GO_THEMES}
        value={value}
      />
    );
  }

  if (gameId === 'pachisi_v1') {
    return (
      <ThemeCardGroup
        ariaLabel="Pachisi theme"
        onChange={onChange}
        renderThumbnail={(t) => <PachisiThumbnail theme={t} />}
        testId="theme-picker-pachisi"
        themes={PACHISI_THEMES}
        value={value}
      />
    );
  }

  return null;
}

function BackgammonThumbnail({ theme }: { theme: BackgammonThemeMeta }) {
  return <BackgammonBoardPoster size="sm" theme={theme} />;
}

function GoThumbnail({ theme }: { theme: GoThemeMeta }) {
  return <GoBoardPoster size="sm" theme={theme} />;
}

function PachisiThumbnail({ theme }: { theme: PachisiThemeMeta }) {
  return <PachisiBoardPoster size="sm" theme={theme} />;
}

function GlimwormThumbnail({ theme }: { theme: GlimwormThemeMeta }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.color + '22',
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 24 }}>🐛</span>
    </div>
  );
}

function TicTacToeThumbnail({ theme }: { theme: TicTacToeThemeMeta }) {
  return <TicTacToeBoardPoster size="sm" theme={theme} />;
}

function CascadeThumbnail({ theme }: { theme: CascadeThemeMeta }) {
  return <CascadeBoardPoster size="sm" theme={theme} />;
}

function ChessThumbnail({ theme }: { theme: ChessThemeMeta }) {
  return <ChessBoardPoster size="sm" theme={theme} />;
}

function CheckersThumbnail({ theme }: { theme: CheckersThemeMeta }) {
  return <CheckersBoardPoster size="sm" theme={theme} />;
}

function CatDashThumbnail({ theme }: { theme: CatDashThemeMeta }) {
  return <CatDashBoardPoster size="sm" theme={theme} />;
}

function CriticalThumbnail({ theme }: { theme: CriticalTheme }) {
  return <CriticalMiniCluster cardWidth={54} themeId={theme.id} />;
}

function SeaBattleThumbnail({ theme }: { theme: SeaBattleThemeMeta }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SeaBattleBoardPoster size="sm" theme={theme} />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SeaBattleRealPreview
          background={theme.palette.bg}
          cellSize={11}
          themeId={theme.id}
        />
      </div>
    </div>
  );
}
