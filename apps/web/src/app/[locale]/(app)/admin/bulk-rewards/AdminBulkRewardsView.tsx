'use client';

import { useState, useTransition } from 'react';
import { Button, GlassCard, Input } from '@arcadeum/ui';
import { sendBulkRewardsAction } from '@/features/admin-bulk-rewards/server/admin-bulk-rewards.actions';
import type { BulkRewardResult } from '@/features/admin-bulk-rewards/server/admin-bulk-rewards.actions';
import type { adminBulkRewardsEn } from '@/shared/i18n/messages/pages/admin-bulk-rewards/en';

type Labels = typeof adminBulkRewardsEn;

interface Props {
  labels: Labels;
}

type RewardType = 'coins' | 'gems' | 'arcadeum' | 'item';

export function AdminBulkRewardsView({ labels }: Props) {
  const [rewardType, setRewardType] = useState<RewardType>('coins');
  const [amount, setAmount] = useState('');
  const [itemId, setItemId] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<BulkRewardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validate = (): boolean => {
    const numAmount = parseInt(amount, 10);
    if (!amount || isNaN(numAmount) || numAmount < 1 || numAmount > 1_000_000) {
      setError(labels.validation.invalidAmount);
      return false;
    }
    if (rewardType === 'item' && !itemId.trim()) {
      setError(labels.validation.itemIdRequired);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await sendBulkRewardsAction({
        type: rewardType,
        amount: parseInt(amount, 10),
        itemId: rewardType === 'item' ? itemId.trim() : undefined,
        reason: reason.trim() || undefined,
      });

      if (response.ok) {
        setResult(response.data);
      } else {
        setError(labels.result.failed);
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      {confirmOpen && (
        <GlassCard className="p-4 border border-[var(--warning)] bg-[rgba(146,64,14,0.1)]">
          <span className="font-semibold -mb-2">{labels.confirm.title}</span>
          <span className="-mb-4">
            {labels.confirm.message
              .replace('{amount}', amount)
              .replace('{type}', rewardType)}
          </span>
          <div className="flex flex-row items-stretch gap-2">
            <Button onClick={confirmSubmit}>{labels.confirm.confirm}</Button>
            <Button onClick={() => setConfirmOpen(false)} variant="outline">
              {labels.confirm.cancel}
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-col items-stretch gap-1">
          <span className="font-semibold">{labels.form.type.label}</span>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value as RewardType)}
            className="py-2 px-2.5 bg-[var(--backgroundFocus)] border border-[var(--borderColor)] rounded-md text-inherit text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="coins">{labels.form.type.coinsLabel}</option>
            <option value="gems">{labels.form.type.gemsLabel}</option>
            <option value="arcadeum">{labels.form.type.arcadeumLabel}</option>
            <option value="item">{labels.form.type.itemLabel}</option>
          </select>
        </div>

        <div className="flex flex-col items-stretch gap-1">
          <span className="font-semibold">{labels.form.amount.label}</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={labels.form.amount.placeholder}
            min={1}
            max={1000000}
          />
        </div>

        {rewardType === 'item' && (
          <div className="flex flex-col items-stretch gap-1">
            <span className="font-semibold">{labels.form.itemId.label}</span>
            <Input
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder={labels.form.itemId.placeholder}
            />
          </div>
        )}

        <div className="flex flex-col items-stretch gap-1">
          <span className="font-semibold">{labels.form.reason.label}</span>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={labels.form.reason.placeholder}
          />
        </div>

        {error && (
          <span className="text-[var(--error)] text-[14px]">{error}</span>
        )}

        <Button onClick={handleSubmit} disabled={isPending} fullWidth>
          {isPending ? labels.form.submitting : labels.form.submit}
        </Button>
      </div>

      {result && (
        <GlassCard
          className={`p-4 border ${
            result.failedRewards > 0
              ? 'border-[var(--warning)] bg-[rgba(146,64,14,0.1)]'
              : 'border-[var(--success)] bg-[rgba(16,185,129,0.15)]'
          }`}
        >
          <span className="font-semibold -mb-2">
            {result.failedRewards > 0
              ? labels.result.partial
              : labels.result.success}
          </span>
          <div className="flex flex-col items-stretch gap-1">
            <span>
              {labels.result.total}: {result.totalUsers}
            </span>
            <span className="text-[var(--success)]">
              {labels.result.successful}: {result.successfulRewards}
            </span>
            {result.failedRewards > 0 && (
              <span className="text-[var(--warning)]">
                {labels.result.failed}: {result.failedRewards}
              </span>
            )}
            {result.errors.length > 0 && (
              <div className="flex flex-col items-stretch gap-1 -mt-2">
                <span className="font-semibold">{labels.result.errors}:</span>
                {result.errors.slice(0, 5).map((err, i) => (
                  <span className="text-[14px] text-[#94a3b8]" key={i}>
                    {err}
                  </span>
                ))}
                {result.errors.length > 5 && (
                  <span className="text-[14px] text-[#94a3b8]">
                    ...and {result.errors.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
