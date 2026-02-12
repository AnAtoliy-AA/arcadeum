import styled from 'styled-components';
import React from 'react';
import { SeaBattlePlayerState } from '../types';
import { ShipsLeft } from './ShipsLeft';

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 20px;
  padding: 20px;
`;

const GridsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  width: 100%;
  max-width: 1200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlayerSection = styled.div<{ $isMe: boolean; $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: ${(props) =>
    props.$isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid
    ${(props) =>
      props.$isMe
        ? 'var(--primary-color)'
        : props.$isActive
          ? 'var(--accent-color)'
          : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  transition: all 0.3s ease;
`;

const PlayerName = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 4px;
  width: 300px;
  height: 300px;
`;

const Cell = styled.div<{ $state: number }>`
  width: 100%;
  height: 100%;
  background: ${(props) => {
    switch (props.$state) {
      case 0:
        return 'rgba(255, 255, 255, 0.05)'; // Empty water
      case 1:
        return '#666'; // Ship (only visible to owner normally)
      case 2:
        return '#ff4444'; // Hit
      case 3:
        return '#ffffff'; // Miss
      default:
        return 'transparent';
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

interface SeaBattleTableProps {
  players: SeaBattlePlayerState[];
  currentUserId: string | null;
  currentTurnIndex: number;
  playerOrder: string[];
  resolveDisplayName: (id: string, fb: string) => string;
}

export function SeaBattleTable({
  players,
  currentUserId,
  currentTurnIndex,
  playerOrder,
  resolveDisplayName,
}: SeaBattleTableProps) {
  return (
    <TableContainer>
      <GridsContainer>
        {players.map((player) => {
          const isMe = player.playerId === currentUserId;
          const isActive = playerOrder[currentTurnIndex] === player.playerId;

          return (
            <PlayerSection
              key={player.playerId}
              $isMe={isMe}
              $isActive={isActive}
            >
              <PlayerName>
                {resolveDisplayName(player.playerId, 'Player')}{' '}
                {isMe ? '(You)' : ''}
              </PlayerName>
              <Grid>
                {player.board.map((row, rIndex) =>
                  row.map((cellState, cIndex) => (
                    <Cell
                      key={`${rIndex}-${cIndex}`}
                      $state={isMe || cellState > 1 ? cellState : 0}
                      title={`(${rIndex}, ${cIndex})`}
                    />
                  )),
                )}
              </Grid>
              <ShipsLeft ships={player.ships} isMe={isMe} />
            </PlayerSection>
          );
        })}
      </GridsContainer>
    </TableContainer>
  );
}
