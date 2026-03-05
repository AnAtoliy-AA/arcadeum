'use client';

import React, { useCallback, useMemo } from 'react';
import type { SeaBattlePlayerState } from '../types';
import { CELL_STATE, ROW_LABELS, COL_LABELS } from '../types';
import { ShipsLeft } from './ShipsLeft';
import {
  GridsContainer,
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
import { Badge } from '@/shared/ui/Badge';
import { IdleBadge } from '@/shared/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { getTheme } from '../lib/theme';
import { useGameStore } from '@/features/games/store/gameStore';

interface AttackBoardProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  currentTurnPlayerId: string | null;
  isMyTurn: boolean;
  onAttack: (targetPlayerId: string, row: number, col: number) => void;
  resolveDisplayName: (id: string, fallback: string) => string;
  disabled?: boolean;
}

export function AttackBoard({
  players,
  currentUserId,
  currentTurnPlayerId,
  isMyTurn,
  onAttack,
  resolveDisplayName,
  disabled = false,
  variant = 'classic',
}: AttackBoardProps & { variant?: string }) {
  const { t } = useTranslation();
  const theme = getTheme(variant);
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.playerId === currentUserId) || null;
  }, [players, currentUserId]);

  const opponents = useMemo(() => {
    return players.filter((p) => p.playerId !== currentUserId && p.alive);
  }, [players, currentUserId]);

  const idlePlayers = useGameStore((s) => s.idlePlayers);

  const handleCellClick = useCallback(
    (targetPlayerId: string, row: number, col: number) => {
      if (!isMyTurn || disabled) return;

      const target = players.find((p) => p.playerId === targetPlayerId);
      if (!target) return;

      const cellState = target.board[row]?.[col];
      if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
        return; // Already attacked
      }

      onAttack(targetPlayerId, row, col);
    },
    [isMyTurn, disabled, players, onAttack],
  );

  return (
    <MainGameArea>
      <GridsContainer>
        {/* Own board - view only */}
        {currentPlayer && (
          <PlayerSection
            $isMe
            $isActive={currentTurnPlayerId === currentUserId}
            $theme={theme}
          >
            {currentTurnPlayerId === currentUserId && (
              <BadgeWrapper>
                <Badge variant="success" size="sm" pulse>
                  {t('games.sea_battle_v1.table.players.yourTurn')}
                </Badge>
              </BadgeWrapper>
            )}
            <PlayerName $theme={theme}>
              {resolveDisplayName(currentPlayer.playerId, 'You')} (Your Fleet)
              {idlePlayers.includes(currentPlayer.playerId) && <IdleBadge />}
            </PlayerName>
            <PlayerStats $theme={theme}>
              <ShipsLeft ships={currentPlayer.ships} isMe={true} />
            </PlayerStats>
            <BoardWithLabels>
              <div />
              <ColLabels>
                {COL_LABELS.map((label) => (
                  <Label key={label} $theme={theme}>
                    {label}
                  </Label>
                ))}
              </ColLabels>
              <RowLabels>
                {ROW_LABELS.map((label) => (
                  <Label key={label} $theme={theme}>
                    {label}
                  </Label>
                ))}
              </RowLabels>
              <BoardGrid $theme={theme}>
                {currentPlayer.board.map((row, rIndex) =>
                  row.map((cellState, cIndex) => (
                    <BoardCell
                      key={`own-${rIndex}-${cIndex}`}
                      $state={cellState}
                      $isClickable={false}
                      $theme={theme}
                    />
                  )),
                )}
              </BoardGrid>
            </BoardWithLabels>
          </PlayerSection>
        )}

        {/* Opponent boards - clickable */}
        {opponents.map((opponent) => (
          <PlayerSection
            key={opponent.playerId}
            $isMe={false}
            $isActive={currentTurnPlayerId === opponent.playerId}
            $isTargetable={isMyTurn}
            $theme={theme}
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
            <PlayerName $theme={theme}>
              {resolveDisplayName(opponent.playerId, 'Opponent')}
              {idlePlayers.includes(opponent.playerId) && <IdleBadge />}
            </PlayerName>
            <PlayerStats $theme={theme}>
              <ShipsLeft ships={opponent.ships} isMe={false} />
            </PlayerStats>
            <BoardWithLabels>
              <div />
              <ColLabels>
                {COL_LABELS.map((label) => (
                  <Label key={label} $theme={theme}>
                    {label}
                  </Label>
                ))}
              </ColLabels>
              <RowLabels>
                {ROW_LABELS.map((label) => (
                  <Label key={label} $theme={theme}>
                    {label}
                  </Label>
                ))}
              </RowLabels>
              <BoardGrid $theme={theme}>
                {opponent.board.map((row, rIndex) =>
                  row.map((cellState, cIndex) => {
                    // Only show hits and misses, hide ships
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
                        $state={displayState}
                        $isClickable={canAttack}
                        $theme={theme}
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
      </GridsContainer>
    </MainGameArea>
  );
}
