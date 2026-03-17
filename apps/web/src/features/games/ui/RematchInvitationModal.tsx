'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { YStack, Text, Paragraph, styled } from 'tamagui';
import { ModalButton } from '@arcadeum/ui';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
} from './SharedModalStyles';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface RematchInvitationModalProps {
  isOpen: boolean;
  senderName: string;
  onAccept: () => void;
  onDecline: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const TitleText = styled(ModalTitle, {
  name: 'InvitationTitle',
  textAlign: 'center',
  marginBottom: '$4',
});

const MessageText = styled(Paragraph, {
  name: 'InvitationMessage',
  fontSize: '$4',
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  lineHeight: '$4',
  marginBottom: '$6',
});

export function RematchInvitationModal({
  isOpen,
  senderName,
  onAccept,
  onDecline,
  t,
}: RematchInvitationModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isOpen || !isClient) return null;

  return createPortal(
    <Modal open={isOpen} onOpenChange={(val) => !val && onDecline()}>
      <ModalContent>
        <YStack alignItems="center" marginBottom="$4">
          <Text fontSize={60}>🔄</Text>
        </YStack>

        <TitleText>
          {t('games.table.rematch.invitation.title' as TranslationKey)}
        </TitleText>

        <MessageText>
          {t('games.table.rematch.invitation.message' as TranslationKey, {
            name: senderName,
          })}
        </MessageText>

        <ModalActions>
          <ModalButton
            variant="secondary"
            onClick={onDecline}
            data-testid="decline-rematch-button"
          >
            {t('games.table.rematch.invitation.decline' as TranslationKey)}
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={onAccept}
            data-testid="accept-rematch-button"
          >
            {t('games.table.rematch.invitation.accept' as TranslationKey)}
          </ModalButton>
        </ModalActions>

        <ModalButton
          variant="ghost"
          onClick={onDecline}
          marginTop="$4"
          padding="$2"
        >
          {t('games.table.modals.common.close' as TranslationKey)}
        </ModalButton>
      </ModalContent>
    </Modal>,
    document.body,
  );
}
