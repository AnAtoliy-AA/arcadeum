'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Button, Spinner } from '@arcadeum/ui';
import { DialogShell } from '@/features/shop/ui/dialogShell';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { apiClient } from '@/shared/lib/api-client';
import {
  sendGiftAction,
  type ShopActionError,
} from '@/features/shop/server/shop.actions';
import type { InventoryItemView } from '@/features/shop/server/shop.types';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatarId: string | null;
}

export function GiftDialog({
  open,
  onClose,
  recipientId,
  recipientName,
  recipientAvatarId,
}: GiftDialogProps) {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<InventoryItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<ShopActionError | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !snapshot.accessToken) return;
    let cancelled = false;

    apiClient
      .get<{ items: InventoryItemView[] }>('/shop/inventory', {
        token: snapshot.accessToken,
      })
      .then((data) => {
        if (!cancelled) {
          setInventory(
            (data.items ?? []).filter(
              (item) => item.acquiredVia !== 'starter' && item.soldAt === null,
            ),
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, snapshot.accessToken]);

  const handleSend = useCallback(() => {
    if (!selectedItem || !message.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendGiftAction({
        recipientId,
        itemId: selectedItem,
        message: message.trim(),
      });
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        setError(result.error);
      }
    });
  }, [selectedItem, message, recipientId, onClose]);

  const errorMessages: Record<string, string> = {
    not_friends: t('pages.friends.gift.error.notFriends'),
    cannot_gift_self: t('pages.friends.gift.error.cannotGiftSelf'),
    starter_not_gift: t('pages.friends.gift.error.starterNotGift'),
    not_owned: t('pages.friends.gift.error.notOwned'),
    unknown_item: t('pages.friends.gift.error.unknownItem'),
  };

  if (!open) return null;

  return (
    <DialogShell open onClose={onClose} testId="gift-dialog">
      <div
        className="flex flex-col items-stretch gap-3"
        style={{ minWidth: 320 }}
      >
        <span className="text-[20px] font-bold">
          {t('pages.friends.gift.title')}
        </span>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--backgroundHover)]">
          <EquippedPlayerAvatar
            name={recipientName}
            equippedAvatarId={recipientAvatarId}
            equippedBadgeId={null}
            size="sm"
          />
          <span className="text-[14px]">To: {recipientName}</span>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <span className="text-[16px] font-bold text-[var(--success)]">
              {t('pages.friends.gift.success')}
            </span>
          </div>
        ) : loading ? (
          <div className="flex justify-center p-4">
            <Spinner size="sm" />
          </div>
        ) : inventory.length === 0 ? (
          <span className="text-[14px] text-[var(--textSecondary)] p-2 text-center">
            {t('pages.friends.gift.empty')}
          </span>
        ) : (
          <>
            <span className="text-[14px] text-[var(--color)]">
              {t('pages.friends.gift.selectItem')}
            </span>
            <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
              {inventory.map((item) => (
                <button
                  key={item.rowId}
                  type="button"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                    selectedItem === item.itemId
                      ? 'bg-[var(--primary)] bg-opacity-20 border border-[var(--primary)]'
                      : 'hover:bg-[var(--glassBg)] border border-transparent'
                  }`}
                  onClick={() => setSelectedItem(item.itemId)}
                  data-testid={`gift-item-${item.itemId}`}
                >
                  <span className="text-[13px] font-medium flex-1 truncate">
                    {item.itemId}
                  </span>
                  <span className="text-[11px] text-[var(--textSecondary)]">
                    {item.acquiredVia}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[14px] text-[var(--color)]">
                {t('pages.friends.gift.messageLabel')}
              </span>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={280}
                placeholder={t('pages.friends.gift.messagePlaceholder')}
                aria-label={t('pages.friends.gift.messageLabel')}
                data-testid="gift-message-input"
                className="w-full px-2 py-1.5 rounded-lg bg-[var(--backgroundFocus)] border border-[var(--borderColor)] text-[14px] text-[var(--color)] outline-none"
              />
            </div>

            {error && (
              <span className="text-[var(--danger)] text-[13px]">
                {errorMessages[error] || t('pages.friends.gift.error.generic')}
              </span>
            )}

            <div className="flex flex-row gap-2 justify-end -mt-1">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                {t('pages.friends.gift.cancel')}
              </Button>
              <Button
                onClick={handleSend}
                disabled={isPending || !selectedItem || !message.trim()}
                data-testid="gift-send-button"
              >
                {isPending ? (
                  <Spinner size="sm" />
                ) : (
                  t('pages.friends.gift.sendButton')
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DialogShell>
  );
}
