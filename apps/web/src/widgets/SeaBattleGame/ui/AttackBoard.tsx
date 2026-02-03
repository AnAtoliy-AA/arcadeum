'use client';

import React, { useCallback, useMemo } from 'react';
import type { SeaBattlePlayerState } from '../types';
import { CELL_STATE, ROW_LABELS, COL_LABELS } from '../types';
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
  TurnIndicator,
} from './styles';

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
}: AttackBoardProps) {
  const currentPlayer = useMemo(() => {
    return players.find((p) => p.playerId === currentUserId) || null;
  }, [players, currentUserId]);

  const opponents = useMemo(() => {
    return players.filter((p) => p.playerId !== currentUserId && p.alive);
  }, [players, currentUserId]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TurnIndicator $isYourTurn={isMyTurn}>
        {isMyTurn
          ? '🎯 Your Turn - Attack an opponent!'
          : `Waiting for ${resolveDisplayName(currentTurnPlayerId || '', 'opponent')}...`}
      </TurnIndicator>

      <GridsContainer>
        {/* Own board - view only */}
        {currentPlayer && (
          <PlayerSection $isMe $isActive={false}>
            <PlayerName>
              {resolveDisplayName(currentPlayer.playerId, 'You')} (Your Fleet)
            </PlayerName>
            <PlayerStats>
              Ships Remaining: {currentPlayer.shipsRemaining}
            </PlayerStats>
            <BoardWithLabels>
              <div />
              <ColLabels>
                {COL_LABELS.map((label) => (
                  <Label key={label}>{label}</Label>
                ))}
              </ColLabels>
              <RowLabels>
                {ROW_LABELS.map((label) => (
                  <Label key={label}>{label}</Label>
                ))}
              </RowLabels>
              <BoardGrid>
                {currentPlayer.board.map((row, rIndex) =>
                  row.map((cellState, cIndex) => (
                    <BoardCell
                      key={`own-${rIndex}-${cIndex}`}
                      $state={cellState}
                      $isClickable={false}
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
            $isActive={currentTurnPlayerId === currentUserId}
          >
            <PlayerName>
              {resolveDisplayName(opponent.playerId, 'Opponent')}
            </PlayerName>
            <PlayerStats>
              Ships Remaining: {opponent.shipsRemaining}
            </PlayerStats>
            <BoardWithLabels>
              <div />
              <ColLabels>
                {COL_LABELS.map((label) => (
                  <Label key={label}>{label}</Label>
                ))}
              </ColLabels>
              <RowLabels>
                {ROW_LABELS.map((label) => (
                  <Label key={label}>{label}</Label>
                ))}
              </RowLabels>
              <BoardGrid>
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
    </div>
  );
}
