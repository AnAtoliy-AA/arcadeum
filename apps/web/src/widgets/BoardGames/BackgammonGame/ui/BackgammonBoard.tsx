'use client';

import { useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  useBoardKeyboardNavigation,
} from '@/shared/lib/a11y';
import {
  BOARD_CELL_FOCUS_CLASS,
  isActivationKey,
} from '@/shared/lib/keyboard-navigation';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import { BackgammonPoint } from './BackgammonPoint';
import { BackgammonDice } from './BackgammonDice';
import type { BackgammonClientState, MoveCheckerPayload } from '../types';

/** Point index for a keyboard-nav grid position (top row: 12–23, bottom: 11–0). */
function pointAtNavCoords(row: number, col: number): number {
  return row === 0 ? 12 + col : 11 - col;
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
            const isHit = !!(
              pt &&
              pt.playerId &&
              pt.playerId !== currentUserId &&
              pt.count === 1
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
              const isHit = !!(
                pt &&
                pt.playerId &&
                pt.playerId !== currentUserId &&
                pt.count === 1
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
              const isHit = !!(
                pt &&
                pt.playerId &&
                pt.playerId !== currentUserId &&
                pt.count === 1
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
    <div className="box-border flex w-full flex-col items-stretch gap-2 select-none">
      <div className="flex flex-row items-center justify-between px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border shadow-sm flex items-center justify-center text-[7px] font-black text-white"
            style={{
              backgroundColor: theme.whitePiece,
              borderColor: theme.whitePieceBorder,
            }}
          />
          <span className="text-white font-bold">{p0Pip}</span>
          <span className="text-white/30">vs</span>
          <span className="text-white font-bold">{p1Pip}</span>
          <div
            className="w-3 h-3 rounded-full border shadow-sm flex items-center justify-center text-[7px] font-black text-white"
            style={{
              backgroundColor: theme.blackPiece,
              borderColor: theme.blackPieceBorder,
            }}
          />

          {pipLead !== 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                pipLead > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
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
        className="box-border w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl border-2 p-1.5 sm:p-2.5 relative flex flex-row shadow-2xl overflow-hidden backdrop-blur-xl"
        data-testid="backgammon-board"
        style={{
          background: theme.boardBackground,
          borderColor: theme.barBorder,
        }}
      >
        <div
          className="flex-1 flex flex-col justify-between h-full relative"
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
              className={`w-7 sm:w-10 h-full mx-1 rounded-lg flex flex-col items-center justify-between py-1 cursor-pointer transition-all duration-200 ${BOARD_CELL_FOCUS_CLASS} rounded-lg ${
                myBar > 0
                  ? selectedFrom === 'bar'
                    ? 'ring-2 ring-purple-400 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                    : 'ring-2 ring-amber-400 bg-amber-500/20 animate-pulse'
                  : 'bg-black/35 border border-white/5'
              }`}
              data-testid="bar-zone"
              role="button"
              tabIndex={0}
              aria-label={t('games.backgammon_v1.game.barZone')}
              onClick={handleBarClick}
              onKeyDown={handleZoneKeyDown(handleBarClick)}
            >
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-extrabold uppercase text-white/40 mb-0.5">
                  BAR
                </span>
                {p0Bar > 0 && (
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-1 ring-white/30"
                    style={{
                      backgroundColor: theme.whitePiece,
                      borderColor: theme.whitePieceBorder,
                    }}
                  >
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
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-1 ring-white/30"
                    style={{
                      backgroundColor: theme.blackPiece,
                      borderColor: theme.blackPieceBorder,
                    }}
                  >
                    {p1Bar}
                  </div>
                )}
              </div>
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
          className={`w-11 sm:w-16 h-full ml-1.5 border-l border-white/10 flex flex-col justify-between p-1 rounded-r-xl transition-all duration-200 cursor-pointer ${
            targetMap.has('off')
              ? 'ring-2 ring-emerald-400 bg-emerald-950/60 shadow-[0_0_18px_rgba(52,211,153,0.5)] animate-pulse'
              : 'bg-black/40'
          }`}
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
            <div
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-lg"
              style={{
                backgroundColor: theme.whitePiece,
                borderColor: theme.whitePieceBorder,
              }}
            >
              {p0BorneOff}
            </div>
          </div>

          {targetMap.has('off') && (
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-300 bg-emerald-900/80 px-1 py-0.5 rounded uppercase tracking-tighter text-center animate-bounce shadow">
              BEAR OFF
            </span>
          )}

          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-lg"
              style={{
                backgroundColor: theme.blackPiece,
                borderColor: theme.blackPieceBorder,
              }}
            >
              {p1BorneOff}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
