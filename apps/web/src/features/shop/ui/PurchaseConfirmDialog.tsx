'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n';
import { formatNumber } from '@/shared/i18n/formatters';
import { DialogShell } from './dialogShell';
import { purchaseItemAction } from '../server/shop.actions';
import { syncEquippedToSession } from '../lib/syncEquippedToSession';
import type {
  EffectiveShopItem,
  WalletBalanceView,
} from '../server/shop.types';

function uuid(): string {
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
  signIn?: string;
  errors: {
    insufficientFunds: string;
    unavailable: string;
    generic: string;
    unauthorized?: string;
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
  isAuthenticated?: boolean;
}

export function PurchaseConfirmDialog(
  props: PurchaseConfirmDialogProps,
): React.JSX.Element | null {
  if (!props.open || !props.item) return null;
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
      isAuthenticated={props.isAuthenticated}
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
  isAuthenticated = true,
}: PurchaseConfirmDialogProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const purchaseIdRef = useRef<string>(uuid());

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUnauthorized, setIsUnauthorized] = useState(!isAuthenticated);

  if (!item) return null;

  const { coins: coinBalance, gems: gemBalance } = balance;
  const balanceForCurrency =
    item.priceCurrency === 'coins' ? coinBalance : gemBalance;
  const hasFunds = balanceForCurrency >= item.priceAmount;

  const handleConfirm = () => {
    if (!isAuthenticated || isUnauthorized) {
      setErrorMsg(
        labels.errors.unauthorized ?? 'Please sign in to complete purchase.',
      );
      setIsUnauthorized(true);
      return;
    }
    if (!hasFunds) {
      setErrorMsg(labels.errors.insufficientFunds);
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const result = await purchaseItemAction(item.id, purchaseIdRef.current);
      if (result.ok) {
        syncEquippedToSession(result.data.equipped);
        setSucceeded(true);
        router.refresh();
        onSuccess();
        return;
      }
      if (result.error === 'unauthorized') {
        setErrorMsg(
          labels.errors.unauthorized ?? 'Please sign in to complete purchase.',
        );
        setIsUnauthorized(true);
      } else if (result.error === 'insufficient_funds') {
        setErrorMsg(labels.errors.insufficientFunds);
      } else if (result.error === 'unavailable') {
        setErrorMsg(labels.errors.unavailable);
      } else if (result.message && !result.message.startsWith('shop.')) {
        setErrorMsg(result.message);
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
        {!isAuthenticated || isUnauthorized ? (
          <Typography
            color="var(--danger)"
            uiSize="sm"
            data-testid="purchase-unauthorized-message"
          >
            {errorMsg ??
              labels.errors.unauthorized ??
              'Please sign in to complete purchase.'}
          </Typography>
        ) : errorMsg ? (
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
          {!isAuthenticated || isUnauthorized ? (
            <Link href="/auth">
              <Button variant="primary" data-testid="purchase-signin-button">
                {labels.signIn ?? 'Sign In'}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!hasFunds || isPending}
              data-testid="purchase-confirm-button"
            >
              {labels.buy}
            </Button>
          )}
        </div>
      </div>
    </DialogShell>
  );
}
