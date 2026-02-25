'use client';
import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import styled from 'styled-components';
import { Ship, SHIPS } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ShipCount = styled.div`
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 800;
  font-family: monospace;
`;

const FleetGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ShipWrapper = styled.div<{ $sunk: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  opacity: ${(props) => (props.$sunk ? 0.5 : 1)};
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -2px;
    right: -2px;
    height: 2px;
    background: #ff4444;
    transform: translateY(-50%) rotate(-15deg);
    display: ${(props) => (props.$sunk ? 'block' : 'none')};
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }
`;

const ShipBody = styled.div`
  display: flex;
  gap: 1px;
`;

const ShipBlock = styled.div<{
  $sunk: boolean;
  $isMe: boolean;
  $idx: number; // Index in the ship (0..size-1)
}>`
  width: 10px;
  height: 10px;
  background-color: ${(props) => {
    if (props.$sunk) return '#ff4444';
    if (props.$isMe) return '#4caf50';
    return '#ccc'; // Enemy ships are neutral gray until sunk
  }};
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 2px;
`;

interface ShipsLeftProps {
  ships: Ship[];
  isMe: boolean;
}

export function ShipsLeft({ ships, isMe }: ShipsLeftProps) {
  const { t } = useTranslation();
  // Sort ships for consistent display: 4, 3, 3, 2, 2, 2, 1, 1, 1, 1
  const sortedConfig = [...SHIPS].sort((a, b) => b.size - a.size);

  const totalShips = sortedConfig.length;
  const sunkCount = ships.filter((s) => s.sunk).length;
  const aliveCount = totalShips - sunkCount;

  return (
    <Container>
      <TitleContainer>
        <Title>{t('games.sea_battle_v1.table.state.shipsRemaining')}</Title>
        <ShipCount>
          {aliveCount}/{totalShips}
        </ShipCount>
      </TitleContainer>
      <FleetGrid>
        {sortedConfig.map((config) => {
          const shipState = ships.find((s) => s.id === config.id);
          // If shipState exists, use its sunk status.
          // If not found (e.g. purely visual or not placed yet), assume alive/not sunk.
          const isSunk = shipState?.sunk ?? false;

          return (
            <ShipWrapper
              key={config.id}
              $sunk={isSunk}
              title={config.name}
              data-sunk={isSunk ? 'true' : 'false'}
            >
              <ShipBody>
                {Array.from({ length: config.size }).map((_, i) => (
                  <ShipBlock key={i} $sunk={isSunk} $isMe={isMe} $idx={i} />
                ))}
              </ShipBody>
            </ShipWrapper>
          );
        })}
      </FleetGrid>
    </Container>
  );
}
