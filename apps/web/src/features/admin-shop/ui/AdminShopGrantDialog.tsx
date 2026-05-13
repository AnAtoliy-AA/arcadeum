'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { DialogShell } from '@/features/shop/ui/dialogShell';
import { grantShopItemAction } from '../server/admin-shop.actions';
import type { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';

type Labels = typeof adminShopEn;

interface Props {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  /** Optional pre-filled item id (e.g., from a "grant this item" button). */
  defaultItemId?: string;
}

function uuid(): string {
  return globalThis.crypto.randomUUID();
}

export function AdminShopGrantDialog({
  open,
  onClose,
  labels,
  defaultItemId,
}: Props) {
  if (!open) return null;
  // Parent renders this with a `key` derived from open + defaultItemId so
  // every open is a fresh mount with fresh state — avoids the cascading
  // setState-in-effect lint and keeps the dialog stateless about its own
  // lifecycle.
  return (
    <AdminShopGrantDialogInner
      onClose={onClose}
      labels={labels}
      defaultItemId={defaultItemId}
    />
  );
}

function AdminShopGrantDialogInner({
  onClose,
  labels,
  defaultItemId,
}: Omit<Props, 'open'>) {
  const router = useRouter();
  // Stable per-mount UUID — regenerated on each fresh mount.
  const nonceRef = useRef<string>(uuid());

  const [userId, setUserId] = useState('');
  const [itemId, setItemId] = useState(defaultItemId ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGrant = () => {
    setError(null);
    if (!userId.trim() || !itemId.trim() || !reason.trim()) {
      setError(labels.grantDialog.error);
      return;
    }
    startTransition(async () => {
      const result = await grantShopItemAction({
        userId: userId.trim(),
        itemId: itemId.trim(),
        reason: reason.trim(),
        nonce: nonceRef.current,
      });
      if (result.ok) {
        router.refresh();
        onClose();
        return;
      }
      setError(labels.grantDialog.error);
    });
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    background: 'var(--backgroundFocus)',
    border: '1px solid var(--borderColor)',
    borderRadius: 6,
    color: 'inherit',
    fontSize: 14,
  };

  return (
    <DialogShell open onClose={onClose} testId="admin-shop-grant-dialog">
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="700">
          {labels.grantDialog.title}
        </Text>

        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.userId}
          </Text>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            data-testid="admin-shop-grant-user"
            style={inputStyle}
          />
        </YStack>

        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.itemId}
          </Text>
          <input
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            data-testid="admin-shop-grant-item"
            style={inputStyle}
          />
        </YStack>

        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.reason}
          </Text>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={280}
            data-testid="admin-shop-grant-reason"
            style={inputStyle}
          />
        </YStack>

        {error ? (
          <Text
            color="$danger"
            fontSize="$2"
            data-testid="admin-shop-grant-error"
          >
            {error}
          </Text>
        ) : null}

        <XStack gap="$3" justifyContent="flex-end">
          <Button variant="ghost" onPress={onClose} disabled={isPending}>
            {labels.grantDialog.cancel}
          </Button>
          <Button
            onPress={handleGrant}
            disabled={isPending}
            data-testid="admin-shop-grant-submit"
          >
            {labels.grantDialog.grant}
          </Button>
        </XStack>
      </YStack>
    </DialogShell>
  );
}
