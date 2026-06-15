'use client';

import { Container, PageLayout, PageTitle, YStack } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import {
  useBlockedIps,
  useUnblockIp,
  useClearAllBlockedIps,
} from '@/features/admin-blocked-ips/hooks';
import { BlockedIpsTable } from '@/features/admin-blocked-ips/ui/BlockedIpsTable';
import type { AdminBlockedIpsI18n } from '@/shared/i18n/messages/pages/admin-blocked-ips/en';
import { useState } from 'react';

export default function BlockedIpsClient() {
  const { messages } = useLanguage();
  const t = messages.pages?.admin?.blockedIps as
    | AdminBlockedIpsI18n
    | undefined;

  const [pendingIp, setPendingIp] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useBlockedIps();
  const unblockMutation = useUnblockIp();
  const clearAllMutation = useClearAllBlockedIps();

  const handleUnblock = async (ip: string) => {
    setPendingIp(ip);
    setErrorMsg(null);
    try {
      await unblockMutation.mutateAsync({ ip });
    } catch {
      setErrorMsg(t?.errors.generic ?? 'Something went wrong.');
    } finally {
      setPendingIp(undefined);
    }
  };

  const handleClearAll = async () => {
    if (!t) return;
    if (!window.confirm(t.confirmClearAll)) return;
    setErrorMsg(null);
    try {
      await clearAllMutation.mutateAsync();
    } catch {
      setErrorMsg(t.errors.generic);
    }
  };

  const labels = t
    ? {
        empty: t.empty,
        table: t.table,
        unblock: t.unblock,
        clearAll: t.clearAll,
        totalLabel: t.totalLabel,
        confirmClearAll: t.confirmClearAll,
      }
    : null;

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$3">
          <PageTitle size="lg">{t?.title ?? 'Blocked IPs'}</PageTitle>
          {errorMsg && (
            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor="$red3"
              data-testid="blocked-ips-error"
            >
              {errorMsg}
            </YStack>
          )}
          {labels && (
            <BlockedIpsTable
              items={data ?? []}
              isLoading={isLoading}
              labels={labels}
              onUnblock={handleUnblock}
              onClearAll={handleClearAll}
              pendingIp={pendingIp}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
