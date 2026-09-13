'use client';

import { useState, useTransition } from 'react';
import { Button, GlassCard } from '@arcadeum/ui';
import {
  runXpBackfillAction,
  type XpBackfillResult,
} from '@/features/admin-xp-backfill/server/admin-xp-backfill.actions';
import type { adminXpBackfillEn } from '@/shared/i18n/messages/pages/admin-xp-backfill/en';

type Labels = typeof adminXpBackfillEn;

interface Props {
  labels: Labels;
}

export function AdminXpBackfillView({ labels }: Props) {
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<XpBackfillResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    setConfirmOpen(false);
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await runXpBackfillAction(dryRun);

      if (response.ok) {
        setResult(response.data);
      } else {
        setError(
          response.error === 'forbidden'
            ? 'Forbidden'
            : 'Backfill failed. Check server logs.',
        );
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      {confirmOpen && (
        <GlassCard className="p-4 border border-[var(--warning)] bg-[rgba(146,64,14,0.1)]">
          <span className="font-semibold -mb-2">{labels.confirm.title}</span>
          <span className="-mb-4">{labels.confirm.message}</span>
          <div className="flex flex-row items-stretch gap-2">
            <Button onClick={confirmSubmit}>{labels.confirm.confirm}</Button>
            <Button onClick={() => setConfirmOpen(false)} variant="outline">
              {labels.confirm.cancel}
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="flex flex-col items-stretch gap-3">
        <label className="flex flex-row items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--borderColor)] bg-[var(--backgroundFocus)]"
          />
          <span className="text-sm">{labels.form.dryRun}</span>
        </label>

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
            result.affected > 0
              ? 'border-[var(--success)] bg-[rgba(16,185,129,0.15)]'
              : 'border-[var(--borderColor)]'
          }`}
        >
          <span className="font-semibold -mb-2">
            {dryRun ? labels.result.dryRun : labels.result.success}
          </span>
          <div className="flex flex-col items-stretch gap-1">
            <span>
              {labels.result.affected}: {result.affected}
            </span>
            <span>
              {labels.result.skipped}: {result.skipped}
            </span>
            {result.details.length === 0 && (
              <span className="text-[14px] text-[#94a3b8]">
                {labels.result.noUsers}
              </span>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
