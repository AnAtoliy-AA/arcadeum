'use client';

import { useCallback, useMemo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import type { SeaBattlePlayerState } from '../types';
import { CELL_STATE, ROW_LABELS, COL_LABELS } from '../types';
import { ShipsLeft } from './ShipsLeft';
import {
  PlayerSection,
  PlayerSectionWrapper,
  PlayerName,
  PlayerStats,
  BoardGrid,
  BoardCell,
  BoardWithLabels,
  RowLabels,
  ColLabels,
  Label,
  MainGameArea,
  BadgeWrapper,
} from './styles';
import { SeaBattleGrids } from './SeaBattleGrids';
import { IdleBadge } from '@/shared/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import type { SeaBattleTheme } from '../lib/theme';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';

interface AttackBoardProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  isMyTurn: boolean;
  onAttack: (targetPlayerId: string, row: number, col: number) => void;
  resolveDisplayName: (id: string, fallback: string) => string;
  disabled?: boolean;
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

function getCellIcon(
  sunkCellSet: Set<string>,
  playerId: string,
  rIndex: number,
  cIndex: number,
  cellState: number,
): string | null {
  if (sunkCellSet.has(`${playerId}-${rIndex}-${cIndex}`)) return '💀';
  if (cellState === CELL_STATE.HIT) return '🔥';
  return null;
}

function getCellAnimClass(
  sunkCellSet: Set<string>,
  playerId: string,
  rIndex: number,
  cIndex: number,
  cellState: number,
): string | undefined {
  if (sunkCellSet.has(`${playerId}-${rIndex}-${cIndex}`)) return 'sb-glow-sunk';
  if (cellState === CELL_STATE.HIT) return 'sb-glow-hit';
  return undefined;
}

export function AttackBoard({
  players,
  currentUserId,
  isMyTurn,
  onAttack,
  resolveDisplayName,
  disabled = false,
}: AttackBoardProps) {
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.playerId === currentUserId) || null;
  }, [players, currentUserId]);

  const opponents = useMemo(() => {
    return players.filter((p) => p.playerId !== currentUserId && p.alive);
  }, [players, currentUserId]);

  const idlePlayers = useGameStore((s: GameState) => s.idlePlayers);

  const sunkCellSet = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      p.ships
        .filter((s) => s.sunk)
        .forEach((s) => {
          s.cells.forEach((c) => set.add(`${p.playerId}-${c.row}-${c.col}`));
        });
    });
    return set;
  }, [players]);

  const handleCellClick = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!isMyTurn || disabled) return;

      const target = players.find((p) => p.playerId === targetPlayerId);
      if (!target) return;

      const cellState = target.board[row]?.[col];
      if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
        return;
      }

      onAttack(targetPlayerId, row, col);
    },
    [isMyTurn, disabled, players, onAttack],
  );

  return (
    <MainGameArea data-testid="game-main-area">
      <SeaBattleGrids>
        {currentPlayer && (
          <PlayerSectionWrapper>
            <PlayerSection
              backgroundColor={theme.boardBackground}
              borderColor={theme.cellBorder}
              style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
            >
              <PlayerName
                data-testid="player-board-name"
                color={theme.textColor}
              >
                {resolveDisplayName(currentPlayer.playerId, 'You')} (Your Fleet)
                {idlePlayers.includes(currentPlayer.playerId) && <IdleBadge />}
              </PlayerName>
              <PlayerStats>
                <ShipsLeft ships={currentPlayer.ships} isMe={true} />
              </PlayerStats>
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
                >
                  {currentPlayer.board.map((row, rIndex) =>
                    row.map((cellState, cIndex) => {
                      const ownIcon = getCellIcon(
                        sunkCellSet,
                        currentPlayer.playerId,
                        rIndex,
                        cIndex,
                        cellState,
                      );
                      const ownIconFilter =
                        ownIcon === '💀'
                          ? 'drop-shadow(0 0 5px rgba(239,68,68,0.9))'
                          : ownIcon === '🔥'
                            ? 'drop-shadow(0 0 5px rgba(251,146,60,0.9))'
                            : undefined;
                      return (
                        <BoardCell
                          key={`own-${rIndex}-${cIndex}`}
                          isClickable={false}
                          position="relative"
                          backgroundColor={getCellBg(cellState, theme)}
                          borderColor={theme.cellBorder}
                          borderRadius={parseInt(theme.borderRadius) || 4}
                          className={getCellAnimClass(
                            sunkCellSet,
                            currentPlayer.playerId,
                            rIndex,
                            cIndex,
                            cellState,
                          )}
                        >
                          {ownIcon && (
                            <Text
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize={13}
                              style={
                                {
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                  filter: ownIconFilter,
                                } as React.CSSProperties
                              }
                            >
                              {ownIcon}
                            </Text>
                          )}
                          {cellState === CELL_STATE.MISS && (
                            <YStack
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              alignItems="center"
                              justifyContent="center"
                              style={
                                { pointerEvents: 'none' } as React.CSSProperties
                              }
                            >
                              <YStack
                                width={6}
                                height={6}
                                borderRadius={100}
                                backgroundColor="rgba(255,255,255,0.7)"
                              />
                            </YStack>
                          )}
                        </BoardCell>
                      );
                    }),
                  )}
                </BoardGrid>
              </BoardWithLabels>
            </PlayerSection>
          </PlayerSectionWrapper>
        )}

        {opponents.map((opponent) => (
          <PlayerSectionWrapper key={opponent.playerId}>
            <BadgeWrapper
              backgroundColor={theme.boardBackground}
              borderRadius={8}
              paddingHorizontal="$1.5"
              top={-4}
            >
              {isMyTurn && (
                <XStack
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius={8}
                  borderWidth={1}
                  backgroundColor="rgba(239,68,68,0.1)"
                  borderColor="rgba(239,68,68,0.3)"
                >
                  <Text fontSize={10}>🎯</Text>
                  <Text
                    fontSize={9}
                    fontWeight="700"
                    color="#fca5a5"
                    textTransform="uppercase"
                  >
                    {t(
                      'games.sea_battle_v1.table.players.targetBadge' as TranslationKey,
                    )}
                  </Text>
                </XStack>
              )}
            </BadgeWrapper>
            <PlayerSection
              isTargetable={isMyTurn}
              backgroundColor={theme.boardBackground}
              borderColor={isMyTurn ? theme.accentColor : theme.cellBorder}
              className={isMyTurn ? 'sb-breathe' : undefined}
              style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
            >
              <PlayerName
                data-testid="player-board-name"
                color={theme.textColor}
              >
                {resolveDisplayName(opponent.playerId, 'Opponent')}
                {idlePlayers.includes(opponent.playerId) && <IdleBadge />}
              </PlayerName>
              <PlayerStats>
                <ShipsLeft ships={opponent.ships} isMe={false} />
              </PlayerStats>
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
                >
                  {opponent.board.map((row, rIndex) =>
                    row.map((cellState, cIndex) => {
                      const isSunk = sunkCellSet.has(
                        `${opponent.playerId}-${rIndex}-${cIndex}`,
                      );
                      const displayState = isSunk
                        ? CELL_STATE.HIT
                        : cellState === CELL_STATE.SHIP
                          ? CELL_STATE.EMPTY
                          : cellState;
                      const canAttack =
                        isMyTurn &&
                        !disabled &&
                        cellState !== CELL_STATE.HIT &&
                        cellState !== CELL_STATE.MISS &&
                        !isSunk;
                      const icon = getCellIcon(
                        sunkCellSet,
                        opponent.playerId,
                        rIndex,
                        cIndex,
                        cellState,
                      );
                      const iconFilter =
                        icon === '💀'
                          ? 'drop-shadow(0 0 4px rgba(239,68,68,0.9))'
                          : icon === '🔥'
                            ? 'drop-shadow(0 0 4px rgba(251,146,60,0.9))'
                            : undefined;

                      return (
                        <BoardCell
                          key={`${opponent.playerId}-${rIndex}-${cIndex}`}
                          isClickable={canAttack}
                          position="relative"
                          backgroundColor={getCellBg(displayState, theme)}
                          hoverStyle={
                            canAttack
                              ? {
                                  scale: 1.05,
                                  backgroundColor: theme.cellHover,
                                  borderColor: theme.primaryColor,
                                }
                              : undefined
                          }
                          borderColor={theme.cellBorder}
                          borderRadius={parseInt(theme.borderRadius) || 3}
                          data-row={rIndex}
                          data-col={cIndex}
                          className={getCellAnimClass(
                            sunkCellSet,
                            opponent.playerId,
                            rIndex,
                            cIndex,
                            cellState,
                          )}
                          onClick={() =>
                            canAttack &&
                            handleCellClick(opponent.playerId, rIndex, cIndex)
                          }
                        >
                          {icon && (
                            <Text
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize={13}
                              style={
                                {
                                  pointerEvents: 'none',
                                  userSelect: 'none',
                                  filter: iconFilter,
                                } as React.CSSProperties
                              }
                            >
                              {icon}
                            </Text>
                          )}
                          {displayState === CELL_STATE.MISS && (
                            <YStack
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              alignItems="center"
                              justifyContent="center"
                              style={
                                { pointerEvents: 'none' } as React.CSSProperties
                              }
                            >
                              <YStack
                                width={6}
                                height={6}
                                borderRadius={100}
                                backgroundColor="rgba(255,255,255,0.7)"
                              />
                            </YStack>
                          )}
                        </BoardCell>
                      );
                    }),
                  )}
                </BoardGrid>
              </BoardWithLabels>
            </PlayerSection>
          </PlayerSectionWrapper>
        ))}
      </SeaBattleGrids>
    </MainGameArea>
  );
}
