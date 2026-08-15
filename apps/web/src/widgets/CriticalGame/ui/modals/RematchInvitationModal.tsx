'use client';

import { cx } from '@arcadeum/ui/utils/cx';
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

export default function RematchInvitationModal({
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
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        variant={cardVariant as GameVariant}
      >
        <ModalTitle variant={cardVariant as GameVariant}>
          {t('games.table.rematch.invitationTitle')}
        </ModalTitle>
        <div className="mb-6 text-[18px] opacity-[0.8]">
          {hostName} {t('games.table.rematch.invitationDescription')}
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-[rgba(255,255,255,0.05)] p-4">
            <div className="mb-1 text-[14px] uppercase tracking-[1px] opacity-[0.6]">
              {t('games.table.rematch.message')}:
            </div>
            <div className="text-[18px] italic whitespace-pre-wrap">
              {message}
            </div>
          </div>
        )}

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
            {t('games.table.rematch.toDecide')}
          </span>
        </div>

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

        <div className="mt-4 flex flex-col items-center gap-1">
          {onBlockRematch && roomId && (
            <button
              type="button"
              className="mt-4 cursor-pointer p-2 text-[16px] underline hover:text-[#ef4444] disabled:cursor-default disabled:opacity-[0.5]"
              onClick={() => onBlockRematch(roomId)}
              disabled={accepting}
            >
              <span className="underline">
                {t('games.table.rematch.blockThisRematch')}
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
                {t('games.table.rematch.blockInvitations')}
              </span>
            </button>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
