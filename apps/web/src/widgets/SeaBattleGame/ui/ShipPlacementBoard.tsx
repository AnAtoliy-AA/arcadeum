'use client';

import { useState, useCallback, useMemo } from 'react';
import { Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
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
import { SeaBattleGrids } from './SeaBattleGrids';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import type { SeaBattleTheme } from '../lib/theme';

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
): string {
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
          const r = cell.row + dr;
          const c = cell.col + dc;
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
        return;
      }

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );
      if (cells && canPlaceAt(row, col, selectedShip)) {
        setHoveredCells(cells);
      } else {
        setHoveredCells([]);
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
      setSelectedShipId(null);
      setHoveredCells([]);
    },
    [selectedShip, isVertical, canPlaceAt, onPlaceShip],
  );

  const handleRotate = useCallback(() => {
    setIsVertical((prev) => !prev);
  }, []);

  const isAllShipsPlaced = unplacedShips.length === 0;

  return (
    <GameBoardWrapper>
      <SeaBattleGrids>
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
                    return (
                      <BoardCell
                        key={`${rIndex}-${cIndex}`}
                        isClickable={!!selectedShip}
                        backgroundColor={getCellBg(cellState, theme, isHovered)}
                        borderColor={theme.cellBorder}
                        borderRadius={parseInt(theme.borderRadius) || 4}
                        data-row={rIndex}
                        data-col={cIndex}
                        data-highlighted={isHovered ? 'true' : 'false'}
                        onMouseEnter={() => handleCellHover(rIndex, cIndex)}
                        onMouseLeave={() => handleCellHover(-1, -1)}
                        onPointerEnter={() => handleCellHover(rIndex, cIndex)}
                        onPointerMove={() => handleCellHover(rIndex, cIndex)}
                        onPointerLeave={() => handleCellHover(-1, -1)}
                        onPress={() => handleCellClick(rIndex, cIndex)}
                      />
                    );
                  }),
                )}
              </BoardGrid>
            </BoardWithLabels>
          </PlayerSection>
        </BoardContainer>

        <ShipPalette
          backgroundColor={theme.boardBackground}
          borderColor={theme.cellBorder}
          data-testid="sea-battle-ship-palette"
        >
          <Text
            className="ship-palette-title"
            color={theme.textColor}
            fontSize="$4"
            fontWeight="600"
            margin={0}
            marginBottom="$3"
          >
            {t('games.sea_battle_v1.table.state.shipsPalette')}
          </Text>
          {SHIPS.map((ship) => {
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
                onPress={() =>
                  !isPlaced && setSelectedShipId(isSelected ? null : ship.id)
                }
                data-testid="ship-palette-item"
              >
                <ShipPreview>
                  {Array(ship.size)
                    .fill(null)
                    .map((_, i) => (
                      <ShipCellStyled
                        key={i}
                        backgroundColor={theme.shipColor}
                      />
                    ))}
                </ShipPreview>
                <ShipName color={theme.textColor}>
                  {ship.name} ({ship.size}){isPlaced && ' ✓'}
                </ShipName>
              </ShipItem>
            );
          })}
        </ShipPalette>
      </SeaBattleGrids>

      <PlacementActions>
        <RotateButton
          variant="secondary"
          onClick={handleRotate}
          disabled={!selectedShip}
        >
          {t('games.sea_battle_v1.table.actions.rotate')} (
          {isVertical
            ? t('games.sea_battle_v1.table.state.vertical')
            : t('games.sea_battle_v1.table.state.horizontal')}
          )
        </RotateButton>
        <ActionButton
          variant="primary"
          disabled={!isAllShipsPlaced || isPlacementComplete}
          onClick={onConfirmPlacement}
        >
          {isPlacementComplete
            ? t('games.sea_battle_v1.table.actions.waitingForOthers')
            : t('games.sea_battle_v1.table.actions.confirmPlacement')}
        </ActionButton>
        {placedShipIds.size > 0 && !isPlacementComplete && (
          <ActionButton variant="secondary" onClick={onResetPlacement}>
            {t('games.sea_battle_v1.table.actions.resetPlacement')}
          </ActionButton>
        )}
        {!isPlacementComplete && onAutoPlace && (
          <ActionButton variant="secondary" onClick={onAutoPlace}>
            {placedShipIds.size > 0
              ? t('games.sea_battle_v1.table.actions.randomize')
              : t('games.sea_battle_v1.table.actions.autoPlace')}
          </ActionButton>
        )}
      </PlacementActions>
    </GameBoardWrapper>
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
