'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  GlassCard,
  Skeleton,
} from '@arcadeum/ui';
import { loadAdminWalletAction } from '../server/wallet.actions';
import { AdminWalletForm, type AdminWalletFormLabels } from './AdminWalletForm';
import type {
  WalletBalance,
  WalletTransactionView,
} from '@/features/wallet/server/wallet.types';

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function BalanceSection({
  balance,
  label,
}: {
  balance: WalletBalance;
  label: string;
}) {
  const { coins, gems } = balance;
  return (
    <GlassCard className="p-3 gap-2" data-testid="wallet-balance-section">
      <span className="box-border font-bold text-[16px]">{label}</span>
      <div className="box-border flex flex-row items-stretch gap-4">
        <div className="box-border flex flex-col items-stretch">
          <span className="box-border text-[12px] opacity-[0.6]">Coins</span>
          <span
            className="box-border font-bold"
            data-testid="wallet-balance-coins"
          >
            {coins.toLocaleString()}
          </span>
        </div>
        <div className="box-border flex flex-col items-stretch">
          <span className="box-border text-[12px] opacity-[0.6]">Gems</span>
          <span
            className="box-border font-bold"
            data-testid="wallet-balance-gems"
          >
            {gems.toLocaleString()}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function RecentSection({
  items,
  label,
}: {
  items: WalletTransactionView[];
  label: string;
}) {
  if (items.length === 0) return null;
  return (
    <div
      className="box-border flex flex-col items-stretch gap-2"
      data-testid="wallet-recent-section"
    >
      <span className="box-border font-bold text-[16px]">{label}</span>
      {items.slice(0, 10).map((tx) => (
        <GlassCard
          className="p-2"
          key={tx.id}
          data-testid={`wallet-tx-${tx.id}`}
        >
          <div className="box-border flex flex-row justify-space-between items-center">
            <span className="box-border text-[12px]">
              {tx.currency} · {tx.reason}
            </span>
            <span
              className={'"box-border text-[12px] font-bold"'}
              style={{ color: tx.delta >= 0 ? '$success' : '$errorText' }}
            >
              {tx.delta >= 0 ? '+' : ''}
              {tx.delta}
            </span>
          </div>
          <span className="box-border text-[12px] opacity-[0.5]">
            {new Date(tx.createdAt).toLocaleString()}
          </span>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export interface AdminWalletDrawerLabels {
  title: string;
  sections: {
    balance: string;
    grantDeduct: string;
    recent: string;
  };
  form: AdminWalletFormLabels;
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export interface AdminWalletDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  labels: AdminWalletDrawerLabels;
}

type LoadResult = Awaited<ReturnType<typeof loadAdminWalletAction>>;

export function AdminWalletDrawer({
  userId,
  open,
  onClose,
  labels,
}: AdminWalletDrawerProps) {
  const [data, setData] = useState<LoadResult | null>(null);
  const [, startTransition] = useTransition();

  const reload = () => {
    startTransition(async () => {
      const result = await loadAdminWalletAction(userId);
      setData(result);
    });
  };

  useEffect(() => {
    if (open && userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- conditional data fetch
      setData(null);
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={560} data-testid="admin-wallet-drawer">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{labels.title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="box-border flex flex-col items-stretch gap-4">
            {data === null && (
              <div
                className="box-border flex flex-col items-stretch gap-3"
                data-testid="wallet-drawer-loading"
              >
                <Skeleton className="h-[80px]" />
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[100px]" />
              </div>
            )}

            {data !== null && !data.ok && (
              <span
                className="box-border text-[var(--errorText)]"
                data-testid="wallet-drawer-error"
              >
                {labels.form.errors.generic}
              </span>
            )}

            {data?.ok && (
              <>
                <BalanceSection
                  balance={data.data.balance}
                  label={labels.sections.balance}
                />
                <span className="box-border font-bold text-[16px]">
                  {labels.sections.grantDeduct}
                </span>
                <AdminWalletForm
                  userId={userId}
                  onChanged={reload}
                  labels={labels.form}
                />
                <RecentSection
                  items={data.data.recent.items}
                  label={labels.sections.recent}
                />
              </>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
