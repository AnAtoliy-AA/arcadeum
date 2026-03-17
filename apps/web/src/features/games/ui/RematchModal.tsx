'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { YStack, XStack, Text, TextArea, styled } from 'tamagui';
import { ModalButton } from '@arcadeum/ui';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
} from './SharedModalStyles';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface PlayerInfo {
  playerId: string;
  displayName: string;
  alive: boolean;
}

interface RematchModalProps {
  isOpen: boolean;
  players: PlayerInfo[];
  currentUserId: string | null;
  rematchLoading: boolean;
  onClose: () => void;
  onConfirm: (selectedPlayerIds: string[], message?: string) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  cardVariant?: string;
}

const ModalDescription = styled(Text, {
  name: 'ModalDescription',
  fontSize: '$3',
  color: '$textSecondary',
  marginBottom: '$4',
});

const PlayerList = styled(YStack, {
  name: 'PlayerList',
  gap: '$2',
  marginBottom: '$4',
});

const PlayerItem = styled(XStack, {
  name: 'PlayerItem',
  alignItems: 'center',
  gap: '$3',
  padding: '$3',
  borderRadius: 12,
  cursor: 'pointer',
  variants: {
    selected: {
      true: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
      },
      false: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  } as const,
  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const CheckboxCircle = styled(YStack, {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    selected: {
      true: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
      },
    },
  } as const,
});

const PlayerName = styled(Text, {
  name: 'PlayerName',
  fontSize: '$4',
  color: '$color',
  flex: 1,
});

const EliminatedBadge = styled(Text, {
  name: 'EliminatedBadge',
  fontSize: '$2',
});

const EmptyMessage = styled(Text, {
  name: 'EmptyMessage',
  padding: '$4',
  textAlign: 'center',
  color: '$textSecondary',
});

const MessageInput = styled(TextArea, {
  width: '100%',
  padding: '$3',
  marginBottom: '$4',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderRadius: 12,
  color: '$color',
  minHeight: 80,
  fontSize: '$3',
  focusStyle: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export function RematchModal({
  isOpen,
  players,
  currentUserId,
  rematchLoading,
  onClose,
  onConfirm,
  t,
  cardVariant,
}: RematchModalProps) {
  const [message, setMessage] = useState('');
  const otherPlayers = useMemo(
    () => players.filter((p) => p.playerId !== currentUserId),
    [players, currentUserId],
  );

  const [deselectedPlayers, setDeselectedPlayers] = useState<Set<string>>(
    () => new Set(),
  );

  const selectedPlayers = useMemo(
    () =>
      new Set(
        otherPlayers
          .map((p) => p.playerId)
          .filter((id) => !deselectedPlayers.has(id)),
      ),
    [otherPlayers, deselectedPlayers],
  );

  const togglePlayer = useCallback((playerId: string) => {
    setDeselectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selectedPlayers), message);
  }, [onConfirm, selectedPlayers, message]);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isOpen || !isClient) return null;

  return createPortal(
    <Modal open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <ModalContent $variant={cardVariant}>
        <ModalTitle>
          {t('games.table.rematch.title' as TranslationKey)}
        </ModalTitle>
        <ModalDescription>
          {t('games.table.rematch.description' as TranslationKey)}
        </ModalDescription>

        <PlayerList>
          {otherPlayers.map((player) => (
            <PlayerItem
              key={player.playerId}
              selected={selectedPlayers.has(player.playerId)}
              onClick={() => togglePlayer(player.playerId)}
            >
              <CheckboxCircle selected={selectedPlayers.has(player.playerId)}>
                {selectedPlayers.has(player.playerId) && (
                  <Text color="white" fontSize={12}>
                    ✓
                  </Text>
                )}
              </CheckboxCircle>
              <PlayerName>
                {player.displayName}
                {!player.alive && <EliminatedBadge>💀</EliminatedBadge>}
              </PlayerName>
            </PlayerItem>
          ))}
          {otherPlayers.length === 0 && (
            <EmptyMessage>{t('games.table.rematch.noPlayers')}</EmptyMessage>
          )}
        </PlayerList>

        <MessageInput
          placeholder={
            t('games.table.rematch.messagePlaceholder') || 'Enter a message...'
          }
          value={message}
          onChangeText={setMessage}
          disabled={rematchLoading}
        />

        <ModalActions>
          <ModalButton
            variant="secondary"
            onClick={onClose}
            disabled={rematchLoading}
          >
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton onClick={handleConfirm} disabled={rematchLoading}>
            {rematchLoading
              ? t('games.table.rematch.loading')
              : t('games.table.rematch.button')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>,
    document.body,
  );
}
