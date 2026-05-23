'use client';

import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import s from './GameCreateView.module.css';
import { GameArt } from './art/GameArt';
import { CriticalMiniCluster } from './art/CriticalMiniCluster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  findSeaBattleTheme,
  GAMES,
  VISIBLE_GAMES,
  type GameId,
} from './data/themes';

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
            data-testid={`game-card-${gameId}`}
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
// scaled-down real board, and Glimworm keeps the SVG poster.
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
    // Real `<SeaBattleThemePreview>` anchored top-left — bottom rows clip
    // gracefully so A1 and the column letters stay visible at the corner.
    return (
      <SeaBattleThemeProvider variant={resolved.id}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            background: resolved.palette.bg,
            padding: 6,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <SeaBattleThemePreview selectedVariant={resolved.id} cellSize={12} />
        </div>
      </SeaBattleThemeProvider>
    );
  }
  return <GameArt gameId={gameId} themeId={themeId} size="sm" />;
}
