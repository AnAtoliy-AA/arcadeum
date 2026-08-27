'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
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
  const [priceCurrency, setPriceCurrency] = useState<
    'coins' | 'gems' | 'arcadeum'
  >(item?.priceCurrency ?? 'coins');
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
      <div className="flex flex-col items-stretch gap-3">
        <span className="text-[24px] font-bold">
          {labels.editDialog.title.replace('{itemId}', item.id)}
        </span>

        <div className="flex flex-row gap-2 items-center">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            aria-label={labels.editDialog.available}
            data-testid="admin-shop-edit-available"
          />
          <span className="text-[16px]">{labels.editDialog.available}</span>
        </div>

        <div className="flex flex-col items-stretch gap-1">
          <span className="text-[14px] text-[var(--color)]">
            {labels.editDialog.priceAmount}
          </span>
          <input
            type="number"
            min={0}
            max={1_000_000}
            step={1}
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            data-testid="admin-shop-edit-price-amount"
            className="py-2 px-2.5 bg-[var(--backgroundFocus)] border border-[var(--borderColor)] rounded-md text-inherit text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="flex flex-col items-stretch gap-1">
          <span className="text-[14px] text-[var(--color)]">
            {labels.editDialog.priceCurrency}
          </span>
          <select
            value={priceCurrency}
            onChange={(e) =>
              setPriceCurrency(e.target.value as 'coins' | 'gems' | 'arcadeum')
            }
            data-testid="admin-shop-edit-price-currency"
            className="py-2 px-2.5 bg-[var(--backgroundFocus)] border border-[var(--borderColor)] rounded-md text-inherit text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="coins">coins</option>
            <option value="gems">gems</option>
            <option value="arcadeum">arcadeum</option>
          </select>
        </div>

        {error ? (
          <span
            className="text-[var(--danger)] text-[14px]"
            data-testid="admin-shop-edit-error"
          >
            {error}
          </span>
        ) : null}

        <div className="flex flex-row items-stretch gap-3 justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isPending}>
            {labels.editDialog.reset}
          </Button>
          <div className="flex flex-row items-stretch gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              {labels.editDialog.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              data-testid="admin-shop-edit-save"
            >
              {labels.editDialog.save}
            </Button>
          </div>
        </div>
      </div>
    </DialogShell>
  );
}
