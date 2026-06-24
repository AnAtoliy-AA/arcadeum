'use client';

import dynamic from 'next/dynamic';
import s from './GameCreateView.module.scss';
import { GameArt } from './art/GameArt';
import { CriticalMiniCluster } from './art/CriticalMiniCluster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  findSeaBattleTheme,
  GAMES,
  VISIBLE_GAMES,
  type GameId,
} from './data/themes';

const SeaBattleRealPreview = dynamic(() => import('./SeaBattleRealPreview'), {
  ssr: false,
});

interface GamePickerProps {
  value: GameId;
  themeId?: string;
  comingSoon: Map<string, boolean>;
  labels: {
    selected: string;
    comingSoon: string;
  };
  onChange: (gameId: GameId) => void;
}

export function GamePicker({
  value,
  themeId,
  comingSoon,
  labels,
  onChange,
}: GamePickerProps) {
  return (
    <div
      className={s.gameGrid}
      role="radiogroup"
      aria-label="Game selection"
      data-testid="game-picker"
    >
      {VISIBLE_GAMES.map((gameId) => {
        const meta = GAMES[gameId];
        const active = value === gameId;
        const blocked = comingSoon.get(gameId) ?? false;
        const tileTheme = active ? themeId : undefined;
        return (
          <button
            key={gameId}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={blocked}
            data-testid={`game-tile-${gameId}`}
            onClick={() => onChange(gameId)}
            className={`${s.gameCard} ${active ? s.gameCardActive : ''}`}
          >
            {active ? (
              <span className={s.gameCardBadge}>✓ {labels.selected}</span>
            ) : null}
            {blocked ? (
              <span className={s.gameCardComingSoon}>{labels.comingSoon}</span>
            ) : null}
            <div className={s.gameCardArt}>
              <GameTilePreview gameId={gameId} themeId={tileTheme} />
            </div>
            <div className={s.gameCardBody}>
              <div className={s.gameCardHeader}>
                <h3 className={s.gameCardTitle}>{meta.title}</h3>
                <span className={s.gameCardPlayers}>{meta.players.label}</span>
              </div>
              <p className={s.gameCardDesc}>{meta.desc}</p>
              <div className={s.gameCardMeta}>
                <span>{meta.duration}</span>
                <span> · </span>
                <span>{meta.kind}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Real previews for each game tile in the "Select a game" section. Critical
// shows the three-card fan via `<CriticalMiniCluster>`, Sea Battle renders a
// scaled-down real board layered on top of the SVG poster fallback, and
// Glimworm keeps the SVG poster.
function GameTilePreview({
  gameId,
  themeId,
}: {
  gameId: GameId;
  themeId?: string;
}) {
  if (gameId === 'critical_v1') {
    const resolved = themeId || CRITICAL_THEMES[0].id;
    return <CriticalMiniCluster themeId={resolved} cardWidth={48} />;
  }
  if (gameId === 'sea_battle_v1') {
    const resolved = findSeaBattleTheme(themeId || SEA_BATTLE_THEMES[0].id);
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SeaBattleBoardPoster theme={resolved} size="sm" />
        <div style={{ position: 'absolute', inset: 0 }}>
          <SeaBattleRealPreview
            themeId={resolved.id}
            cellSize={12}
            background={resolved.palette.bg}
          />
        </div>
      </div>
    );
  }
  return <GameArt gameId={gameId} themeId={themeId} size="sm" />;
}
