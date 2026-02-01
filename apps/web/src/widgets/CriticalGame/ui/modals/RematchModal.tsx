'use client';

import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';

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
  // Filter to other players (not current user)
  const otherPlayers = useMemo(
    () => players.filter((p) => p.playerId !== currentUserId),
    [players, currentUserId],
  );

  // Track deselected players instead of selected to avoid useState in effects
  // By default all players are selected, we only track who was deselected
  const [deselectedPlayers, setDeselectedPlayers] = useState<Set<string>>(
    () => new Set(),
  );

  // Derive selected players from otherPlayers minus deselected
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

  // Add message state
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(Array.from(selectedPlayers), message);
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalTitle $variant={cardVariant}>
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
              $selected={selectedPlayers.has(player.playerId)}
            >
              <Checkbox
                type="checkbox"
                checked={selectedPlayers.has(player.playerId)}
                onChange={() => togglePlayer(player.playerId)}
              />
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
          onChange={(e) => setMessage(e.target.value)}
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

const MessageInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.text.primary};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ModalDescription = styled.p`
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const PlayerItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background: ${({ $selected }) =>
    $selected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid
    ${({ $selected }) =>
      $selected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const PlayerName = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EliminatedBadge = styled.span`
  font-size: 0.8rem;
`;

const EmptyMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text.secondary};
`;
