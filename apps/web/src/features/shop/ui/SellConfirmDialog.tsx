'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { DialogShell } from './dialogShell';
import { sellItemAction } from '../server/shop.actions';
import type { InventoryItemView } from '../server/shop.types';

export interface SellConfirmLabels {
  title: string;
  sell: string;
  cancel: string;
  refund: string;
  errors: {
    starterNotSellable: string;
    alreadySold: string;
    unequipFirst: string;
    generic: string;
  };
}

export interface SellConfirmDialogProps {
  inventoryItem: InventoryItemView | null;
  refundCoins: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  labels: SellConfirmLabels;
}

export function SellConfirmDialog({
  inventoryItem,
  refundCoins,
  open,
  onClose,
  onSuccess,
  labels,
}: SellConfirmDialogProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open || !inventoryItem) return null;

  const handleConfirm = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await sellItemAction(inventoryItem.purchaseId);
      if (result.ok) {
        router.refresh();
        onSuccess();
        onClose();
        return;
      }
      if (result.error === 'starter_not_sellable') {
        setErrorMsg(labels.errors.starterNotSellable);
      } else if (result.error === 'already_sold') {
        setErrorMsg(labels.errors.alreadySold);
      } else if (result.error === 'unequip_first') {
        setErrorMsg(labels.errors.unequipFirst);
      } else {
        setErrorMsg(labels.errors.generic);
      }
    });
  };

  return (
    <DialogShell open={open} onClose={onClose} testId="sell-confirm-dialog">
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700">
          {labels.title}
        </Text>
        <Text fontSize="$4">
          {labels.refund.replace('{amount}', formatNumber(refundCoins, locale))}
        </Text>
        {errorMsg ? (
          <Text color="$danger" fontSize="$2" data-testid="sell-error">
            {errorMsg}
          </Text>
        ) : null}
        <XStack gap="$3" justifyContent="flex-end">
          <Button variant="outline" onPress={onClose} disabled={isPending}>
            {labels.cancel}
          </Button>
          <Button
            onPress={handleConfirm}
            disabled={isPending}
            data-testid="sell-confirm-button"
          >
            {labels.sell.replace('{amount}', formatNumber(refundCoins, locale))}
          </Button>
        </XStack>
      </YStack>
    </DialogShell>
  );
}
