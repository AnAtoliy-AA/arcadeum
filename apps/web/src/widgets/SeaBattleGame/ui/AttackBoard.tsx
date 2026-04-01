'use client';

import { useCallback, useMemo } from 'react';
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
import { Badge, IdleBadge } from '@/shared/ui';
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
          >
            {currentTurnPlayerId === currentUserId && (
              <BadgeWrapper>
                <Badge variant="success" size="sm" pulse>
                  {t('games.sea_battle_v1.table.players.yourTurn')}
                </Badge>
              </BadgeWrapper>
            )}
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
                  row.map((cellState, cIndex) => (
                    <BoardCell
                      key={`own-${rIndex}-${cIndex}`}
                      isClickable={false}
                      backgroundColor={getCellBg(cellState, theme)}
                      borderColor={theme.cellBorder}
                      borderRadius={parseInt(theme.borderRadius) || 4}
                    />
                  )),
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
            borderColor={theme.cellBorder}
          >
            {currentTurnPlayerId === opponent.playerId && (
              <BadgeWrapper>
                <Badge variant="success" size="sm" pulse>
                  {t(
                    'games.sea_battle_v1.table.players.alive' as TranslationKey,
                  )}
                </Badge>
              </BadgeWrapper>
            )}
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
                    const displayState =
                      cellState === CELL_STATE.SHIP
                        ? CELL_STATE.EMPTY
                        : cellState;
                    const canAttack =
                      isMyTurn &&
                      !disabled &&
                      cellState !== CELL_STATE.HIT &&
                      cellState !== CELL_STATE.MISS;

                    return (
                      <BoardCell
                        key={`${opponent.playerId}-${rIndex}-${cIndex}`}
                        isClickable={canAttack}
                        backgroundColor={getCellBg(displayState, theme)}
                        hoverStyle={
                          canAttack
                            ? { backgroundColor: theme.cellHover }
                            : undefined
                        }
                        borderColor={theme.cellBorder}
                        borderRadius={parseInt(theme.borderRadius) || 4}
                        data-row={rIndex}
                        data-col={cIndex}
                        onClick={() =>
                          canAttack &&
                          handleCellClick(opponent.playerId, rIndex, cIndex)
                        }
                      />
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
