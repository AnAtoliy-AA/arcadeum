'use client';

import { useSyncExternalStore } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ModalButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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
  message?: string;
  onAccept: () => void;
  onDecline: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const TitleText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <ModalTitle className={cx('text-center mb-4', className)} {...props}>
    {children}
  </ModalTitle>
);

const MessageText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cx(
      'text-[16px] leading-[24px] text-center mb-6 text-[rgba(255,255,255,0.8)]',
      className,
    )}
    {...props}
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
      <ModalContent>
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
          <div className="flex flex-col items-stretch self-stretch -mb-5 p-3 rounded-xl border border-[rgba(255,_255,_255,_0.12)] bg-[rgba(255,_255,_255,_0.04)]">
            <span className="text-[16px] leading-[20px] text-[rgba(255,_255,_255,_0.9)] italic">
              “{message}”
            </span>
          </div>
        ) : null}

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
