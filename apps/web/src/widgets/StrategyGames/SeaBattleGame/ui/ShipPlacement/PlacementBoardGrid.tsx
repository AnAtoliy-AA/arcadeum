'use client';

import { memo, useCallback, useMemo } from 'react';
import type { DragEvent } from 'react';
import { colLabels, rowLabels, CELL_STATE } from '../../types';
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
import { useBoardKeyboardNavigation } from '@/shared/lib/a11y';
import { BOARD_CELL_FOCUS_CLASS } from '@/shared/lib/keyboard-navigation';

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
  isPendingCell: boolean;
  isMovingCell: boolean;
  isShipHead: boolean;
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  rIndex: number;
  cIndex: number;
  onMouseEnter: (row: number, col: number) => void;
  onMouseLeave: () => void;
  onClick: (row: number, col: number) => void;
  onDoubleClick?: (row: number, col: number) => void;
  onContextMenu?: (
    row: number,
    col: number,
    e: React.MouseEvent<HTMLElement>,
  ) => void;
  onRotateButton?: (row: number, col: number) => void;
  onDragOver: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDrop: (row: number, col: number, e: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  cellFocusProps?: Record<string, unknown>;
}

const PlacementBoardCell = memo(
  ({
    cellState,
    theme,
    isHovered,
    isInvalidCell,
    isShipDraggable,
    isDraggingThisCell,
    isPendingCell,
    isMovingCell,
    isShipHead,
    draggable,
    onDragStart,
    onPointerDown,
    rIndex,
    cIndex,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onDoubleClick,
    onContextMenu,
    onRotateButton,
    onDragOver,
    onDrop,
    onDragLeave,
    cellFocusProps,
  }: PlacementBoardCellProps) => {
    const handleMouseEnter = useCallback(
      () => onMouseEnter(rIndex, cIndex),
      [onMouseEnter, rIndex, cIndex],
    );
    const handleClick = useCallback(
      () => onClick(rIndex, cIndex),
      [onClick, rIndex, cIndex],
    );
    const handleDoubleClick = useCallback(
      () => onDoubleClick?.(rIndex, cIndex),
      [onDoubleClick, rIndex, cIndex],
    );
    const handleContextMenu = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        if (!onContextMenu) return;
        e.preventDefault();
        onContextMenu(rIndex, cIndex, e);
      },
      [onContextMenu, rIndex, cIndex],
    );
    const handleDragOver = useCallback(
      (e: DragEvent<HTMLElement>) => onDragOver(rIndex, cIndex, e),
      [onDragOver, rIndex, cIndex],
    );
    const handleDrop = useCallback(
      (e: DragEvent<HTMLElement>) => onDrop(rIndex, cIndex, e),
      [onDrop, rIndex, cIndex],
    );
    const handleRotateButton = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onRotateButton?.(rIndex, cIndex);
      },
      [onRotateButton, rIndex, cIndex],
    );
    const handleRotateButtonMouseDown = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        // Prevent the cell's HTML5 drag from starting when the user clicks
        // the icon — without this the rotate button is mostly unusable.
        e.stopPropagation();
      },
      [],
    );

    const classNames = [
      'sb-cell',
      BOARD_CELL_FOCUS_CLASS,
      isHovered && !isInvalidCell ? 'sb-valid-pulse' : '',
      isShipDraggable ? 'sb-cell--ship-draggable' : '',
      isDraggingThisCell ? 'sb-cell--dragging' : '',
      isPendingCell ? 'sb-cell--pending-sync' : '',
      isMovingCell ? 'sb-cell--moving' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const isShip = cellState === CELL_STATE.SHIP;
    const showRotateButton =
      isShipHead && !!onRotateButton && !isDraggingThisCell;

    return (
      <BoardCell
        style={{
          background:
            isShip && !isInvalidCell
              ? 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)'
              : getCellBg(cellState, theme, isHovered, isInvalidCell),
          borderColor: isInvalidCell
            ? 'rgba(239,68,68,0.6)'
            : isShip
              ? '#64748b'
              : theme.cellBorder,
          borderRadius: parseInt(theme.borderRadius) || 4,
          opacity: isDraggingThisCell ? 0.4 : undefined,
          boxShadow: isShip
            ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.5)'
            : undefined,
        }}
        data-row={rIndex}
        data-col={cIndex}
        data-highlighted={isHovered ? 'true' : 'false'}
        className={classNames}
        draggable={draggable}
        onDragStart={onDragStart}
        onPointerDown={onPointerDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerEnter={handleMouseEnter}
        onPointerMove={handleMouseEnter}
        onPointerLeave={onMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={onDragLeave}
        {...cellFocusProps}
      >
        {isShip && (
          <div className="w-[6px] h-[6px] rounded-full bg-[#cbd5e1] opacity-75 shadow-sm pointer-events-none mx-auto" />
        )}
        {showRotateButton ? (
          <span
            role="button"
            aria-label="Rotate ship"
            className="sb-cell__rotate-btn"
            draggable={false}
            onMouseDown={handleRotateButtonMouseDown}
            onClick={handleRotateButton}
          >
            ↻
          </span>
        ) : null}
      </BoardCell>
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
  gridSize?: number;
  getBoardCellDragProps: (
    row: number,
    col: number,
  ) => { draggable: boolean; onDragStart: (e: DragEvent<HTMLElement>) => void };
  draggingCells: ShipCell[];
  pendingCells: ShipCell[];
  shipHeadKeys: Set<string>;
  isPlacementComplete: boolean;
  isTouchDragEnabled?: boolean;
  movingShipCells?: ShipCell[];
  onTouchBoardPointerDown?: (
    row: number,
    col: number,
    e: React.PointerEvent,
  ) => void;
  onCellHover: (row: number, col: number) => void;
  onMouseLeave: () => void;
  onCellClick: (row: number, col: number) => void;
  onCellRotateInPlace?: (row: number, col: number) => void;
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
    gridSize,
    getBoardCellDragProps,
    draggingCells,
    pendingCells,
    shipHeadKeys,
    isPlacementComplete,
    isTouchDragEnabled = false,
    movingShipCells,
    onTouchBoardPointerDown,
    onCellHover,
    onMouseLeave,
    onCellClick,
    onCellRotateInPlace,
    onDragOver,
    onDrop,
    onDragLeave,
    t,
  }: PlacementBoardGridProps) => {
    const { draggingKeys, pendingKeys, movingKeys, hoveredKeys } =
      useMemo(() => {
        return {
          draggingKeys: new Set(draggingCells.map((c) => `${c.row}-${c.col}`)),
          pendingKeys: new Set(pendingCells.map((c) => `${c.row}-${c.col}`)),
          movingKeys: new Set(
            (movingShipCells ?? []).map((c) => `${c.row}-${c.col}`),
          ),
          hoveredKeys: new Set(hoveredCells.map((c) => `${c.row}-${c.col}`)),
        };
      }, [draggingCells, pendingCells, movingShipCells, hoveredCells]);

    const boardSize = gridSize ?? (board.length || 10);
    const rowLbls = useMemo(() => rowLabels(boardSize), [boardSize]);
    const colLbls = useMemo(() => colLabels(boardSize), [boardSize]);

    const boardKeyboard = useBoardKeyboardNavigation({
      rows: boardSize,
      cols: boardSize,
      disabled: !selectedShip && isPlacementComplete,
      onActivate: ({ row, col }) => onCellClick(row, col),
    });
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
          <ColLabels gridSize={boardSize}>
            {colLbls.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </ColLabels>
          <RowLabels gridSize={boardSize}>
            {rowLbls.map((label) => (
              <Label key={label} style={{ color: theme.textSecondaryColor }}>
                {label}
              </Label>
            ))}
          </RowLabels>
          <BoardGrid
            gridSize={boardSize}
            style={{
              backgroundColor: theme.boardBackground,
              borderColor: theme.cellBorder,
            }}
            data-testid="sea-battle-board-grid"
            {...boardKeyboard.gridProps}
          >
            {board.map((row, rIndex) =>
              row.map((cellState, cIndex) => {
                const cellKey = `${rIndex}-${cIndex}`;
                const isHovered = hoveredKeys.has(cellKey);
                const isInvalidCell = isHovered && isInvalidHover;
                const isShipCell = cellState === CELL_STATE.SHIP;
                const isDraggingThisCell = draggingKeys.has(cellKey);
                const isPendingCell = pendingKeys.has(cellKey);
                const isMovingCell = movingKeys.has(cellKey);
                const isShipHead =
                  isShipCell &&
                  !isPlacementComplete &&
                  shipHeadKeys.has(cellKey);
                const dragProps = isShipCell
                  ? getBoardCellDragProps(rIndex, cIndex)
                  : { draggable: false, onDragStart: () => {} };
                return (
                  <PlacementBoardCell
                    key={cellKey}
                    cellState={cellState}
                    theme={theme}
                    isHovered={isHovered}
                    isInvalidCell={isInvalidCell}
                    isClickable={!!selectedShip}
                    isShipDraggable={
                      isShipCell &&
                      !isPlacementComplete &&
                      (dragProps.draggable || isTouchDragEnabled)
                    }
                    isDraggingThisCell={isDraggingThisCell}
                    isPendingCell={isPendingCell}
                    isMovingCell={isMovingCell}
                    isShipHead={isShipHead}
                    draggable={dragProps.draggable}
                    onDragStart={dragProps.onDragStart}
                    onPointerDown={
                      isShipCell && onTouchBoardPointerDown
                        ? (e) => onTouchBoardPointerDown(rIndex, cIndex, e)
                        : undefined
                    }
                    rIndex={rIndex}
                    cIndex={cIndex}
                    onMouseEnter={onCellHover}
                    onMouseLeave={onMouseLeave}
                    onClick={onCellClick}
                    onDoubleClick={isShipCell ? onCellRotateInPlace : undefined}
                    onContextMenu={
                      isShipCell && onCellRotateInPlace
                        ? (r, c) => onCellRotateInPlace(r, c)
                        : undefined
                    }
                    onRotateButton={
                      isShipHead ? onCellRotateInPlace : undefined
                    }
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onDragLeave={onDragLeave}
                    cellFocusProps={boardKeyboard.getCellProps(
                      rIndex,
                      cIndex,
                    )}
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
