'use client';

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ModalButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { Modal, ModalContent, ModalTitle, ModalActions } from './SharedModal';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface RematchInvitationModalProps {
  isOpen: boolean;
  senderName: string;
  message?: string;
  onAccept: () => void;
  onDecline: () => void;
  hostId?: string;
  roomId?: string;
  timeLeft?: number;
  onBlockRematch?: (roomId: string) => void;
  onBlockUser?: (hostId: string) => void;
  accepting?: boolean;
  cardVariant?: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const TitleText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <ModalTitle className={cx('text-center mb-4', className)}>
    {children}
  </ModalTitle>
);

const MessageText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <p
    className={cx(
      'text-[16px] leading-[24px] text-center mb-6 text-[var(--color)] opacity-80',
      className,
    )}
  >
    {children}
  </p>
);

export function RematchInvitationModal({
  isOpen,
  senderName,
  message,
  onAccept,
  onDecline,
  hostId,
  roomId,
  timeLeft,
  onBlockRematch,
  onBlockUser,
  accepting = false,
  cardVariant,
  t,
}: RematchInvitationModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isOpen || !isClient) return null;

  return (
    <Modal open={isOpen} onOpenChange={(val) => !val && onDecline()}>
      <ModalContent variant={cardVariant}>
        <div className="flex flex-col items-center -mb-4">
          <span className="text-[60px]">🔄</span>
        </div>

        <TitleText>
          {t('games.table.rematch.invitation.title' as TranslationKey)}
        </TitleText>

        <MessageText>
          {t('games.table.rematch.invitation.message' as TranslationKey, {
            name: senderName,
          })}
        </MessageText>

        {message && message.trim().length > 0 ? (
          <div className="flex flex-col items-stretch self-stretch -mb-5 p-3 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBgHover)]">
            <span className="text-[16px] leading-[20px] text-[var(--color)] opacity-90 italic">
              “{message}”
            </span>
          </div>
        ) : null}

        {typeof timeLeft === 'number' && (
          <div className="mb-8 flex flex-col items-center gap-1">
            <span
              className={cx(
                'text-[40px] font-bold',
                timeLeft <= 10 ? 'text-[#ef4444]' : 'text-[#6366f1]',
              )}
            >
              {timeLeft}s
            </span>
            <span className="text-[16px] opacity-[0.6]">
              {t('games.table.rematch.toDecide' as TranslationKey)}
            </span>
          </div>
        )}

        <ModalActions>
          <ModalButton
            variant="secondary"
            onClick={onDecline}
            disabled={accepting}
            data-testid="decline-rematch-button"
          >
            {t('games.table.rematch.invitation.decline' as TranslationKey)}
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={onAccept}
            disabled={accepting}
            data-testid="accept-rematch-button"
          >
            {accepting
              ? t('games.table.rematch.joining' as TranslationKey)
              : t('games.table.rematch.invitation.accept' as TranslationKey)}
          </ModalButton>
        </ModalActions>

        {(onBlockRematch || onBlockUser) && (
          <div className="mt-4 flex flex-col items-center gap-1">
            {onBlockRematch && roomId && (
              <button
                type="button"
                className="mt-4 cursor-pointer p-2 text-[16px] underline hover:text-[#ef4444] disabled:cursor-default disabled:opacity-[0.5]"
                onClick={() => onBlockRematch(roomId)}
                disabled={accepting}
              >
                <span className="underline">
                  {t('games.table.rematch.blockThisRematch' as TranslationKey)}
                </span>
              </button>
            )}
            {onBlockUser && hostId && (
              <button
                type="button"
                className="mt-4 cursor-pointer p-2 text-[16px] underline hover:text-[#ef4444] disabled:cursor-default disabled:opacity-[0.5]"
                onClick={() => onBlockUser(hostId)}
                disabled={accepting}
              >
                <span className="underline">
                  {t('games.table.rematch.blockInvitations' as TranslationKey)}
                </span>
              </button>
            )}
          </div>
        )}

        <ModalButton
          className="flex-1 mt-4 p-2"
          variant="ghost"
          onClick={onDecline}
        >
          {t('games.table.modals.common.close' as TranslationKey)}
        </ModalButton>
      </ModalContent>
    </Modal>
  );
}
