'use client';

import { useState, useCallback, useMemo } from 'react';
import { Text, YStack, useMedia } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type {
  ShipCell,
  ShipConfig,
  SeaBattlePlayerState,
  CellState,
} from '../types';
import {
  SHIPS,
  BOARD_SIZE,
  CELL_STATE,
  ROW_LABELS,
  COL_LABELS,
} from '../types';
import {
  BoardGrid,
  BoardCell,
  BoardWithLabels,
  RowLabels,
  ColLabels,
  Label,
  ShipPalette,
  ShipItem,
  ShipPreview,
  ShipCell as ShipCellStyled,
  ShipName,
  ActionButton,
  PlacementHeader,
  RotateButton,
  PlayerSection,
  PlayerName,
  GameBoardWrapper,
  BoardContainer,
  PlacementActions,
} from './styles';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import type { SeaBattleTheme } from '../lib/theme';
import { useDragPlacement } from '../hooks/useDragPlacement';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: () => void;
  onResetPlacement: () => void;
  isPlacementComplete: boolean;
  onAutoPlace?: () => void;
}

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

export function ShipPlacementBoard({
  currentPlayer,
  onPlaceShip,
  onConfirmPlacement,
  onResetPlacement,
  isPlacementComplete,
  onAutoPlace,
}: ShipPlacementBoardProps) {
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [hoveredCells, setHoveredCells] = useState<ShipCell[]>([]);
  const [isInvalidHover, setIsInvalidHover] = useState(false);
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();

  const placedShipIds = useMemo(() => {
    return new Set(currentPlayer?.ships.map((s) => s.id) || []);
  }, [currentPlayer?.ships]);

  const unplacedShips = useMemo(() => {
    return SHIPS.filter((s) => !placedShipIds.has(s.id));
  }, [placedShipIds]);

  const board = currentPlayer?.board || createEmptyBoard();

  const selectedShip = useMemo(() => {
    return SHIPS.find((s) => s.id === selectedShipId) || null;
  }, [selectedShipId]);

  const { getDragProps, getDropProps, handleDragEnd } = useDragPlacement({
    board,
    isVertical,
    placedShipIds,
    onPlaceShip,
    setSelectedShipId,
    setHoveredCells,
    setIsInvalidHover,
  });

  const canPlaceAt = useCallback(
    (row: number, col: number, ship: ShipConfig): boolean => {
      if (!ship) return false;

      const cells = getCellsForPlacement(row, col, ship.size, isVertical);
      if (!cells) return false;

      for (const cell of cells) {
        if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) {
          return false;
        }

        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [dr, dc] of directions) {
          const r = cell.row + (dr ?? 0);
          const c = cell.col + (dc ?? 0);
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === CELL_STATE.SHIP) {
              return false;
            }
          }
        }
      }

      return true;
    },
    [board, isVertical],
  );

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedShip) {
        setHoveredCells([]);
        setIsInvalidHover(false);
        return;
      }

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );

      if (!cells) {
        setHoveredCells([]);
        setIsInvalidHover(false);
        return;
      }

      if (canPlaceAt(row, col, selectedShip)) {
        setHoveredCells(cells);
        setIsInvalidHover(false);
      } else {
        setHoveredCells(cells);
        setIsInvalidHover(true);
      }
    },
    [selectedShip, isVertical, canPlaceAt],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedShip || !canPlaceAt(row, col, selectedShip)) return;

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );
      if (!cells) return;

      onPlaceShip(selectedShip.id, cells);

      // Auto-select next unplaced ship so mobile users don't need to scroll back
      const nextShip = SHIPS.find(
        (s) => s.id !== selectedShip.id && !placedShipIds.has(s.id),
      );
      setSelectedShipId(nextShip?.id ?? null);
      setHoveredCells([]);
      setIsInvalidHover(false);
    },
    [selectedShip, isVertical, canPlaceAt, onPlaceShip, placedShipIds],
  );

  const handleRotate = useCallback(() => {
    setIsVertical((prev) => !prev);
  }, []);

  const isAllShipsPlaced = unplacedShips.length === 0;
  const media = useMedia();
  const isMobile = !media.gtMd;

  const shipItems = SHIPS.map((ship) => {
    const isPlaced = placedShipIds.has(ship.id);
    const isSelected = selectedShipId === ship.id;

    return (
      <ShipItem
        key={ship.id}
        isPlaced={isPlaced}
        backgroundColor={
          isSelected ? theme.accentColor + '33' : theme.boardBackground
        }
        borderColor={isSelected ? theme.accentColor : theme.cellBorder}
        className={isSelected ? 'sb-selected-glow' : undefined}
        onClick={() =>
          !isPlaced && setSelectedShipId(isSelected ? null : ship.id)
        }
        data-testid="ship-palette-item"
        {...getDragProps(ship.id)}
      >
        <ShipPreview>
          {Array(ship.size)
            .fill(null)
            .map((_, i) => (
              <ShipCellStyled key={i} backgroundColor={theme.shipColor} />
            ))}
        </ShipPreview>
        <ShipName color={theme.textColor}>
          {ship.name} ({ship.size}){isPlaced ? ' ✓' : isSelected ? ' ◀' : ''}
        </ShipName>
      </ShipItem>
    );
  });

  const shipPaletteEl = (
    <ShipPalette
      backgroundColor={theme.boardBackground}
      borderColor={theme.cellBorder}
      data-testid="sea-battle-ship-palette"
    >
      {!isMobile && (
        <>
          <Text
            className="ship-palette-title"
            color={theme.textColor}
            fontSize="$4"
            fontWeight="600"
            margin={0}
            marginBottom="$2"
          >
            {t('games.sea_battle_v1.table.state.shipsPalette')}
          </Text>
          <Text
            fontSize={11}
            color={theme.textSecondaryColor}
            textAlign="center"
            marginBottom="$2"
          >
            {t('games.sea_battle_v1.table.actions.dragHint' as TranslationKey)}
          </Text>
        </>
      )}
      {shipItems}
    </ShipPalette>
  );

  const btnSize = isMobile ? 'sm' : 'lg';

  const actionsEl = (
    <PlacementActions>
      <RotateButton
        variant="secondary"
        size={btnSize}
        onClick={handleRotate}
        disabled={!selectedShip}
      >
        ↻ {t('games.sea_battle_v1.table.actions.rotate')} (
        {isVertical
          ? t('games.sea_battle_v1.table.state.vertical')
          : t('games.sea_battle_v1.table.state.horizontal')}
        )
      </RotateButton>
      <ActionButton
        variant="primary"
        size={btnSize}
        disabled={!isAllShipsPlaced || isPlacementComplete}
        onClick={onConfirmPlacement}
        className={
          isAllShipsPlaced && !isPlacementComplete
            ? 'sb-valid-pulse'
            : undefined
        }
        style={
          isAllShipsPlaced && !isPlacementComplete
            ? {
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 2px 12px rgba(16,185,129,0.5)',
              }
            : undefined
        }
      >
        {isPlacementComplete
          ? t('games.sea_battle_v1.table.actions.waitingForOthers')
          : `⚓ ${t('games.sea_battle_v1.table.actions.confirmPlacement')}`}
      </ActionButton>
      {placedShipIds.size > 0 && !isPlacementComplete && (
        <ActionButton
          variant="secondary"
          size={btnSize}
          onClick={onResetPlacement}
        >
          ↺ {t('games.sea_battle_v1.table.actions.resetPlacement')}
        </ActionButton>
      )}
      {!isPlacementComplete && onAutoPlace && (
        <ActionButton variant="secondary" size={btnSize} onClick={onAutoPlace}>
          🎲{' '}
          {placedShipIds.size > 0
            ? t('games.sea_battle_v1.table.actions.randomize')
            : t('games.sea_battle_v1.table.actions.autoPlace')}
        </ActionButton>
      )}
    </PlacementActions>
  );

  const boardEl = (
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
            <Label key={label} color={theme.textSecondaryColor}>
              {label}
            </Label>
          ))}
        </ColLabels>
        <RowLabels>
          {ROW_LABELS.map((label) => (
            <Label key={label} color={theme.textSecondaryColor}>
              {label}
            </Label>
          ))}
        </RowLabels>
        <BoardGrid
          backgroundColor={theme.boardBackground}
          borderColor={theme.cellBorder}
          data-testid="sea-battle-board-grid"
          pointerEvents="auto"
        >
          {board.map((row, rIndex) =>
            row.map((cellState, cIndex) => {
              const isHovered = hoveredCells.some(
                (c) => c.row === rIndex && c.col === cIndex,
              );
              const isInvalidCell = isHovered && isInvalidHover;
              return (
                <BoardCell
                  key={`${rIndex}-${cIndex}`}
                  isClickable={!!selectedShip}
                  backgroundColor={getCellBg(
                    cellState,
                    theme,
                    isHovered,
                    isInvalidCell,
                  )}
                  borderColor={
                    isInvalidCell ? 'rgba(239,68,68,0.6)' : theme.cellBorder
                  }
                  borderRadius={parseInt(theme.borderRadius) || 4}
                  data-row={rIndex}
                  data-col={cIndex}
                  data-highlighted={isHovered ? 'true' : 'false'}
                  className={
                    isHovered && !isInvalidCell ? 'sb-valid-pulse' : undefined
                  }
                  onMouseEnter={() => handleCellHover(rIndex, cIndex)}
                  onMouseLeave={() => {
                    handleCellHover(-1, -1);
                    setIsInvalidHover(false);
                  }}
                  onPointerEnter={() => handleCellHover(rIndex, cIndex)}
                  onPointerMove={() => handleCellHover(rIndex, cIndex)}
                  onPointerLeave={() => {
                    handleCellHover(-1, -1);
                    setIsInvalidHover(false);
                  }}
                  onClick={() => handleCellClick(rIndex, cIndex)}
                  {...getDropProps(rIndex, cIndex)}
                />
              );
            }),
          )}
        </BoardGrid>
      </BoardWithLabels>
    </PlayerSection>
  );

  // Mobile: compact palette + actions above board so buttons don't overlap the grid
  // Desktop: palette beside board, actions below
  if (isMobile) {
    return (
      <YStack
        width="100%"
        gap="$2"
        onDragEnd={handleDragEnd}
        paddingHorizontal="$1"
      >
        {shipPaletteEl}
        {actionsEl}
        <BoardContainer alignSelf="center">{boardEl}</BoardContainer>
      </YStack>
    );
  }

  return (
    <YStack width="100%" gap="$4">
      <GameBoardWrapper onDragEnd={handleDragEnd}>
        <BoardContainer>
          <PlacementHeader className="placement-header">
            <Text
              data-testid="placement-instruction"
              color={theme.textColor}
              fontSize="$5"
              fontWeight="700"
              margin={0}
              className="placement-title"
            >
              {t('games.sea_battle_v1.table.players.placeShips')}
            </Text>
          </PlacementHeader>
          {boardEl}
        </BoardContainer>
        {shipPaletteEl}
      </GameBoardWrapper>
      {actionsEl}
    </YStack>
  );
}

function createEmptyBoard(): CellState[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
}

function getCellsForPlacement(
  startRow: number,
  startCol: number,
  size: number,
  isVertical: boolean,
): ShipCell[] | null {
  const cells: ShipCell[] = [];

  for (let i = 0; i < size; i++) {
    const row = isVertical ? startRow + i : startRow;
    const col = isVertical ? startCol : startCol + i;

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }

    cells.push({ row, col });
  }

  return cells;
}
