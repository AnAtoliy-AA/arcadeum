'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { getAllLegalMoves } from '@arcadeum/games-core/games/backgammon/backgammon.utils';
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { useBackgammonTheme } from '../lib/BackgammonThemeContext';
import type { BackgammonTheme } from '../lib/theme';
import { BackgammonHud } from './BackgammonHud';
import { BackgammonBar } from './BackgammonBar';
import { BackgammonBearOff } from './BackgammonBearOff';
import { BackgammonPoint } from './BackgammonPoint';
import { BackgammonDice } from './BackgammonDice';
import type { BackgammonClientState, MoveCheckerPayload } from '../types';
import './styles/backgammon.scss';

function pointAtNavCoords(
  row: number,
  col: number,
  isFlipped: boolean,
): number {
  if (!isFlipped) {
    return row === 0 ? 12 + col : 11 - col;
  }
  return row === 0 ? 11 - col : 12 + col;
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
  isRolling?: boolean;
  highlightedCells?: { row: number; col: number }[];
}

export function BackgammonBoard({
  snapshot,
  currentUserId,
  myTurn,
  onRoll,
  onMove,
  isRolling,
  highlightedCells = [],
}: BackgammonBoardProps) {
  const theme = useBackgammonTheme();
  const [selectedFrom, setSelectedFrom] = useState<number | 'bar' | null>(null);

  const isP0 = snapshot.playerOrder[0] === currentUserId;
  const isFlipped = !isP0 && Boolean(currentUserId);

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

  const isDoubles =
    Boolean(snapshot.rolledDice) &&
    snapshot.rolledDice?.[0] === snapshot.rolledDice?.[1] &&
    (snapshot.rolledDice?.[0] ?? 0) > 0;

  const legalMoves = useMemo(() => {
    if (!canMove || !currentUserId) return [];
    return getAllLegalMoves(
      currentUserId,
      snapshot.playerOrder,
      snapshot.points,
      snapshot.bar,
      snapshot.borneOff,
      snapshot.dice,
      snapshot.options.mode,
    );
  }, [canMove, currentUserId, snapshot]);

  const movablePoints = useMemo(() => {
    return new Set(legalMoves.map((m) => m.from));
  }, [legalMoves]);

  const targetMap = useMemo(() => {
    const map = new Map<number | 'off', { die: number; isHit: boolean }>();
    if (!canMove || selectedFrom === null || !currentUserId) return map;

    for (const move of legalMoves) {
      if (move.from === selectedFrom) {
        map.set(move.to, { die: move.die, isHit: move.isHit });
      }
    }
    return map;
  }, [canMove, selectedFrom, currentUserId, legalMoves]);

  const handlePointClick = (idx: number) => {
    if (!canMove) return;

    if (selectedFrom !== null && targetMap.has(idx)) {
      onMove({ from: selectedFrom, to: idx });
      setSelectedFrom(null);
      return;
    }

    if (myBar > 0) return;

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
    onActivate: ({ row, col }) =>
      handlePointClick(pointAtNavCoords(row, col, isFlipped)),
    onDeselect: () => setSelectedFrom(null),
  });

  const highlightedPointIndices = useMemo(() => {
    const indices = new Set<number>();
    for (const cell of highlightedCells) {
      indices.add(pointAtNavCoords(cell.row, cell.col, isFlipped));
    }
    return indices;
  }, [highlightedCells, isFlipped]);

  const topLeft = isFlipped ? [11, 10, 9, 8, 7, 6] : [12, 13, 14, 15, 16, 17];
  const topRight = isFlipped ? [5, 4, 3, 2, 1, 0] : [18, 19, 20, 21, 22, 23];
  const bottomLeft = isFlipped
    ? [12, 13, 14, 15, 16, 17]
    : [11, 10, 9, 8, 7, 6];
  const bottomRight = isFlipped ? [18, 19, 20, 21, 22, 23] : [5, 4, 3, 2, 1, 0];

  const getPointCellProps = (isTop: boolean, idx: number) => {
    if (!isFlipped) {
      return isTop ? getCellProps(0, idx - 12) : getCellProps(1, 11 - idx);
    }
    return isTop ? getCellProps(0, 11 - idx) : getCellProps(1, idx - 12);
  };

  return (
    <div className="box-border flex w-full max-w-[min(780px,calc((100vh-190px)*1.6))] flex-col items-center justify-center gap-1.5 sm:gap-2 select-none min-h-0 mx-auto">
      <BackgammonHud
        hasBarCheckers={myBar > 0}
        isDoubles={isDoubles}
        isFlipped={isFlipped}
        isP0={isP0}
        myTurn={myTurn}
        p0BorneOff={p0BorneOff}
        p0Pip={p0Pip}
        p1BorneOff={p1BorneOff}
        p1Pip={p1Pip}
        pipLead={pipLead}
        rolledVal={snapshot.rolledDice?.[0]}
      />

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
                  cellFocusProps={getPointCellProps(true, idx)}
                  currentUserId={currentUserId}
                  isHighlighted={highlightedPointIndices.has(idx)}
                  isMovable={movablePoints.has(idx)}
                  isSelected={selectedFrom === idx}
                  isTop={true}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                />
              ))}
            </div>

            <BackgammonBar
              canMove={canMove}
              myBar={myBar}
              onBarClick={handleBarClick}
              p0Bar={p0Bar}
              p1Bar={p1Bar}
              selectedFrom={selectedFrom}
            />

            <div className="flex-1 flex flex-row">
              {topRight.map((idx) => (
                <BackgammonPoint
                  cellFocusProps={getPointCellProps(true, idx)}
                  currentUserId={currentUserId}
                  isHighlighted={highlightedPointIndices.has(idx)}
                  isMovable={movablePoints.has(idx)}
                  isSelected={selectedFrom === idx}
                  isTop={true}
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
              isRolling={isRolling}
              onRoll={onRoll}
              remainingDice={snapshot.dice}
              rolledDice={snapshot.rolledDice}
              rollLabel="Roll Dice"
            />
          </div>

          <div className="flex flex-row h-[42%] w-full">
            <div className="flex-1 flex flex-row">
              {bottomLeft.map((idx) => (
                <BackgammonPoint
                  cellFocusProps={getPointCellProps(false, idx)}
                  currentUserId={currentUserId}
                  isHighlighted={highlightedPointIndices.has(idx)}
                  isMovable={movablePoints.has(idx)}
                  isSelected={selectedFrom === idx}
                  isTop={false}
                  key={idx}
                  onClick={() => handlePointClick(idx)}
                  playerOrder={snapshot.playerOrder}
                  point={snapshot.points[idx]}
                  pointIndex={idx}
                  targetInfo={targetMap.get(idx)}
                />
              ))}
            </div>

            <div className="w-7 sm:w-10 h-full mx-1 pointer-events-none" />

            <div className="flex-1 flex flex-row">
              {bottomRight.map((idx) => (
                <BackgammonPoint
                  cellFocusProps={getPointCellProps(false, idx)}
                  currentUserId={currentUserId}
                  isHighlighted={highlightedPointIndices.has(idx)}
                  isMovable={movablePoints.has(idx)}
                  isSelected={selectedFrom === idx}
                  isTop={false}
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
        </div>

        <BackgammonBearOff
          canBearOff={targetMap.has('off')}
          canMove={canMove}
          onBearOffClick={handleBearOffClick}
          p0BorneOff={p0BorneOff}
          p1BorneOff={p1BorneOff}
        />
      </div>
    </div>
  );
}
