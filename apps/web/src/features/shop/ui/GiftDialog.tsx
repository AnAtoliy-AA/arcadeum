'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Button, Spinner } from '@arcadeum/ui';
import { DialogShell } from '@/features/shop/ui/dialogShell';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { apiClient } from '@/shared/lib/api-client';
import { formatNumber } from '@/shared/i18n/formatters';
import { useLanguage } from '@/shared/i18n';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';

import type {
  InventoryItemView,
  EffectiveShopItem,
} from '@/features/shop/server/shop.types';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar/EquippedPlayerAvatar';
import { loadCatalog } from '@/features/shop/lib/catalogCache';
import { AdminShopItemPreview } from '@/features/admin-shop/ui/AdminShopItemPreview';

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatarId: string | null;
}

interface CatalogGiftItem extends EffectiveShopItem {
  owned: boolean;
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
  const { locale } = useLanguage();
  const [items, setItems] = useState<CatalogGiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmPurchase, setConfirmPurchase] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !snapshot.accessToken) return;
    let cancelled = false;

    Promise.all([
      apiClient.get<{ items: InventoryItemView[] }>('/shop/inventory', {
        token: snapshot.accessToken,
      }),
      loadCatalog(),
    ])
      .then(([invData, catData]) => {
        if (!cancelled) {
          const ownedSet = new Set(
            (invData.items ?? [])
              .filter(
                (item) => item.acquiredVia !== 'starter' && item.soldAt === null,
              )
              .map((item) => item.itemId),
          );

          const catalogItems: CatalogGiftItem[] = catData
            .filter(
              (item) =>
                item.starter !== true &&
                item.purchasable !== false &&
                item.available,
            )
            .map((item) => ({
              ...item,
              owned: ownedSet.has(item.id),
            }));

          setItems(catalogItems);
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

  const selectedItemDef = items.find((i) => i.id === selectedItem);
  const isPurchasable = selectedItemDef && !selectedItemDef.owned;

  const handleSend = useCallback(() => {
    if (!selectedItem || !message.trim()) return;
    if (isPurchasable && !confirmPurchase) {
      setConfirmPurchase(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await apiClient.post(
          '/shop/gift',
          {
            recipientId,
            itemId: selectedItem,
            message: message.trim(),
          },
          { token: snapshot.accessToken ?? undefined },
        );
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } catch (err: unknown) {
        const errorKey = err instanceof Error ? err.message : 'generic';
        setError(errorKey);
        setConfirmPurchase(false);
      }
    });
  }, [
    selectedItem,
    message,
    recipientId,
    onClose,
    snapshot.accessToken,
    isPurchasable,
    confirmPurchase,
  ]);

  const handleCancel = useCallback(() => {
    if (confirmPurchase) {
      setConfirmPurchase(false);
    } else {
      onClose();
    }
  }, [confirmPurchase, onClose]);

  const errorMessages: Record<string, string> = {
    not_friends: t('pages.friends.gift.error.notFriends'),
    cannot_gift_self: t('pages.friends.gift.error.cannotGiftSelf'),
    starter_not_gift: t('pages.friends.gift.error.starterNotGift'),
    not_owned: t('pages.friends.gift.error.notOwned'),
    unknown_item: t('pages.friends.gift.error.unknownItem'),
    insufficient_funds: t('pages.friends.gift.error.insufficientFunds'),
    unavailable: t('pages.friends.gift.error.unavailable'),
  };

  if (!open) return null;

  return (
    <DialogShell open onClose={onClose} testId="gift-dialog">
      <div className="flex flex-col items-stretch gap-3 min-w-[320px]">
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
        ) : items.length === 0 ? (
          <span className="text-[14px] text-[var(--textSecondary)] p-2 text-center">
            {t('pages.friends.gift.empty')}
          </span>
        ) : (
          <>
            <span className="text-[14px] text-[var(--color)]">
              {t('pages.friends.gift.selectItem')}
            </span>
            <div className="flex flex-col gap-1 max-h-[220px] overflow-auto">
              {items.map((item) => {
                const translatedName = item.nameKey
                  ? t(`pages.shop.${item.nameKey}` as TranslationKey)
                  : undefined;
                const itemName =
                  translatedName && !translatedName.startsWith('pages.shop.')
                    ? translatedName
                    : item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                      selectedItem === item.id
                        ? 'bg-[var(--primary)] bg-opacity-20 border border-[var(--primary)]'
                        : 'hover:bg-[var(--glassBg)] border border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedItem(item.id);
                      setConfirmPurchase(false);
                    }}
                    data-testid={`gift-item-${item.id}`}
                  >
                    <AdminShopItemPreview
                      item={item}
                      size={32}
                      colorValue={item.colorValue}
                      assetUrl={item.assetUrl}
                      itemId={item.id}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold truncate text-[var(--colorText)]">
                        {itemName}
                      </span>
                      <span className="text-[11px] text-[var(--textSecondary)] flex items-center gap-1.5">
                        <code className="font-mono">{item.id}</code>
                        <span>•</span>
                        <span className="capitalize">{item.category}</span>
                        {item.owned ? (
                          <span className="text-[var(--success)]">• Owned</span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <span>{CURRENCY_GLYPH[item.priceCurrency]}</span>
                            <span
                              className={CURRENCY_COLOR[item.priceCurrency]}
                            >
                              {formatNumber(item.priceAmount, locale)}
                            </span>
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
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

            {isPurchasable && confirmPurchase && selectedItemDef && (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--backgroundHover)] border border-[var(--warning)]">
                <span className="text-[14px] font-semibold text-[var(--color)]">
                  Buy & Gift
                </span>
                <span className="text-[13px] text-[var(--textSecondary)]">
                  This will deduct{' '}
                  <span className="font-semibold">
                    {CURRENCY_GLYPH[selectedItemDef.priceCurrency]}{' '}
                    {formatNumber(selectedItemDef.priceAmount, locale)}{' '}
                    {selectedItemDef.priceCurrency}
                  </span>{' '}
                  from your balance and send the item to {recipientName}.
                </span>
              </div>
            )}

            {error && (
              <span className="text-[var(--danger)] text-[13px]">
                {errorMessages[error] ||
                  t('pages.friends.gift.error.generic')}
              </span>
            )}

            <div className="flex flex-row gap-2 justify-end -mt-1">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                {confirmPurchase
                  ? t('pages.friends.gift.cancel')
                  : t('pages.friends.gift.cancel')}
              </Button>
              <Button
                onClick={handleSend}
                disabled={isPending || !selectedItem || !message.trim()}
                data-testid="gift-send-button"
              >
                {isPending ? (
                  <Spinner size="sm" />
                ) : confirmPurchase ? (
                  t('pages.friends.gift.confirmBuyAndGift')
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
