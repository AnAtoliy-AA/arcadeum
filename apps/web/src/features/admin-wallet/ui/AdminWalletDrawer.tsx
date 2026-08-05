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
import { XStack, YStack, Text } from 'tamagui';
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
    <GlassCard p="$3" gap="$2" data-testid="wallet-balance-section">
      <Text fontWeight="700" fontSize="$3">
        {label}
      </Text>
      <XStack gap="$4">
        <YStack>
          <Text fontSize="$1" opacity={0.6}>
            Coins
          </Text>
          <Text fontWeight="700" data-testid="wallet-balance-coins">
            {coins.toLocaleString()}
          </Text>
        </YStack>
        <YStack>
          <Text fontSize="$1" opacity={0.6}>
            Gems
          </Text>
          <Text fontWeight="700" data-testid="wallet-balance-gems">
            {gems.toLocaleString()}
          </Text>
        </YStack>
      </XStack>
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
    <YStack gap="$2" data-testid="wallet-recent-section">
      <Text fontWeight="700" fontSize="$3">
        {label}
      </Text>
      {items.slice(0, 10).map((tx) => (
        <GlassCard key={tx.id} p="$2" data-testid={`wallet-tx-${tx.id}`}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$1">
              {tx.currency} · {tx.reason}
            </Text>
            <Text
              fontSize="$1"
              fontWeight="700"
              color={tx.delta >= 0 ? '$success' : '$errorText'}
            >
              {tx.delta >= 0 ? '+' : ''}
              {tx.delta}
            </Text>
          </XStack>
          <Text fontSize="$1" opacity={0.5}>
            {new Date(tx.createdAt).toLocaleString()}
          </Text>
        </GlassCard>
      ))}
    </YStack>
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
          <YStack gap="$4">
            {data === null && (
              <YStack gap="$3" data-testid="wallet-drawer-loading">
                <Skeleton height={80} />
                <Skeleton height={200} />
                <Skeleton height={100} />
              </YStack>
            )}

            {data !== null && !data.ok && (
              <Text color="$errorText" data-testid="wallet-drawer-error">
                {labels.form.errors.generic}
              </Text>
            )}

            {data?.ok && (
              <>
                <BalanceSection
                  balance={data.data.balance}
                  label={labels.sections.balance}
                />
                <Text fontWeight="700" fontSize="$3">
                  {labels.sections.grantDeduct}
                </Text>
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
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
