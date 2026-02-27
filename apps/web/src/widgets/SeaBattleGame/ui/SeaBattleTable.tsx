import styled, { css, keyframes } from 'styled-components';
import React from 'react';
import { SeaBattlePlayerState } from '../types';
import { ShipsLeft } from './ShipsLeft';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Badge } from '@/shared/ui/Badge';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

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
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TurnBanner = styled(GlassCard)`
  padding: 1.5rem 2.5rem;
  width: auto;
  min-width: 300px;
  align-items: center;
  gap: 1rem;
  flex-direction: row;
  border-radius: 100px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);

  @media (max-width: 480px) {
    padding: 1rem 1.5rem;
    min-width: 250px;
  }
`;

const turnPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(87, 195, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(87, 195, 255, 0); }
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
  position: relative;
  overflow: visible;

  ${(props) =>
    props.$isActive &&
    css`
      animation: ${turnPulse} 2s infinite;
      border-color: #57c3ff;
      background: rgba(87, 195, 255, 0.05);
    `}
`;

const BadgeWrapper = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
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
  const { t } = useTranslation();
  const activePlayerId = playerOrder[currentTurnIndex];
  const isMyTurn = activePlayerId === currentUserId;
  const activePlayer = players.find((p) => p.playerId === activePlayerId);
  const activeName = activePlayer
    ? resolveDisplayName(activePlayer.playerId, 'Player')
    : '...';

  return (
    <TableContainer>
      <TurnBanner>
        <Badge
          variant={isMyTurn ? 'success' : 'info'}
          size="md"
          pulse={isMyTurn}
        >
          {isMyTurn ? '🎯' : '⏳'}
        </Badge>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: '0.8rem',
              opacity: 0.7,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurn' as TranslationKey,
                )
              : t(
                  'games.sea_battle_v1.table.players.waitingFor' as TranslationKey,
                  { player: activeName },
                )}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {isMyTurn
              ? t(
                  'games.sea_battle_v1.table.players.yourTurnAttack' as TranslationKey,
                ).replace('🎯 ', '')
              : activeName}
          </span>
        </div>
      </TurnBanner>

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
              {isActive && (
                <BadgeWrapper>
                  <Badge variant="success" size="sm" pulse>
                    {t(
                      'games.sea_battle_v1.table.players.alive' as TranslationKey,
                    )}
                  </Badge>
                </BadgeWrapper>
              )}
              <PlayerName>
                {resolveDisplayName(player.playerId, 'Player')}{' '}
                {isMe
                  ? `(${t('games.sea_battle_v1.table.players.you' as TranslationKey)})`
                  : ''}
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
