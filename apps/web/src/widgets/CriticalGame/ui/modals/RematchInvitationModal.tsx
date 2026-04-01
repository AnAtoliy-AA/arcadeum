'use client';

import { YStack, Text, styled } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';

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

const ModalDescription = styled(Text, {
  name: 'ModalDescription',
  fontSize: '$4',
  marginBottom: '$6',
  opacity: 0.8,
});

const MessageBlock = styled(YStack, {
  name: 'MessageBlock',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '$4',
  padding: '$4',
  marginBottom: '$6',
});

const MessageLabel = styled(Text, {
  name: 'MessageLabel',
  fontSize: '$2',
  opacity: 0.6,
  marginBottom: '$1',
  textTransform: 'uppercase',
  letterSpacing: 1,
});

const MessageText = styled(Text, {
  name: 'MessageText',
  fontSize: '$4',
  whiteSpace: 'pre-wrap',
  fontStyle: 'italic',
});

const TimerContainer = styled(YStack, {
  name: 'TimerContainer',
  marginBottom: '$8',
  alignItems: 'center',
  gap: '$1',
});

const TimerValue = styled(Text, {
  name: 'TimerValue',
  fontSize: '$9',
  fontWeight: '700',

  variants: {
    low: {
      true: { color: '#ef4444' },
      false: { color: '#6366f1' },
    },
  } as const,
});

const TimerLabel = styled(Text, {
  name: 'TimerLabel',
  fontSize: '$3',
  opacity: 0.6,
});

const BlockOptions = styled(YStack, {
  name: 'BlockOptions',
  alignItems: 'center',
  gap: '$1',
  marginTop: '$4',
});

const BlockLink = styled(Text, {
  name: 'BlockLink',
  marginTop: '$4',
  padding: '$2',
  textDecorationLine: 'underline',
  cursor: 'pointer',
  fontSize: '$3',

  hoverStyle: {
    color: '#ef4444',
  },
});

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
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalTitle $variant={cardVariant as GameVariant}>
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
          <TimerValue low={timeLeft <= 10}>{timeLeft}s</TimerValue>
          <TimerLabel>{t('games.table.rematch.toDecide')}</TimerLabel>
        </TimerContainer>

        <ModalActions>
          <ModalButton
            variant="secondary"
            onPress={onDecline}
            disabled={accepting}
          >
            {t('games.table.rematch.decline')}
          </ModalButton>
          <ModalButton onPress={onAccept} disabled={accepting}>
            {accepting
              ? t('games.table.rematch.joining')
              : t('games.table.rematch.accept')}
          </ModalButton>
        </ModalActions>

        <BlockOptions>
          {onBlockRematch && roomId && (
            <BlockLink
              onPress={() => onBlockRematch(roomId)}
              disabled={accepting}
            >
              <Text textDecorationLine="underline">
                {t('games.table.rematch.blockThisRematch')}
              </Text>
            </BlockLink>
          )}
          {onBlockUser && hostId && (
            <BlockLink onPress={() => onBlockUser(hostId)} disabled={accepting}>
              <Text textDecorationLine="underline">
                {t('games.table.rematch.blockInvitations')}
              </Text>
            </BlockLink>
          )}
        </BlockOptions>
      </ModalContent>
    </Modal>
  );
}
