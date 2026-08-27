'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ModalButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { Modal, ModalContent, ModalTitle, ModalActions } from './SharedModal';
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
  rematchError?: string | null;
  onClose: () => void;
  onConfirm: (selectedPlayerIds: string[], message?: string) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  cardVariant?: string;
}

const ModalDescription = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx('text-[16px] text-[var(--textSecondary)] mb-4', className)}
  >
    {children}
  </span>
);

const PlayerList = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-col items-stretch gap-2 mb-4', className)}>
    {children}
  </div>
);

const PlayerItem = ({
  selected = false,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}) => (
  <div
    onClick={onClick}
    className={cx(
      'flex flex-row items-center gap-3 p-3 rounded-[12px] cursor-pointer border transition-colors hover:bg-[rgba(255,255,255,0.1)]',
      selected
        ? 'bg-[rgba(99,102,241,0.2)] border-[rgba(99,102,241,0.5)]'
        : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]',
    )}
  >
    {children}
  </div>
);

const CheckboxCircle = ({
  selected = false,
  children,
}: {
  selected?: boolean;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'w-[20px] h-[20px] rounded-[10px] border-2 border-[rgba(255,255,255,0.3)] flex items-center justify-center shrink-0',
      selected && 'bg-[#6366f1] border-[#6366f1]',
    )}
  >
    {children}
  </div>
);

const PlayerName = ({ children }: { children?: ReactNode }) => (
  <span className={cx('text-[16px] text-[var(--color)] flex-1')}>
    {children}
  </span>
);

const EliminatedBadge = ({ children }: { children?: ReactNode }) => (
  <span className={cx('text-[14px] ml-1')}>{children}</span>
);

const EmptyMessage = ({ children }: { children?: ReactNode }) => (
  <span className={cx('p-4 text-center text-[var(--textSecondary)]')}>
    {children}
  </span>
);

const MessageInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <textarea
    className={cx(
      'w-full p-3 mb-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] text-[var(--color)] min-h-[80px] text-[16px] outline-none transition-colors placeholder:text-[#8e9196] focus:border-[#6366f1] focus:bg-[rgba(255,255,255,0.08)]',
    )}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
  />
);

export function RematchModal({
  isOpen,
  players,
  currentUserId,
  rematchLoading,
  rematchError,
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

  return (
    <Modal open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <ModalContent variant={cardVariant}>
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
                  <span className="text-[white] text-[12px]">✓</span>
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
          onChange={(e) => setMessage(e.target.value)}
          disabled={rematchLoading}
        />

        {rematchError && (
          <span className="text-[#dc2626] text-[16px] text-center -mb-3">
            {rematchError}
          </span>
        )}

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
