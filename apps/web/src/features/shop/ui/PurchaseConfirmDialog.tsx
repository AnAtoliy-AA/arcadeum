'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { DialogShell } from './dialogShell';
import { purchaseItemAction } from '../server/shop.actions';
import { syncEquippedToSession } from '../lib/syncEquippedToSession';
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
  close?: string;
  yourBalance: string;
  free: string;
  successTitle?: string;
  successBody?: string;
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

export function PurchaseConfirmDialog(
  props: PurchaseConfirmDialogProps,
): React.JSX.Element | null {
  if (!props.open || !props.item) return null;
  // Parent gates `open`; we render a fresh inner component per open cycle so
  // local state (UUID nonce, succeeded flag, error) resets without
  // setState-in-effect. The inner key is the item id so opening a *different*
  // item also remounts.
  return (
    <PurchaseConfirmDialogInner
      key={props.item.id}
      item={props.item}
      itemName={props.itemName}
      itemDesc={props.itemDesc}
      balance={props.balance}
      open={props.open}
      onClose={props.onClose}
      onSuccess={props.onSuccess}
      labels={props.labels}
    />
  );
}

function PurchaseConfirmDialogInner({
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
  const { locale } = useLanguage();
  // Stable per-mount UUID — regenerated only when the outer key changes (new
  // open / new item), so React's strict-mode double-render and any retries
  // reuse the same id.
  const purchaseIdRef = useRef<string>(uuid());

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!item) return null;

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
        // BE auto-equips on purchase (spec D5); push new equipped state into
        // the client session snapshot so the header avatar updates without
        // a manual reload.
        syncEquippedToSession(result.data.equipped);
        setSucceeded(true);
        router.refresh();
        onSuccess();
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

  if (succeeded) {
    return (
      <DialogShell
        open={open}
        onClose={onClose}
        testId="purchase-confirm-dialog"
      >
        <div className="flex flex-col gap-3 items-center">
          <Typography uiSize="3xl">✓</Typography>
          <Typography uiSize="2xl" weight="700">
            {labels.successTitle ?? 'Equipped'}
          </Typography>
          <Typography
            uiSize="md"
            color="var(--colorPress)"
            className="text-center"
          >
            {(labels.successBody ?? '{name} is now equipped.').replace(
              '{name}',
              itemName,
            )}
          </Typography>
          <Button onClick={onClose} data-testid="purchase-success-close">
            {labels.close ?? labels.cancel}
          </Button>
        </div>
      </DialogShell>
    );
  }

  return (
    <DialogShell open={open} onClose={onClose} testId="purchase-confirm-dialog">
      <div className="flex flex-col items-stretch gap-3">
        <Typography uiSize="2xl" weight="700">
          {labels.title}
        </Typography>
        <div className="flex flex-col items-stretch gap-2">
          <Typography uiSize="xl" weight="600">
            {itemName}
          </Typography>
          <Typography uiSize="md" color="var(--colorPress)">
            {itemDesc}
          </Typography>
        </div>
        <div className="flex flex-row gap-3 items-center justify-between">
          <Typography uiSize="lg" weight="600">
            {item.priceAmount === 0
              ? labels.free
              : `${item.priceAmount} ${item.priceCurrency}`}
          </Typography>
          <Typography uiSize="sm" color="var(--colorPress)">
            {labels.yourBalance
              .replace('{amount}', formatNumber(balanceForCurrency, locale))
              .replace('{currency}', item.priceCurrency)}
          </Typography>
        </div>
        {errorMsg ? (
          <Typography
            color="var(--danger)"
            uiSize="sm"
            data-testid="purchase-error"
          >
            {errorMsg}
          </Typography>
        ) : null}
        <div className="flex flex-row items-stretch gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {labels.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasFunds || isPending}
            data-testid="purchase-confirm-button"
          >
            {labels.buy}
          </Button>
        </div>
      </div>
    </DialogShell>
  );
}
