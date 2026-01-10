import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { UseAutoplayReturn } from '../hooks/useAutoplay';

interface AutoplayControlsProps {
  t: (key: string) => string;
  autoplayState: UseAutoplayReturn;
}

export const AutoplayControls: React.FC<AutoplayControlsProps> = ({
  t,
  autoplayState,
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
  } = autoplayState;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expanded]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Container onClick={handleContainerClick}>
      <Header onClick={() => setExpanded(!expanded)} $expanded={expanded}>
        <HeaderText>{t('games.table.autoplay.title')}</HeaderText>
        <Toggle>{expanded ? '▲' : '▼'}</Toggle>
      </Header>
      {expanded && (
        <DropdownMenu>
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
        </DropdownMenu>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  position: relative;
  z-index: 50;
`;

const Header = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  user-select: none;
  background: ${({ $expanded }) =>
    $expanded ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(99, 102, 241, 0.2);
  }
`;

const HeaderText = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  font-weight: 600;
`;

const Toggle = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  width: 280px;
  background: #1e1e2e;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
`;

const Label = styled.label<{ $secondary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
  ${({ $secondary }) =>
    $secondary &&
    `
    padding-left: 1.5rem;
    opacity: 0.9;
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.05);
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
