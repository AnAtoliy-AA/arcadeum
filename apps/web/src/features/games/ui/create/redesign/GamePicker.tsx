import s from './GameCreateView.module.css';
import { GameArt } from './art/GameArt';
import { GAMES, VISIBLE_GAMES, type GameId } from './data/themes';

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
              <GameArt gameId={gameId} themeId={active ? themeId : undefined} />
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
