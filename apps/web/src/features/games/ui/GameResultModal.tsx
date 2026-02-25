'use client';

import styled, { keyframes, css } from 'styled-components';
import { Button } from '@/shared/ui';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { Modal, CloseButton, ModalButton } from './SharedModalStyles';

// --- Types ---

interface GameResultModalProps {
  isOpen: boolean;
  result: 'victory' | 'defeat' | null;
  onRematch?: () => void;
  onClose?: () => void;
  rematchLoading?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

// --- Component ---

export function GameResultModal({
  isOpen,
  result,
  onRematch,
  onClose,
  rematchLoading,
  t,
}: GameResultModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isOpen || !result || !isClient) return null;

  const isVictory = result === 'victory';

  return createPortal(
    <Modal style={{ background: 'transparent' }}>
      <Backdrop $isVictory={isVictory} />

      <ContentContainer $show={isOpen}>
        {onClose && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <CloseButton onClick={onClose}>×</CloseButton>
          </div>
        )}
        <ResultTitle $isVictory={isVictory} data-testid="game-result-title">
          <span className="emoji">{isVictory ? '🏆' : '💀'}</span>
          <span className="text">
            {t(`games.table.${result}.title` as TranslationKey)}
          </span>
        </ResultTitle>

        <ResultMessage>
          {t(`games.table.${result}.message` as TranslationKey)}
        </ResultMessage>

        <Actions>
          {onRematch && (
            <StyledButton
              variant={isVictory ? 'primary' : 'secondary'}
              size="lg"
              onClick={onRematch}
              disabled={rematchLoading}
              $isVictory={isVictory}
              data-testid="rematch-button"
            >
              {rematchLoading
                ? t('games.table.rematch.loading')
                : t('games.table.rematch.button')}
            </StyledButton>
          )}

          <HomeButton href="/">
            {t('games.common.actions.backToHome')}
          </HomeButton>

          {onClose && (
            <ModalButton variant="ghost" onClick={onClose}>
              {t('games.table.modals.common.close' as TranslationKey)}
            </ModalButton>
          )}
        </Actions>
      </ContentContainer>

      {isVictory && <ConfettiContainer />}
    </Modal>,
    document.body,
  );
}

// --- Animations ---

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// --- Styled Components ---

const Backdrop = styled.div<{ $isVictory: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${(props) =>
    props.$isVictory
      ? 'linear-gradient(135deg, rgba(20, 0, 10, 0.9), rgba(50, 20, 0, 0.9))'
      : 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(20, 0, 0, 0.95))'};
  backdrop-filter: blur(8px);
  z-index: -1;
`;

const ContentContainer = styled.div<{ $show: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  width: 500px;
  text-align: center;
  transform: translateY(${(props) => (props.$show ? '0' : '50px')});
  opacity: ${(props) => (props.$show ? '1' : '0')};
  transition:
    transform 0.6s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.6s ease-out;
  transition-delay: ${(props) => (props.$show ? '0.1s' : '0s')};
  position: relative;
`;

const ResultTitle = styled.h1<{ $isVictory: boolean }>`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .emoji {
    font-size: 5rem;
    animation: ${float} 3s ease-in-out infinite;
  }

  .text {
    background: ${(props) =>
      props.$isVictory
        ? 'linear-gradient(to right, #FFD700, #FDB931)'
        : 'linear-gradient(to right, #ff4d4d, #c92f2f)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-transform: uppercase;
    letter-spacing: 2px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

const ResultMessage = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const StyledButton = styled(Button)<{ $isVictory: boolean }>`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;

  ${(props) =>
    props.$isVictory &&
    css`
      background: linear-gradient(45deg, #ffd700, #ffa500);
      border: none;
      color: #1a1a1a;
      animation: ${pulse} 2s infinite;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
      }
    `}
`;

const HomeButton = styled.a`
  display: block;
  padding: 0.75rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

// Static random values for pure rendering
const CONFETTI_PARTICLES = Array.from({ length: 50 }).map((_, i) => ({
  left: (i * 7) % 100,
  delay: (i * 0.17) % 3,
  color: ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF'][i % 5],
}));

const ConfettiContainer = () => {
  return (
    <ConfettiWrapper>
      {CONFETTI_PARTICLES.map((p, i) => (
        <ConfettiPiece
          key={i}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </ConfettiWrapper>
  );
};

const fall = keyframes`
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
`;

const ConfettiWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const ConfettiPiece = styled.div`
  position: absolute;
  top: -10px;
  width: 10px;
  height: 10px;
  animation: ${fall} 4s linear infinite;
`;
