import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameId } from './data/themes';
import type { CreateRoomForm } from './data/form';
import s from './GameCreateView.module.scss';

interface Props {
  gameId: GameId;
  value: CreateRoomForm['gameConfig'];
  onChange: (config: CreateRoomForm['gameConfig']) => void;
}

const GRID_SIZES = [10, 15, 20] as const;
const BOARD_SIZES = [3, 5, 7, 9] as const;
const CASCADE_MODES = ['classic', 'pure', 'speed'] as const;

const WIN_LENGTHS: Record<number, number> = { 3: 3, 5: 4, 7: 5, 9: 5 };

export function GameSpecificConfig({ gameId, value, onChange }: Props) {
  const { t } = useTranslation();

  if (gameId === 'sea_battle_v1') {
    return (
      <div className={s.gameConfig} data-testid="game-config-sea-battle">
        <div className={s.configGroup}>
          <h4 className={s.configLabel}>
            {t('games.create.seaBattleGridSize') || 'Grid Size'}
          </h4>
          <div className={s.buttonRow}>
            {GRID_SIZES.map((gs) => (
              <button
                key={gs}
                type="button"
                className={`${s.configBtn} ${(value.gridSize ?? 10) === gs ? s.configBtnActive : ''}`}
                onClick={() => onChange({ ...value, gridSize: gs })}
                data-testid={`grid-size-${gs}`}
              >
                {gs}×{gs}
              </button>
            ))}
          </div>
        </div>
        <div className={s.configGroup}>
          <h4 className={s.configLabel}>
            {t('games.create.specialWeapons') || 'Special Weapons'}
          </h4>
          <label className={s.configToggle}>
            <input
              type="checkbox"
              checked={!!value.specialWeapons?.sonar}
              onChange={() =>
                onChange({
                  ...value,
                  specialWeapons: {
                    ...value.specialWeapons,
                    sonar: !value.specialWeapons?.sonar,
                  },
                })
              }
            />
            <span>
              {t('games.create.seaBattleSonar') || 'Sonar'} —{' '}
              {t('games.create.seaBattleSonarHint') || 'Reveal ship locations'}
            </span>
          </label>
          <label className={s.configToggle}>
            <input
              type="checkbox"
              checked={!!value.specialWeapons?.radar}
              onChange={() =>
                onChange({
                  ...value,
                  specialWeapons: {
                    ...value.specialWeapons,
                    radar: !value.specialWeapons?.radar,
                  },
                })
              }
            />
            <span>
              {t('games.create.seaBattleRadar') || 'Radar'} —{' '}
              {t('games.create.seaBattleRadarHint') || 'Scan a row or column'}
            </span>
          </label>
        </div>
      </div>
    );
  }

  if (gameId === 'tic_tac_toe_v1') {
    const currentSize = value.boardSize ?? 3;
    return (
      <div className={s.gameConfig} data-testid="game-config-tic-tac-toe">
        <div className={s.configGroup}>
          <h4 className={s.configLabel}>
            {t('games.create.tttBoardSize') || 'Board Size'}
          </h4>
          <div className={s.buttonRow}>
            {BOARD_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={`${s.configBtn} ${currentSize === size ? s.configBtnActive : ''}`}
                onClick={() => onChange({ ...value, boardSize: size })}
                data-testid={`board-size-${size}`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
          <p className={s.configHint}>
            {t('games.create.tttWinLength', {
              n: String(WIN_LENGTHS[currentSize] ?? 3),
            }) || `${WIN_LENGTHS[currentSize] ?? 3} in a row to win`}
          </p>
        </div>
      </div>
    );
  }

  if (gameId === 'cascade_v1') {
    const currentMode = value.cascadeMode ?? 'classic';
    return (
      <div className={s.gameConfig} data-testid="game-config-cascade">
        <div className={s.configGroup}>
          <h4 className={s.configLabel}>
            {t('games.create.cascadeMode') || 'Game Mode'}
          </h4>
          <div className={s.buttonRow}>
            {CASCADE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`${s.configBtn} ${currentMode === mode ? s.configBtnActive : ''}`}
                onClick={() => onChange({ ...value, cascadeMode: mode })}
                data-testid={`cascade-mode-${mode}`}
              >
                {mode === 'classic'
                  ? t('games.create.cascadeModeClassic') || 'Classic'
                  : mode === 'pure'
                    ? t('games.create.cascadeModePure') || 'Pure'
                    : t('games.create.cascadeModeSpeed') || 'Speed'}
              </button>
            ))}
          </div>
          <p className={s.configHint}>
            {currentMode === 'pure'
              ? t('games.create.cascadeModePureHint') ||
                'No stacking — draw cards resolve immediately'
              : currentMode === 'speed'
                ? t('games.create.cascadeModeSpeedHint') ||
                  'Stacking enabled with per-turn timer'
                : t('games.create.cascadeModeClassicHint') ||
                  'Full ruleset with stacking'}
          </p>
        </div>
        <div className={s.configGroup}>
          <label className={s.configToggle}>
            <input
              type="checkbox"
              checked={value.lastCardCallEnabled !== false}
              onChange={() =>
                onChange({
                  ...value,
                  lastCardCallEnabled: value.lastCardCallEnabled === false,
                })
              }
            />
            <span>
              {t('games.create.cascadeLastCardCall') ||
                'Last-Card Cascade Call'}{' '}
              —{' '}
              {t('games.create.cascadeLastCardCallHint') ||
                'Race to call when at 1 card'}
            </span>
          </label>
        </div>
      </div>
    );
  }

  return null;
}
