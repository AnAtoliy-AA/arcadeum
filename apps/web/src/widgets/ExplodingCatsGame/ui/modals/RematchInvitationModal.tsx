'use client';

import styled from 'styled-components';

interface RematchInvitationModalProps {
  isOpen: boolean;
  hostName: string;
  hostId?: string;
  roomId?: string;
  message?: string;
  timeLeft: number;
  onAccept: () => void;
  onDecline: () => void;
  onBlockRematch?: (roomId: string) => void;
  onBlockUser?: (hostId: string) => void;
  accepting: boolean;
  t: (key: string) => string;
}

export function RematchInvitationModal({
  isOpen,
  hostName,
  hostId,
  roomId,
  message,
  timeLeft,
  onAccept,
  onDecline,
  onBlockRematch,
  onBlockUser,
  accepting,
  t,
}: RematchInvitationModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('games.table.rematch.invitationTitle')}</ModalTitle>
        <ModalDescription>
          {hostName} {t('games.table.rematch.invitationDescription')}
        </ModalDescription>

        {message && (
          <MessageBlock>
            <MessageLabel>{t('games.table.rematch.message')}:</MessageLabel>
            <MessageText>{message}</MessageText>
          </MessageBlock>
        )}

        <TimerContainer>
          <TimerValue $low={timeLeft <= 10}>{timeLeft}s</TimerValue>
          <TimerLabel>{t('games.table.rematch.toDecide')}</TimerLabel>
        </TimerContainer>

        <ButtonRow>
          <DeclineButton onClick={onDecline} disabled={accepting}>
            {t('games.table.rematch.decline')}
          </DeclineButton>
          <AcceptButton onClick={onAccept} disabled={accepting}>
            {accepting
              ? t('games.table.rematch.joining')
              : t('games.table.rematch.accept')}
          </AcceptButton>
        </ButtonRow>

        <BlockOptions>
          {onBlockRematch && roomId && (
            <BlockLink
              onClick={() => onBlockRematch(roomId)}
              disabled={accepting}
            >
              {t('games.table.rematch.blockThisRematch')}
            </BlockLink>
          )}
          {onBlockUser && hostId && (
            <BlockLink onClick={() => onBlockUser(hostId)} disabled={accepting}>
              {t('games.table.rematch.blockInvitations')}
            </BlockLink>
          )}
        </BlockOptions>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #fff;
`;

const ModalDescription = styled.p`
  margin: 0 0 1.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const MessageBlock = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const MessageLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MessageText = styled.div`
  font-size: 1rem;
  color: #fff;
  white-space: pre-wrap;
  font-style: italic;
`;

const TimerContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const TimerValue = styled.div<{ $low: boolean }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ $low }) => ($low ? '#ef4444' : '#6366f1')};
  transition: color 0.3s ease;
`;

const TimerLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const DeclineButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AcceptButton = styled.button`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BlockOptions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
`;

const BlockLink = styled.button`
  margin-top: 1rem;
  padding: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover:not(:disabled) {
    color: #ef4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
