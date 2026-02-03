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
import { getTheme } from '../lib/theme';

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
  const theme = getTheme(variant);
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
      <TurnIndicator $isYourTurn={isMyTurn} $theme={theme}>
        {isMyTurn
          ? '🎯 Your Turn - Attack an opponent!'
          : `Waiting for ${resolveDisplayName(currentTurnPlayerId || '', 'opponent')}...`}
      </TurnIndicator>

      <GridsContainer>
        {/* Own board - view only */}
        {currentPlayer && (
          <PlayerSection $isMe $isActive={false} $theme={theme}>
            <PlayerName $theme={theme}>
              {resolveDisplayName(currentPlayer.playerId, 'You')} (Your Fleet)
            </PlayerName>
            <PlayerStats $theme={theme}>
              Ships Remaining: {currentPlayer.shipsRemaining}
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
            $isActive={currentTurnPlayerId === currentUserId}
            $theme={theme}
          >
            <PlayerName $theme={theme}>
              {resolveDisplayName(opponent.playerId, 'Opponent')}
            </PlayerName>
            <PlayerStats $theme={theme}>
              Ships Remaining: {opponent.shipsRemaining}
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
