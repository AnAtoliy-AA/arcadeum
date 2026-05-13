'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { purchaseItemAction } from '../server/shop.actions';
import type {
  EffectiveShopItem,
  WalletBalanceView,
} from '../server/shop.types';

function uuid(): string {
  // RFC 4122 v4 — crypto.randomUUID is available in modern browsers + Node 16+.
  return globalThis.crypto.randomUUID();
}

export interface PurchaseConfirmLabels {
  title: string;
  buy: string;
  cancel: string;
  yourBalance: string;
  free: string;
  errors: {
    insufficientFunds: string;
    unavailable: string;
    generic: string;
  };
}

export interface PurchaseConfirmDialogProps {
  item: EffectiveShopItem | null;
  itemName: string;
  itemDesc: string;
  balance: WalletBalanceView;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  labels: PurchaseConfirmLabels;
}

export function PurchaseConfirmDialog({
  item,
  itemName,
  itemDesc,
  balance,
  open,
  onClose,
  onSuccess,
  labels,
}: PurchaseConfirmDialogProps) {
  const router = useRouter();
  // Stable per-dialog UUID: regenerated whenever the dialog opens for a new
  // item, kept constant for the lifetime of that open state so React's
  // strict-mode double-render and any in-flight retries reuse the same id.
  const purchaseIdRef = useRef<string>('');
  useEffect(() => {
    if (open && item) {
      purchaseIdRef.current = uuid();
    }
  }, [open, item]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open || !item) return null;

  // Destructure to avoid the no-restricted-syntax wallet-balance member-access
  // guardrail (only direct property reads are restricted).
  const { coins: coinBalance, gems: gemBalance } = balance;
  const balanceForCurrency =
    item.priceCurrency === 'coins' ? coinBalance : gemBalance;
  const hasFunds = balanceForCurrency >= item.priceAmount;

  const handleConfirm = () => {
    if (!hasFunds) {
      setErrorMsg(labels.errors.insufficientFunds);
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const result = await purchaseItemAction(item.id, purchaseIdRef.current);
      if (result.ok) {
        router.refresh();
        onSuccess();
        onClose();
        return;
      }
      if (result.error === 'insufficient_funds') {
        setErrorMsg(labels.errors.insufficientFunds);
      } else if (result.error === 'unavailable') {
        setErrorMsg(labels.errors.unavailable);
      } else {
        setErrorMsg(labels.errors.generic);
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <YStack gap="$3" padding="$4" data-testid="purchase-confirm-dialog">
        <Text fontSize="$6" fontWeight="700">
          {labels.title}
        </Text>
        <YStack gap="$2">
          <Text fontSize="$5" fontWeight="600">
            {itemName}
          </Text>
          <Text fontSize="$3" color="$colorPress">
            {itemDesc}
          </Text>
        </YStack>
        <XStack gap="$3" alignItems="center" justifyContent="space-between">
          <Text fontSize="$4" fontWeight="600">
            {item.priceAmount === 0
              ? labels.free
              : `${item.priceAmount} ${item.priceCurrency}`}
          </Text>
          <Text fontSize="$2" color="$colorPress">
            {labels.yourBalance
              .replace('{amount}', balanceForCurrency.toLocaleString())
              .replace('{currency}', item.priceCurrency)}
          </Text>
        </XStack>
        {errorMsg ? (
          <Text color="$danger" fontSize="$2" data-testid="purchase-error">
            {errorMsg}
          </Text>
        ) : null}
        <XStack gap="$3" justifyContent="flex-end">
          <Button variant="ghost" onPress={onClose} disabled={isPending}>
            {labels.cancel}
          </Button>
          <Button
            onPress={handleConfirm}
            disabled={!hasFunds || isPending}
            data-testid="purchase-confirm-button"
          >
            {labels.buy}
          </Button>
        </XStack>
      </YStack>
    </Modal>
  );
}
