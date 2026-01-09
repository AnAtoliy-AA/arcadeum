import React, { useState } from 'react';
import styled from 'styled-components';
import type { ExplodingCatsCard, ExplodingCatsLogEntry } from '../types';
import { useAutoplay } from '../hooks/useAutoplay';

interface PendingAction {
  type: string;
  playerId: string;
  payload?: unknown;
  nopeCount: number;
}

interface PendingFavor {
  requesterId: string;
  targetId: string;
}

interface AutoplayControlsProps {
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  hand: ExplodingCatsCard[];
  logs: ExplodingCatsLogEntry[];
  pendingAction: PendingAction | null;
  pendingFavor: PendingFavor | null;
  pendingDefuse: string | null;
  deckSize: number;
  playerOrder: string[];
  currentUserId: string | null;
  t: (key: string) => string;
  onDraw: () => void;
  onPlayActionCard: (card: ExplodingCatsCard) => void;
  onPlayNope: () => void;
  onGiveFavorCard: (card: ExplodingCatsCard) => void;
  onPlayDefuse: (position: number) => void;
}

export const AutoplayControls: React.FC<AutoplayControlsProps> = ({
  isMyTurn,
  canAct,
  canPlayNope,
  hand,
  logs,
  pendingAction,
  pendingFavor,
  pendingDefuse,
  deckSize,
  playerOrder,
  currentUserId,
  t,
  onDraw,
  onPlayActionCard,
  onPlayNope,
  onGiveFavorCard,
  onPlayDefuse,
}) => {
  const [expanded, setExpanded] = useState(false);

  const {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled,
    setAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoDrawSkipAfterShuffleEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  } = useAutoplay({
    isMyTurn,
    canAct,
    canPlayNope,
    hand,
    logs,
    pendingAction,
    pendingFavor,
    pendingDefuse,
    deckSize,
    playerOrder,
    currentUserId,
    onDraw,
    onPlayActionCard,
    onPlayNope,
    onGiveFavorCard,
    onPlayDefuse,
  });

  return (
    <Section>
      <Header onClick={() => setExpanded(!expanded)}>
        <HeaderText>{t('games.table.autoplay.title')}</HeaderText>
        <Toggle>{expanded ? '▼' : '▶'}</Toggle>
      </Header>
      {expanded && (
        <>
          <Label>
            <Checkbox
              type="checkbox"
              checked={allEnabled}
              onChange={(e) => setAllEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoPlay')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoDrawEnabled}
              onChange={(e) => setAutoDrawEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoDraw')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoSkipEnabled}
              onChange={(e) => setAutoSkipEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoSkip')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoShuffleAfterDefuseEnabled}
              onChange={(e) =>
                setAutoShuffleAfterDefuseEnabled(e.target.checked)
              }
            />
            <Text>{t('games.table.autoplay.autoShuffle')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoDrawSkipAfterShuffleEnabled}
              disabled={!autoShuffleAfterDefuseEnabled}
              style={{
                opacity: autoShuffleAfterDefuseEnabled ? 1 : 0.5,
                marginLeft: '1rem',
              }}
              onChange={(e) =>
                setAutoDrawSkipAfterShuffleEnabled(e.target.checked)
              }
            />
            <Text>{t('games.table.autoplay.autoDrawSkipAfterShuffle')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoNopeAttackEnabled}
              onChange={(e) => setAutoNopeAttackEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoNopeAttack')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoGiveFavorEnabled}
              onChange={(e) => setAutoGiveFavorEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoGiveFavor')}</Text>
          </Label>
          <Label $secondary>
            <Checkbox
              type="checkbox"
              checked={autoDefuseEnabled}
              onChange={(e) => setAutoDefuseEnabled(e.target.checked)}
            />
            <Text>{t('games.table.autoplay.autoDefuse')}</Text>
          </Label>
        </>
      )}
    </Section>
  );
};

// Styled components
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.25rem 0;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderText = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  font-weight: 600;
`;

const Toggle = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
`;

const Label = styled.label<{ $secondary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0;
  ${({ $secondary }) =>
    $secondary &&
    `
    margin-left: 1.5rem;
    opacity: 0.9;
  `}

  &:hover {
    opacity: 0.8;
  }
`;

const Checkbox = styled.input`
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #6366f1;
`;

const Text = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
`;
