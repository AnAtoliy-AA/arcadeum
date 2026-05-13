'use client';

import { useState } from 'react';
import { Button, Modal, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useSellBack } from '../hooks/useShopMutations';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const sellBack = useSellBack();

  if (!open || !inventoryItem) return null;

  const handleConfirm = async () => {
    setErrorMsg(null);
    const result = await sellBack.mutateAsync({
      purchaseId: inventoryItem.purchaseId,
    });
    if (result.ok) {
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <YStack gap="$3" padding="$4" data-testid="sell-confirm-dialog">
        <Text fontSize="$6" fontWeight="700">
          {labels.title}
        </Text>
        <Text fontSize="$4">
          {labels.refund.replace('{amount}', refundCoins.toLocaleString())}
        </Text>
        {errorMsg ? (
          <Text color="$danger" fontSize="$2" data-testid="sell-error">
            {errorMsg}
          </Text>
        ) : null}
        <XStack gap="$3" justifyContent="flex-end">
          <Button
            variant="ghost"
            onPress={onClose}
            disabled={sellBack.isPending}
          >
            {labels.cancel}
          </Button>
          <Button
            onPress={handleConfirm}
            disabled={sellBack.isPending}
            data-testid="sell-confirm-button"
          >
            {labels.sell}
          </Button>
        </XStack>
      </YStack>
    </Modal>
  );
}
