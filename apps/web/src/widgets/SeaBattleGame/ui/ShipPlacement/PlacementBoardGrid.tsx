'use client';

import { memo, useCallback } from 'react';
import type { DragEvent } from 'react';
import { ROW_LABELS, COL_LABELS, CELL_STATE } from '../../types';
import type { ShipCell, ShipConfig, CellState } from '../../types';
import {
  BoardGrid,
  BoardCell,
  BoardWithLabels,
  RowLabels,
  ColLabels,
  Label,
  PlayerSection,
  PlayerName,
} from '../styles';
import type { SeaBattleTheme } from '../../lib/theme';
import { TranslationKey } from '@/shared/lib/useTranslation';

function getCellBg(
  state: number,
  theme: SeaBattleTheme,
  highlighted = false,
  invalid = false,
): string {
  if (highlighted && invalid) return 'rgba(239, 68, 68, 0.2)';
  if (highlighted) return theme.cellHover;
  switch (state) {
    case CELL_STATE.HIT:
      return theme.hitColor;
    case CELL_STATE.MISS:
      return theme.missColor;
    case CELL_STATE.SHIP:
      return theme.shipColor;
    default:
      return theme.cellEmpty;
  }
}

interface PlacementBoardCellProps {
  cellState: number;
  theme: SeaBattleTheme;
  isHovered: boolean;
  isInvalidCell: boolean;
  isClickable: boolean;
  isShipDraggable: boolean;
  isDraggingThisCell: boolean;
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  rIndex: number;
  cIndex: number;
  onMouseEnter: (row: number, col: number) => void;
  onMouseLeave: () => void;
  onClick: (row: number, col: number) => void;
  onDragOver: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDrop: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
}

const PlacementBoardCell = memo(
  ({
    cellState,
    theme,
    isHovered,
    isInvalidCell,
    isShipDraggable,
    isDraggingThisCell,
    draggable,
    onDragStart,
    rIndex,
    cIndex,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDragOver,
    onDrop,
    onDragLeave,
  }: PlacementBoardCellProps) => {
    const handleMouseEnter = useCallback(
      () => onMouseEnter(rIndex, cIndex),
      [onMouseEnter, rIndex, cIndex],
    );
    const handleClick = useCallback(
      () => onClick(rIndex, cIndex),
      [onClick, rIndex, cIndex],
    );
    const handleDragOver = useCallback(
      (e: DragEvent<HTMLElement>) => onDragOver(rIndex, cIndex, e),
      [onDragOver, rIndex, cIndex],
    );
    const handleDrop = useCallback(
      (e: DragEvent<HTMLElement>) => onDrop(rIndex, cIndex, e),
      [onDrop, rIndex, cIndex],
    );

    const classNames = [
      'sb-cell',
      isHovered && !isInvalidCell ? 'sb-valid-pulse' : '',
      isShipDraggable ? 'sb-cell--ship-draggable' : '',
      isDraggingThisCell ? 'sb-cell--dragging' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <BoardCell
        style={{
          backgroundColor: getCellBg(
            cellState,
            theme,
            isHovered,
            isInvalidCell,
          ),
          borderColor: isInvalidCell ? 'rgba(239,68,68,0.6)' : theme.cellBorder,
          borderRadius: parseInt(theme.borderRadius) || 4,
          opacity: isDraggingThisCell ? 0.4 : undefined,
        }}
        data-row={rIndex}
        data-col={cIndex}
        data-highlighted={isHovered ? 'true' : 'false'}
        className={classNames}
        draggable={draggable}
        onDragStart={onDragStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerEnter={handleMouseEnter}
        onPointerMove={handleMouseEnter}
        onPointerLeave={onMouseLeave}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={onDragLeave}
      />
    );
  },
);
PlacementBoardCell.displayName = 'PlacementBoardCell';

interface PlacementBoardGridProps {
  board: CellState[][];
  theme: SeaBattleTheme;
  hoveredCells: ShipCell[];
  isInvalidHover: boolean;
  selectedShip: ShipConfig | null;
  getBoardCellDragProps: (
    row: number,
    col: number,
  ) => { draggable: boolean; onDragStart: (e: DragEvent<HTMLElement>) => void };
  draggingCells: ShipCell[];
  isPlacementComplete: boolean;
  onCellHover: (row: number, col: number) => void;
  onMouseLeave: () => void;
  onCellClick: (row: number, col: number) => void;
  onDragOver: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDrop: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  t: (key: TranslationKey) => string;
}

export const PlacementBoardGrid = memo(
  ({
    board,
    theme,
    hoveredCells,
    isInvalidHover,
    selectedShip,
    getBoardCellDragProps,
    draggingCells,
    isPlacementComplete,
    onCellHover,
    onMouseLeave,
    onCellClick,
    onDragOver,
    onDrop,
    onDragLeave,
    t,
  }: PlacementBoardGridProps) => {
    const draggingKeys = new Set(draggingCells.map((c) => `${c.row}-${c.col}`));
    return (
      <PlayerSection
        backgroundColor={theme.boardBackground}
        borderColor={theme.cellBorder}
      >
        <PlayerName color={theme.textColor}>
          {t('games.sea_battle_v1.table.state.yourBoard')}
        </PlayerName>
        <BoardWithLabels>
          <div />
          <ColLabels>
            {COL_LABELS.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </ColLabels>
          <RowLabels>
            {ROW_LABELS.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </RowLabels>
          <BoardGrid
            style={{
              backgroundColor: theme.boardBackground,
              borderColor: theme.cellBorder,
            }}
            data-testid="sea-battle-board-grid"
          >
            {board.map((row, rIndex) =>
              row.map((cellState, cIndex) => {
                const isHovered = hoveredCells.some(
                  (c) => c.row === rIndex && c.col === cIndex,
                );
                const isInvalidCell = isHovered && isInvalidHover;
                const isShipCell = cellState === CELL_STATE.SHIP;
                const isDraggingThisCell = draggingKeys.has(
                  `${rIndex}-${cIndex}`,
                );
                const dragProps = isShipCell
                  ? getBoardCellDragProps(rIndex, cIndex)
                  : { draggable: false, onDragStart: () => {} };
                return (
                  <PlacementBoardCell
                    key={`${rIndex}-${cIndex}`}
                    cellState={cellState}
                    theme={theme}
                    isHovered={isHovered}
                    isInvalidCell={isInvalidCell}
                    isClickable={!!selectedShip}
                    isShipDraggable={
                      isShipCell && !isPlacementComplete && dragProps.draggable
                    }
                    isDraggingThisCell={isDraggingThisCell}
                    draggable={dragProps.draggable}
                    onDragStart={dragProps.onDragStart}
                    rIndex={rIndex}
                    cIndex={cIndex}
                    onMouseEnter={onCellHover}
                    onMouseLeave={onMouseLeave}
                    onClick={onCellClick}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onDragLeave={onDragLeave}
                  />
                );
              }),
            )}
          </BoardGrid>
        </BoardWithLabels>
      </PlayerSection>
    );
  },
);
PlacementBoardGrid.displayName = 'PlacementBoardGrid';
