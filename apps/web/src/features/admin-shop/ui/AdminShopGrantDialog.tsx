'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { DialogShell } from '@/features/shop/ui/dialogShell';
import {
  grantShopItemAction,
  searchUsersAction,
  type SearchedUser,
} from '../server/admin-shop.actions';
import type { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';
import { AdminShopItemPreview } from './AdminShopItemPreview';

type Labels = typeof adminShopEn;

interface Props {
  open: boolean;
  onClose: () => void;
  labels: Labels;
  catalog: EffectiveShopItem[];
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
  catalog,
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
      catalog={catalog}
      defaultItemId={defaultItemId}
    />
  );
}

function AdminShopGrantDialogInner({
  onClose,
  labels,
  catalog,
  defaultItemId,
}: Omit<Props, 'open'>) {
  const router = useRouter();
  // Stable per-mount UUID — regenerated on each fresh mount.
  const nonceRef = useRef<string>(uuid());
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [userId, setUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<SearchedUser[]>([]);

  const [itemId, setItemId] = useState(defaultItemId ?? '');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isUserSearching, setIsUserSearching] = useState(false);

  const handleUserSearchChange = (val: string) => {
    setUserSearchQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (val.trim().length < 1) {
      setUserResults([]);
      setIsUserSearching(false);
      return;
    }
    setIsUserSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const res = await searchUsersAction(val);
      if (res.ok) {
        setUserResults(res.data);
      } else {
        setError(labels.grantDialog.error);
      }
      setIsUserSearching(false);
    }, 300);
  };

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
    width: '100%',
  };

  const itemInfo = catalog.find((i) => i.id === itemId);

  return (
    <DialogShell open onClose={onClose} testId="admin-shop-grant-dialog">
      <YStack gap="$3" style={{ minWidth: 320 }}>
        <Text fontSize="$6" fontWeight="700">
          {labels.grantDialog.title}
        </Text>

        {/* User Picker */}
        <YStack gap="$1" position="relative">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.userId}
          </Text>
          {userId ? (
            <XStack
              padding="$2"
              backgroundColor="$backgroundHover"
              borderRadius="$2"
              borderWidth={1}
              borderColor="$borderColor"
              justifyContent="space-between"
              alignItems="center"
            >
              <YStack>
                <Text fontSize="$3" fontWeight="bold">
                  {selectedUser
                    ? `${selectedUser.displayName} (@${selectedUser.username})`
                    : userId}
                </Text>
                {selectedUser && (
                  <Text fontSize="$1" color="$colorPress">
                    {selectedUser.email}
                  </Text>
                )}
              </YStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUserId('');
                  setSelectedUser(null);
                }}
              >
                Clear
              </Button>
            </XStack>
          ) : (
            <YStack position="relative">
              <input
                value={userSearchQuery}
                onChange={(e) => handleUserSearchChange(e.target.value)}
                placeholder={labels.grantDialog.searchUserPlaceholder}
                data-testid="admin-shop-grant-user"
                autoComplete="new-password"
                style={inputStyle}
              />
              {(isUserSearching ||
                (userSearchQuery.trim().length > 0 &&
                  userResults.length === 0)) && (
                <YStack
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  backgroundColor="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$3"
                  maxHeight={200}
                  overflowY="auto"
                  zIndex={100}
                  marginTop="$1"
                  padding="$2"
                >
                  {isUserSearching ? (
                    <Text fontSize="$2" color="$colorPress" padding="$1">
                      Searching...
                    </Text>
                  ) : (
                    <Text fontSize="$2" color="$colorPress" padding="$1">
                      No users found.
                    </Text>
                  )}
                </YStack>
              )}
              {!isUserSearching && userResults.length > 0 && (
                <YStack
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  backgroundColor="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$3"
                  maxHeight={200}
                  overflowY="auto"
                  zIndex={100}
                  marginTop="$1"
                >
                  {userResults.map((u) => (
                    <YStack
                      key={u.id}
                      padding="$2"
                      hoverStyle={{ backgroundColor: '$backgroundHover' }}
                      cursor="pointer"
                      onPress={() => {
                        setUserId(u.id);
                        setSelectedUser(u);
                        setUserResults([]);
                        setUserSearchQuery('');
                      }}
                    >
                      <Text fontSize="$3" fontWeight="bold">
                        {u.displayName} (@{u.username})
                      </Text>
                      <Text fontSize="$1" color="$colorPress">
                        {u.email}
                      </Text>
                    </YStack>
                  ))}
                </YStack>
              )}
            </YStack>
          )}
        </YStack>

        {/* Item Picker */}
        <YStack gap="$1" position="relative">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.itemId}
          </Text>
          {itemId ? (
            <XStack
              padding="$3"
              backgroundColor="$backgroundHover"
              borderRadius="$2"
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              gap="$3"
            >
              <AdminShopItemPreview
                size={48}
                colorValue={itemInfo?.colorValue}
                assetUrl={itemInfo?.assetUrl}
                itemId={itemId}
              />

              <YStack flex={1}>
                <Text fontSize="$3" fontWeight="bold">
                  {itemId}
                </Text>
                {itemInfo && (
                  <Text fontSize="$1" color="$colorPress">
                    {labels.category[itemInfo.category]} •{' '}
                    {labels.rarity[itemInfo.rarity]} • {itemInfo.priceAmount}{' '}
                    {itemInfo.priceCurrency}
                  </Text>
                )}
              </YStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setItemId('');
                }}
              >
                Clear
              </Button>
            </XStack>
          ) : (
            <YStack position="relative">
              <input
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder={labels.grantDialog.searchItemPlaceholder}
                data-testid="admin-shop-grant-item"
                autoComplete="new-password"
                style={inputStyle}
              />
              {itemSearchQuery.trim().length > 0 && (
                <YStack
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  backgroundColor="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$3"
                  maxHeight={200}
                  overflowY="auto"
                  zIndex={100}
                  marginTop="$1"
                >
                  {catalog
                    .filter((item) => {
                      const query = itemSearchQuery.toLowerCase();
                      return (
                        item.id.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query) ||
                        item.rarity.toLowerCase().includes(query)
                      );
                    })
                    .map((item) => (
                      <XStack
                        key={item.id}
                        padding="$2"
                        hoverStyle={{ backgroundColor: '$backgroundHover' }}
                        cursor="pointer"
                        onPress={() => {
                          setItemId(item.id);
                          setItemSearchQuery('');
                        }}
                        alignItems="center"
                        gap="$2"
                      >
                        <AdminShopItemPreview
                          size={24}
                          colorValue={item.colorValue}
                          assetUrl={item.assetUrl}
                          itemId={item.id}
                        />
                        <YStack>
                          <Text fontSize="$3" fontWeight="bold">
                            {item.id}
                          </Text>
                          <Text fontSize="$1" color="$colorPress">
                            {labels.category[item.category]} •{' '}
                            {labels.rarity[item.rarity]}
                          </Text>
                        </YStack>
                      </XStack>
                    ))}
                </YStack>
              )}
            </YStack>
          )}
        </YStack>

        {/* Reason & Predefined Reasons */}
        <YStack gap="$1">
          <Text fontSize="$2" color="$color">
            {labels.grantDialog.reason}
          </Text>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={280}
            data-testid="admin-shop-grant-reason"
            autoComplete="new-password"
            style={inputStyle}
          />
          <Text fontSize="$1" color="$colorPress" marginTop="$1">
            {labels.grantDialog.suggestedReasonsLabel}
          </Text>
          <XStack gap="$1.5" flexWrap="wrap" marginTop="$1">
            {Object.values(labels.grantDialog.reasons).map((text) => (
              <Button
                key={text}
                size="sm"
                variant="outline"
                onClick={() => setReason(text)}
                className="py-1 px-2 text-[12px] rounded-[16px]"
              >
                {text}
              </Button>
            ))}
          </XStack>
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

        <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {labels.grantDialog.cancel}
          </Button>
          <Button
            onClick={handleGrant}
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
