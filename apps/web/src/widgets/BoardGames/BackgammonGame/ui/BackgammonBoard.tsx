'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import {
  BOARD_CELL_FOCUS_CLASS,
  isActivationKey,
} from '@/shared/lib/keyboard-navigation';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import type { BackgammonTheme } from '../lib/theme';
import { BackgammonPoint } from './BackgammonPoint';
import { BackgammonDice } from './BackgammonDice';
import type { BackgammonClientState, MoveCheckerPayload } from '../types';
import './styles/backgammon.scss';

function pointAtNavCoords(row: number, col: number): number {
  return row === 0 ? 12 + col : 11 - col;
}

function boardVars(theme: BackgammonTheme): CSSProperties {
  return {
    '--bg-frame': theme.frameBackground,
    '--bg-felt': theme.boardBackground,
    '--border-frame': theme.frameBorder,
    '--point-light': theme.pointLight,
    '--point-dark': theme.pointDark,
    '--point-selected': theme.pointSelected,
    '--checker-p0-bg': theme.whitePiece,
    '--checker-p0-border': theme.whitePieceBorder,
    '--checker-p0-inner': theme.whitePieceInner,
    '--checker-p0-text': theme.whitePieceText,
    '--checker-p1-bg': theme.blackPiece,
    '--checker-p1-border': theme.blackPieceBorder,
    '--checker-p1-inner': theme.blackPieceInner,
    '--checker-p1-text': theme.blackPieceText,
    '--bar-bg': theme.barBackground,
    '--bar-border': theme.barBorder,
    '--bear-off-bg': theme.bearOffBackground,
    '--bear-off-border': theme.bearOffBorder,
    '--hud-bg': theme.hudBackground,
    '--hud-border': theme.hudBorder,
  } as CSSProperties;
}

interface BackgammonBoardProps {
  snapshot: BackgammonClientState;
  currentUserId: string | null;
  myTurn: boolean;
  onRoll: () => void;
  onMove: (payload: MoveCheckerPayload) => void;
}

export function BackgammonBoard({
  snapshot,
  currentUserId,
  myTurn,
  onRoll,
  onMove,
}: BackgammonBoardProps) {
  const { t } = useTranslation();
  const theme = useBackgammonTheme();
  const [selectedFrom, setSelectedFrom] = useState<number | 'bar' | null>(null);

  const isP0 = snapshot.playerOrder[0] === currentUserId;
  const p0Id = snapshot.playerOrder[0];
  const p1Id = snapshot.playerOrder[1];

  const p0Bar = snapshot.bar[p0Id] ?? 0;
  const p1Bar = snapshot.bar[p1Id] ?? 0;
  const myBar = currentUserId ? (snapshot.bar[currentUserId] ?? 0) : 0;

  const p0BorneOff = snapshot.borneOff[p0Id] ?? 0;
  const p1BorneOff = snapshot.borneOff[p1Id] ?? 0;

  const p0Pip = snapshot.players[0]?.pipCount ?? 0;
  const p1Pip = snapshot.players[1]?.pipCount ?? 0;
  const myPip = isP0 ? p0Pip : p1Pip;
  const oppPip = isP0 ? p1Pip : p0Pip;
  const pipLead = oppPip - myPip;

  const canRoll = myTurn && snapshot.phase === 'roll';
  const canMove =
    myTurn && snapshot.phase === 'move' && snapshot.dice.length > 0;

  const targetMap = useMemo(() => {
    const map = new Map<number | 'off', { die: number; isHit: boolean }>();
    if (!canMove || selectedFrom === null || !currentUserId) {
      return map;
    }

    const dice = Array.from(new Set(snapshot.dice));

    for (const die of dice) {
      if (selectedFrom === 'bar') {
        const target = isP0 ? 24 - die : die - 1;
        if (target >= 0 && target < 24) {
          const pt = snapshot.points[target];
          if (
            !pt ||
            pt.count === 0 ||
            pt.playerId === currentUserId ||
            pt.count === 1
          ) {
            const isHit = Boolean(
              pt &&
              pt.playerId &&
              pt.playerId !== currentUserId &&
              pt.count === 1,
            );
            map.set(target, { die, isHit });
          }
        }
      } else {
        const from = selectedFrom;
        if (isP0) {
          const toIndex = from - die;
          if (toIndex >= 0) {
            const pt = snapshot.points[toIndex];
            if (
              !pt ||
              pt.count === 0 ||
              pt.playerId === currentUserId ||
              pt.count === 1
            ) {
              const isHit = Boolean(
                pt &&
                pt.playerId &&
                pt.playerId !== currentUserId &&
                pt.count === 1,
              );
              map.set(toIndex, { die, isHit });
            }
          } else {
            let canBear = true;
            for (let i = 6; i < 24; i++) {
              if (
                snapshot.points[i].playerId === currentUserId &&
                snapshot.points[i].count > 0
              ) {
                canBear = false;
                break;
              }
            }
            if (canBear && myBar === 0) {
              map.set('off', { die, isHit: false });
            }
          }
        } else {
          const toIndex = from + die;
          if (toIndex < 24) {
            const pt = snapshot.points[toIndex];
            if (
              !pt ||
              pt.count === 0 ||
              pt.playerId === currentUserId ||
              pt.count === 1
            ) {
              const isHit = Boolean(
                pt &&
                pt.playerId &&
                pt.playerId !== currentUserId &&
                pt.count === 1,
              );
              map.set(toIndex, { die, isHit });
            }
          } else {
            let canBear = true;
            for (let i = 0; i < 18; i++) {
              if (
                snapshot.points[i].playerId === currentUserId &&
                snapshot.points[i].count > 0
              ) {
                canBear = false;
                break;
              }
            }
            if (canBear && myBar === 0) {
              map.set('off', { die, isHit: false });
            }
          }
        }
      }
    }

    return map;
  }, [canMove, selectedFrom, currentUserId, snapshot, isP0, myBar]);

  const handlePointClick = (idx: number) => {
    if (!canMove) return;

    if (selectedFrom !== null && targetMap.has(idx)) {
      onMove({ from: selectedFrom, to: idx });
      setSelectedFrom(null);
      return;
    }

    if (myBar > 0) {
      return;
    }

    const pt = snapshot.points[idx];
    if (pt.playerId === currentUserId && pt.count > 0) {
      setSelectedFrom(idx);
    } else {
      setSelectedFrom(null);
    }
  };

  const handleBarClick = () => {
    if (!canMove || myBar === 0) return;
    setSelectedFrom('bar');
  };

  const handleBearOffClick = () => {
    if (!canMove || selectedFrom === null) return;
    if (targetMap.has('off')) {
      onMove({ from: selectedFrom, to: 'off' });
      setSelectedFrom(null);
    }
  };

  const { gridProps, getCellProps } = useBoardKeyboardNavigation({
    rows: 2,
    cols: 12,
    disabled: !canMove,
    onActivate: ({ row, col }) => handlePointClick(pointAtNavCoords(row, col)),
    onDeselect: () => setSelectedFrom(null),
  });

  const handleZoneKeyDown =
    (action: () => void) => (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!isActivationKey(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      action();
    };

  const topLeft = [12, 13, 14, 15, 16, 17];
  const topRight = [18, 19, 20, 21, 22, 23];
  const bottomLeft = [11, 10, 9, 8, 7, 6];
  const bottomRight = [5, 4, 3, 2, 1, 0];

  return (
    <div className="box-border flex w-full max-w-[min(780px,calc((100vh-190px)*1.6))] flex-col items-center justify-center gap-1.5 sm:gap-2 select-none min-h-0 mx-auto">
      <div className="backgammon-hud-panel flex w-full flex-row items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border shadow-sm backgammon-checker-p0" />
          <span className="text-white font-bold">{p0Pip}</span>
          <span className="text-white/30">vs</span>
          <span className="text-white font-bold">{p1Pip}</span>
          <div className="w-3 h-3 rounded-full border shadow-sm backgammon-checker-p1" />

          {pipLead !== 0 && (
            <span
              className={cx(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                pipLead > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
              )}
            >
              {pipLead > 0 ? `+${pipLead} Lead` : `${pipLead} Behind`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50 hidden sm:inline font-mono">
            {isP0 ? 'Route: 24 ➔ 1' : 'Route: 1 ➔ 24'}
          </span>
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
            <span className="text-white/60">🏁 Off:</span>
            <span className="text-white font-bold">
              {p0BorneOff} - {p1BorneOff}
            </span>
            <span className="text-[9px] text-white/40">/ 15</span>
          </div>
        </div>
      </div>

      <div
        className="backgammon-board box-border w-full aspect-[4/3] sm:aspect-[16/10] max-h-[calc(100vh-230px)] rounded-2xl border-2 p-1.5 sm:p-2.5 relative flex flex-row shadow-lg overflow-hidden shrink-0"
        data-testid="backgammon-board"
        data-theme={theme.id}
        style={boardVars(theme)}
      >
        <div
          className="backgammon-felt flex-1 flex flex-col justify-between h-full relative rounded-xl"
          {...gridProps}
        >
          <div className="flex flex-row h-[42%] w-full">
            <div className="flex-1 flex flex-row">
              {topLeft.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={true}
                  isSelected={selectedFrom === idx}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                  cellFocusProps={getCellProps(0, idx - 12)}
                />
              ))}
            </div>

            <div
              className={cx(
                'backgammon-bar-area w-7 sm:w-10 h-full mx-1 rounded-lg flex flex-col items-center justify-between py-1 cursor-pointer transition-colors duration-150 border',
                BOARD_CELL_FOCUS_CLASS,
                myBar > 0 && selectedFrom === 'bar' && 'ring-2 ring-purple-400',
                myBar > 0 && selectedFrom !== 'bar' && 'ring-2 ring-amber-400',
              )}
              data-testid="bar-zone"
              role="button"
              tabIndex={0}
              aria-label={t('games.backgammon_v1.game.barZone')}
              onClick={handleBarClick}
              onKeyDown={handleZoneKeyDown(handleBarClick)}
            >
              <div className="w-3.5 sm:w-5 h-0.5 rounded-full bg-white/20 mb-0.5 pointer-events-none" />
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-extrabold uppercase text-white/40 mb-0.5">
                  BAR
                </span>
                {p0Bar > 0 && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-white/30 backgammon-checker-p0">
                    {p0Bar}
                  </div>
                )}
              </div>

              {myBar > 0 && (
                <span className="text-[7px] font-black text-amber-300 uppercase tracking-tighter text-center leading-tight">
                  ENTER
                </span>
              )}

              <div className="flex flex-col items-center">
                {p1Bar > 0 && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-white/30 backgammon-checker-p1">
                    {p1Bar}
                  </div>
                )}
              </div>
              <div className="w-3.5 sm:w-5 h-0.5 rounded-full bg-white/20 mt-0.5 pointer-events-none" />
            </div>

            <div className="flex-1 flex flex-row">
              {topRight.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={true}
                  isSelected={selectedFrom === idx}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                  cellFocusProps={getCellProps(0, idx - 12)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-row items-center justify-center h-[16%] my-0.5 relative z-30">
            <BackgammonDice
              canRoll={canRoll}
              onRoll={onRoll}
              remainingDice={snapshot.dice}
              rolledDice={snapshot.rolledDice}
              rollLabel={t('games.backgammon_v1.game.rollDice')}
            />
          </div>

          <div className="flex flex-row h-[42%] w-full">
            <div className="flex-1 flex flex-row">
              {bottomLeft.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={false}
                  isSelected={selectedFrom === idx}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                  cellFocusProps={getCellProps(1, 11 - idx)}
                />
              ))}
            </div>

            <div className="w-7 sm:w-10 h-full mx-1" />

            <div className="flex-1 flex flex-row">
              {bottomRight.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={false}
                  isSelected={selectedFrom === idx}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                  cellFocusProps={getCellProps(1, 11 - idx)}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={cx(
            'backgammon-bear-off-area w-11 sm:w-16 h-full ml-1.5 border-l flex flex-col justify-between p-1 rounded-r-xl transition-colors duration-150 cursor-pointer',
            targetMap.has('off') && 'ring-2 ring-emerald-400 shadow-md',
          )}
          data-testid="bear-off-zone"
          role="button"
          tabIndex={0}
          aria-label={t('games.backgammon_v1.game.bearOffZone')}
          onClick={handleBearOffClick}
          onKeyDown={handleZoneKeyDown(handleBearOffClick)}
        >
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/50 mb-0.5">
              OFF
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm backgammon-checker-p0">
              {p0BorneOff}
            </div>
          </div>

          {targetMap.has('off') && (
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-300 bg-emerald-900/80 px-1 py-0.5 rounded uppercase tracking-tighter text-center shadow-sm">
              BEAR OFF
            </span>
          )}

          <div className="flex flex-col items-center">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm backgammon-checker-p1">
              {p1BorneOff}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
