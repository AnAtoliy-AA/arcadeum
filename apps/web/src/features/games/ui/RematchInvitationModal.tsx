'use client';

import styled from 'styled-components';
import { Button } from '@/shared/ui';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
  ModalButton,
} from './SharedModalStyles';

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
  cardVariant?: string;
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
  cardVariant,
}: RematchInvitationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClick={onDecline}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalTitle $variant={cardVariant}>
          {t('games.table.rematch.invitationTitle')}
        </ModalTitle>
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

        <ModalActions>
          <ModalButton
            variant="secondary"
            onClick={onDecline}
            disabled={accepting}
          >
            {t('games.table.rematch.decline')}
          </ModalButton>
          <ModalButton onClick={onAccept} disabled={accepting}>
            {accepting
              ? t('games.table.rematch.joining')
              : t('games.table.rematch.accept')}
          </ModalButton>
        </ModalActions>

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
      </ModalContent>
    </Modal>
  );
}

const ModalDescription = styled.p`
  margin: 0 0 1.5rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.secondary};
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
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MessageText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
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
  color: ${({ theme }) => theme.text.secondary};
`;

const BlockOptions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
`;

const BlockLink = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
})`
  margin-top: 1rem;
  padding: 0.5rem;
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: underline;

  &:hover:not(:disabled) {
    color: #ef4444;
  }
`;
