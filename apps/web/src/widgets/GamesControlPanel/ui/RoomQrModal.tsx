'use client';

import { useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTimedTrue } from '@/shared/hooks/useTimedTrue';
import { buildInviteUrl } from './ShareGameMenu';

interface RoomQrModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  inviteCode?: string;
}

export function RoomQrModal({
  open,
  onClose,
  roomId,
  inviteCode,
}: RoomQrModalProps) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useTimedTrue(2000);

  const url = open ? buildInviteUrl(roomId, inviteCode) : '';

  const handleCopy = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied();
    } catch {}
  }, [url, setIsCopied]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={360} data-testid="room-qr-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.common.roomQr.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-4">
            {url ? (
              <div className="rounded-[16px] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                <QRCodeSVG
                  value={url}
                  size={208}
                  marginSize={0}
                  level="M"
                  data-testid="room-qr-svg"
                />
              </div>
            ) : null}
            <p className="text-center text-[13px] text-[var(--color)] opacity-70">
              {t('games.common.roomQr.hint')}
            </p>
            <p
              className="w-full max-w-[280px] truncate rounded-[8px] bg-[var(--glassBg)] border border-[var(--glassBorder)] px-3 py-2 text-center text-[12px] text-[var(--color)]"
              title={url}
              data-testid="room-qr-url"
            >
              {url}
            </p>
            <Button
              variant="glass"
              size="sm"
              onClick={() => void handleCopy()}
              data-testid="room-qr-copy"
            >
              🔗{' '}
              {isCopied
                ? t('games.common.shareVia.copied')
                : t('games.common.shareVia.copyLink')}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
