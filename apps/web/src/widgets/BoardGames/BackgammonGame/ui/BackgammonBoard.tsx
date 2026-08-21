'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import { BackgammonPoint } from './BackgammonPoint';
import { BackgammonDice } from './BackgammonDice';
import type { BackgammonClientState, MoveCheckerPayload } from '../types';

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

  const canRoll = myTurn && snapshot.phase === 'roll';
  const canMove =
    myTurn && snapshot.phase === 'move' && snapshot.dice.length > 0;

  const validTargets = useMemo(() => {
    if (!canMove || selectedFrom === null || !currentUserId) {
      return new Set<number | 'off'>();
    }

    const targets = new Set<number | 'off'>();
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
            targets.add(target);
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
              targets.add(toIndex);
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
              targets.add('off');
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
              targets.add(toIndex);
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
              targets.add('off');
            }
          }
        }
      }
    }

    return targets;
  }, [canMove, selectedFrom, currentUserId, snapshot, isP0, myBar]);

  const handlePointClick = (idx: number) => {
    if (!canMove) return;

    if (selectedFrom !== null && validTargets.has(idx)) {
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
    if (validTargets.has('off')) {
      onMove({ from: selectedFrom, to: 'off' });
      setSelectedFrom(null);
    }
  };

  const topLeft = [12, 13, 14, 15, 16, 17];
  const topRight = [18, 19, 20, 21, 22, 23];
  const bottomLeft = [11, 10, 9, 8, 7, 6];
  const bottomRight = [5, 4, 3, 2, 1, 0];

  return (
    <div className="box-border flex w-full flex-col items-stretch gap-2.5 select-none">
      <div className="flex flex-row items-center justify-between px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: theme.whitePiece }}
          />
          <span className="text-white/60">
            {t('games.backgammon_v1.game.pipCount')}:
          </span>
          <span className="text-white font-bold">
            {snapshot.players[0]?.pipCount ?? 0}
          </span>
          <span className="text-white/30">vs</span>
          <span className="text-white font-bold">
            {snapshot.players[1]?.pipCount ?? 0}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: theme.blackPiece }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60">
            {t('games.backgammon_v1.game.offCount')}:
          </span>
          <span className="text-white font-bold">
            {p0BorneOff} - {p1BorneOff}
          </span>
          <span className="text-[10px] text-white/40">/ 15</span>
        </div>
      </div>

      <div
        className="box-border w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl border p-1.5 sm:p-2.5 relative flex flex-row shadow-2xl overflow-hidden backdrop-blur-xl"
        data-testid="backgammon-board"
        style={{
          background: theme.boardBackground,
          borderColor: theme.barBorder,
        }}
      >
        <div className="flex-1 flex flex-col justify-between h-full">
          <div className="flex flex-row h-[42%] w-full">
            <div className="flex-1 flex flex-row">
              {topLeft.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={true}
                  isSelected={selectedFrom === idx}
                  isValidTarget={validTargets.has(idx)}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                />
              ))}
            </div>

            <div
              className={`w-7 sm:w-9 h-full mx-1 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                myBar > 0
                  ? selectedFrom === 'bar'
                    ? 'ring-2 ring-purple-400 bg-purple-900/40 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'ring-2 ring-amber-400/80 bg-amber-500/15 animate-pulse'
                  : 'bg-black/30 border border-white/5'
              }`}
              data-testid="bar-zone"
              onClick={handleBarClick}
            >
              {p0Bar > 0 && (
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border mb-1 flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                  style={{
                    backgroundColor: theme.whitePiece,
                    borderColor: theme.whitePieceBorder,
                  }}
                >
                  {p0Bar}
                </div>
              )}
              {p1Bar > 0 && (
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border mt-1 flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                  style={{
                    backgroundColor: theme.blackPiece,
                    borderColor: theme.blackPieceBorder,
                  }}
                >
                  {p1Bar}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-row">
              {topRight.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={true}
                  isSelected={selectedFrom === idx}
                  isValidTarget={validTargets.has(idx)}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-row items-center justify-center h-[16%] my-0.5 relative z-20">
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
                  isValidTarget={validTargets.has(idx)}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                />
              ))}
            </div>

            <div className="w-7 sm:w-9 h-full mx-1" />

            <div className="flex-1 flex flex-row">
              {bottomRight.map((idx) => (
                <BackgammonPoint
                  currentUserId={currentUserId}
                  isTop={false}
                  isSelected={selectedFrom === idx}
                  isValidTarget={validTargets.has(idx)}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`w-11 sm:w-14 h-full ml-1.5 border-l border-white/10 flex flex-col justify-between p-1 rounded-r-xl transition-all duration-200 cursor-pointer ${
            validTargets.has('off')
              ? 'ring-2 ring-emerald-400 bg-emerald-950/50 shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-pulse'
              : 'bg-black/35'
          }`}
          data-testid="bear-off-zone"
          onClick={handleBearOffClick}
        >
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/50 mb-1">
              OFF
            </span>
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-md"
              style={{
                backgroundColor: theme.whitePiece,
                borderColor: theme.whitePieceBorder,
              }}
            >
              {p0BorneOff}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow-md"
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
