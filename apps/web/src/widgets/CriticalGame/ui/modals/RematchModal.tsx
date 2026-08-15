'use client';

import { useState, useMemo, useCallback } from 'react';
import { TextArea } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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

function ModalDescription({ children }: { children?: React.ReactNode }) {
  return (
    <div className="box-border text-[16px] leading-[20px] opacity-[0.8] mb-4">
      {children}
    </div>
  );
}

function PlayerList({ children }: { children?: React.ReactNode }) {
  return (
    <div className="box-border flex flex-col items-stretch gap-2 mb-4">
      {children}
    </div>
  );
}

function PlayerItem({
  selected,
  className,
  ...props
}: {
  selected?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:bg-[rgba(255,255,255,0.1)]',
        selected
          ? 'bg-[rgba(99,102,241,0.2)] border-[rgba(99,102,241,0.5)]'
          : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]',
        className,
      )}
      {...props}
    />
  );
}

function PlayerName({ children }: { children?: React.ReactNode }) {
  return (
    <span className="box-border flex-1 text-[18px] leading-[24px]">
      {children}
    </span>
  );
}

function EliminatedBadge({ children }: { children?: React.ReactNode }) {
  return (
    <span className="box-border text-[14px] leading-[18px] ml-2">
      {children}
    </span>
  );
}

function EmptyMessage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="box-border text-center p-4 opacity-[0.6]">{children}</div>
  );
}

function StyledMessageInput(props: React.ComponentProps<typeof TextArea>) {
  return (
    <TextArea
      {...props}
      className={cx(
        'box-border w-full min-h-[80px] text-[16px] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] mb-4 text-[var(--color)] focus:border-[#6366f1] focus:bg-[rgba(255,255,255,0.08)]',
        props.className,
      )}
    />
  );
}

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
              <input
                type="checkbox"
                id={player.playerId}
                checked={selectedPlayers.has(player.playerId)}
                onChange={() => togglePlayer(player.playerId)}
                aria-label={player.displayName}
                className="box-border w-4 h-4 cursor-pointer accent-[#6366f1]"
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
