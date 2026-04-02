'use client';

import { useCallback, useMemo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import type { SeaBattlePlayerState } from '../types';
import { CELL_STATE, ROW_LABELS, COL_LABELS } from '../types';
import { ShipsLeft } from './ShipsLeft';
import {
  PlayerSection,
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
import { TurnBadge } from './TurnBadge';

interface AttackBoardProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  currentTurnPlayerId: string | null;
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
  currentTurnPlayerId,
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

  // Build a set of "playerId-row-col" keys for all sunk ship cells
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
    <MainGameArea>
      <SeaBattleGrids>
        {currentPlayer && (
          <PlayerSection
            position="relative"
            overflow="visible"
            backgroundColor={theme.boardBackground}
            borderColor={theme.cellBorder}
            style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
          >
            <BadgeWrapper>
              <TurnBadge
                isYourTurn={isMyTurn}
                text={
                  isMyTurn
                    ? t(
                        'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                      )
                    : opponents[0]
                      ? `${t('games.sea_battle_v1.table.players.waitingFor' as TranslationKey)} ${resolveDisplayName(currentTurnPlayerId ?? '', 'Opponent')}`
                      : t(
                          'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                        )
                }
              />
            </BadgeWrapper>
            <PlayerName color={theme.textColor}>
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
                            fontSize={12}
                            style={
                              {
                                pointerEvents: 'none',
                                userSelect: 'none',
                              } as React.CSSProperties
                            }
                          >
                            {ownIcon}
                          </Text>
                        )}
                        {cellState === CELL_STATE.MISS && (
                          <YStack
                            position="absolute"
                            width={9}
                            height={9}
                            borderRadius={100}
                            backgroundColor="rgba(255,255,255,0.55)"
                            style={
                              { pointerEvents: 'none' } as React.CSSProperties
                            }
                          />
                        )}
                      </BoardCell>
                    );
                  }),
                )}
              </BoardGrid>
            </BoardWithLabels>
          </PlayerSection>
        )}

        {opponents.map((opponent) => (
          <PlayerSection
            key={opponent.playerId}
            position="relative"
            overflow="visible"
            isTargetable={isMyTurn}
            backgroundColor={theme.boardBackground}
            borderColor={isMyTurn ? theme.accentColor : theme.cellBorder}
            className={isMyTurn ? 'sb-breathe' : undefined}
            style={{ backdropFilter: 'blur(8px)' } as React.CSSProperties}
          >
            <BadgeWrapper>
              {isMyTurn && (
                <XStack
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  borderRadius={12}
                  borderWidth={1}
                  backgroundColor="rgba(239,68,68,0.15)"
                  borderColor="rgba(239,68,68,0.4)"
                >
                  <Text fontSize={12}>🎯</Text>
                  <Text fontSize={10} fontWeight="600" color="#fca5a5">
                    {t(
                      'games.sea_battle_v1.table.players.targetBadge' as TranslationKey,
                    )}
                  </Text>
                </XStack>
              )}
            </BadgeWrapper>
            <PlayerName color={theme.textColor}>
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

                    return (
                      <BoardCell
                        key={`${opponent.playerId}-${rIndex}-${cIndex}`}
                        isClickable={canAttack}
                        position="relative"
                        backgroundColor={getCellBg(displayState, theme)}
                        hoverStyle={
                          canAttack
                            ? {
                                scale: 1.08,
                                backgroundColor: theme.cellHover,
                                borderColor: theme.primaryColor,
                              }
                            : undefined
                        }
                        borderColor={theme.cellBorder}
                        borderRadius={parseInt(theme.borderRadius) || 4}
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
                            fontSize={12}
                            style={
                              {
                                pointerEvents: 'none',
                                userSelect: 'none',
                              } as React.CSSProperties
                            }
                          >
                            {icon}
                          </Text>
                        )}
                        {displayState === CELL_STATE.MISS && (
                          <YStack
                            position="absolute"
                            width={9}
                            height={9}
                            borderRadius={100}
                            backgroundColor="rgba(255,255,255,0.55)"
                            style={
                              { pointerEvents: 'none' } as React.CSSProperties
                            }
                          />
                        )}
                      </BoardCell>
                    );
                  }),
                )}
              </BoardGrid>
            </BoardWithLabels>
          </PlayerSection>
        ))}
      </SeaBattleGrids>
    </MainGameArea>
  );
}
