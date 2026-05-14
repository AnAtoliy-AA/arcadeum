'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { DialogShell } from '@/features/shop/ui/dialogShell';
import { setShopOverrideAction } from '../server/admin-shop.actions';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';
import type { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';

type Labels = typeof adminShopEn;

interface Props {
  item: EffectiveShopItem | null;
  open: boolean;
  onClose: () => void;
  labels: Labels;
}

export function AdminShopEditDialog({ item, open, onClose, labels }: Props) {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean>(item?.available ?? true);
  const [priceAmount, setPriceAmount] = useState<string>(
    item ? String(item.priceAmount) : '',
  );
  const [priceCurrency, setPriceCurrency] = useState<'coins' | 'gems'>(
    item?.priceCurrency ?? 'coins',
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open || !item) return null;

  const handleSave = () => {
    setError(null);
    const parsed = priceAmount.trim() === '' ? null : Number(priceAmount);
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) {
      setError(labels.editDialog.error);
      return;
    }
    startTransition(async () => {
      const result = await setShopOverrideAction({
        itemId: item.id,
        available,
        priceAmount: parsed,
        priceCurrency,
      });
      if (result.ok) {
        router.refresh();
        onClose();
        return;
      }
      setError(labels.editDialog.error);
    });
  };

  const handleReset = () => {
    setError(null);
    startTransition(async () => {
      const result = await setShopOverrideAction({
        itemId: item.id,
        available: null,
        priceAmount: null,
        priceCurrency: null,
      });
      if (result.ok) {
        router.refresh();
        onClose();
        return;
      }
      setError(labels.editDialog.error);
    });
  };

  return (
    <DialogShell open={open} onClose={onClose} testId="admin-shop-edit-dialog">
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700">
          {labels.editDialog.title.replace('{itemId}', item.id)}
        </Text>

        <XStack gap="$2" alignItems="center">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            aria-label={labels.editDialog.available}
            data-testid="admin-shop-edit-available"
          />
          <Text fontSize="$3">{labels.editDialog.available}</Text>
        </XStack>

        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.editDialog.priceAmount}
          </Text>
          <input
            type="number"
            min={0}
            max={1_000_000}
            step={1}
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            data-testid="admin-shop-edit-price-amount"
            style={{
              padding: '8px 10px',
              background: 'var(--backgroundFocus)',
              border: '1px solid var(--borderColor)',
              borderRadius: 6,
              color: 'inherit',
              fontSize: 14,
            }}
          />
        </YStack>

        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.editDialog.priceCurrency}
          </Text>
          <select
            value={priceCurrency}
            onChange={(e) =>
              setPriceCurrency(e.target.value as 'coins' | 'gems')
            }
            data-testid="admin-shop-edit-price-currency"
            style={{
              padding: '8px 10px',
              background: 'var(--backgroundFocus)',
              border: '1px solid var(--borderColor)',
              borderRadius: 6,
              color: 'inherit',
              fontSize: 14,
            }}
          >
            <option value="coins">coins</option>
            <option value="gems">gems</option>
          </select>
        </YStack>

        {error ? (
          <Text
            color="$danger"
            fontSize="$2"
            data-testid="admin-shop-edit-error"
          >
            {error}
          </Text>
        ) : null}

        <XStack gap="$3" justifyContent="space-between">
          <Button variant="outline" onPress={handleReset} disabled={isPending}>
            {labels.editDialog.reset}
          </Button>
          <XStack gap="$2">
            <Button variant="outline" onPress={onClose} disabled={isPending}>
              {labels.editDialog.cancel}
            </Button>
            <Button
              onPress={handleSave}
              disabled={isPending}
              data-testid="admin-shop-edit-save"
            >
              {labels.editDialog.save}
            </Button>
          </XStack>
        </XStack>
      </YStack>
    </DialogShell>
  );
}
