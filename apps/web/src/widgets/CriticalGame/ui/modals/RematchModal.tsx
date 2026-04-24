'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  YStack,
  XStack,
  Text,
  TextArea,
  Checkbox as TamaCheckbox,
  styled,
} from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';

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
  t: (key: string) => string;
  cardVariant?: string;
}

const ModalDescription = styled(Text, {
  name: 'ModalDescription',
  fontSize: '$3',
  marginBottom: '$4',
  opacity: 0.8,
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
  borderRadius: '$4',
  cursor: 'pointer',
  borderWidth: 1,

  variants: {
    selected: {
      true: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 0.5)',
      },
      false: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  } as const,

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const PlayerName = styled(Text, {
  name: 'PlayerName',
  fontSize: '$4',
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
  opacity: 0.6,
});

const StyledMessageInput = styled(TextArea, {
  name: 'MessageInput',
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '$4',
  color: '$color',
  minHeight: 80,
  fontSize: '$3',
  marginBottom: '$4',

  focusStyle: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default function RematchModal({
  isOpen,
  players,
  currentUserId,
  rematchLoading,
  onClose,
  onConfirm,
  t,
  cardVariant,
}: RematchModalProps) {
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

  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(Array.from(selectedPlayers), message);
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalTitle $variant={cardVariant as GameVariant}>
          {t('games.table.rematch.modalTitle')}
        </ModalTitle>
        <ModalDescription>
          {t('games.table.rematch.modalDescription')}
        </ModalDescription>

        <PlayerList>
          {otherPlayers.map((player) => (
            <PlayerItem
              key={player.playerId}
              onClick={() => togglePlayer(player.playerId)}
              selected={selectedPlayers.has(player.playerId)}
            >
              <TamaCheckbox
                id={player.playerId}
                size="$4"
                checked={selectedPlayers.has(player.playerId)}
                onCheckedChange={() => togglePlayer(player.playerId)}
              >
                <TamaCheckbox.Indicator>
                  <Text color="#6366f1">✓</Text>
                </TamaCheckbox.Indicator>
              </TamaCheckbox>
              <PlayerName>
                {player.displayName}
                {!player.alive && <EliminatedBadge ml="$2">💀</EliminatedBadge>}
              </PlayerName>
            </PlayerItem>
          ))}
          {otherPlayers.length === 0 && (
            <EmptyMessage>{t('games.table.rematch.noPlayers')}</EmptyMessage>
          )}
        </PlayerList>
        <StyledMessageInput
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
    </Modal>
  );
}
