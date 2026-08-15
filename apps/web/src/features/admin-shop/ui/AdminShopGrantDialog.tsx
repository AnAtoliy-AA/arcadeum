'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
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
      <div
        className={'"box-border flex flex-col items-stretch gap-3"'}
        style={{ minWidth: 320 }}
      >
        <span className="box-border text-[24px] font-bold">
          {labels.grantDialog.title}
        </span>

        {/* User Picker */}
        <div className="box-border flex flex-col items-stretch gap-1 relative">
          <span className="box-border text-[14px] text-[var(--color)]">
            {labels.grantDialog.userId}
          </span>
          {userId ? (
            <div className="box-border flex flex-row p-2 bg-[var(--backgroundHover)] rounded-lg border border-[var(--borderColor)] justify-space-between items-center">
              <div className="box-border flex flex-col items-stretch">
                <span className="box-border text-[16px] font-bold">
                  {selectedUser
                    ? `${selectedUser.displayName} (@${selectedUser.username})`
                    : userId}
                </span>
                {selectedUser && (
                  <span className="box-border text-[12px] text-[var(--colorPress)]">
                    {selectedUser.email}
                  </span>
                )}
              </div>
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
            </div>
          ) : (
            <div className="box-border flex flex-col items-stretch relative">
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
                <div className="box-border flex flex-col items-stretch absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl max-h-[200px] overflow-y-auto z-[100] -mt-1 p-2">
                  {isUserSearching ? (
                    <span className="box-border text-[14px] text-[var(--colorPress)] p-1">
                      Searching...
                    </span>
                  ) : (
                    <span className="box-border text-[14px] text-[var(--colorPress)] p-1">
                      No users found.
                    </span>
                  )}
                </div>
              )}
              {!isUserSearching && userResults.length > 0 && (
                <div className="box-border flex flex-col items-stretch absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl max-h-[200px] overflow-y-auto z-[100] -mt-1">
                  {userResults.map((u) => (
                    <div
                      className="box-border flex flex-col items-stretch p-2 hover:bg-[var(--backgroundHover)] cursor-pointer"
                      onClick={() => {
                        setUserId(u.id);
                        setSelectedUser(u);
                        setUserResults([]);
                        setUserSearchQuery('');
                      }}
                      key={u.id}
                    >
                      <span className="box-border text-[16px] font-bold">
                        {u.displayName} (@{u.username})
                      </span>
                      <span className="box-border text-[12px] text-[var(--colorPress)]">
                        {u.email}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Item Picker */}
        <div className="box-border flex flex-col items-stretch gap-1 relative">
          <span className="box-border text-[14px] text-[var(--color)]">
            {labels.grantDialog.itemId}
          </span>
          {itemId ? (
            <div className="box-border flex flex-row p-3 bg-[var(--backgroundHover)] rounded-lg border border-[var(--borderColor)] items-center gap-3">
              <AdminShopItemPreview
                size={48}
                colorValue={itemInfo?.colorValue}
                assetUrl={itemInfo?.assetUrl}
                itemId={itemId}
              />

              <div className="box-border flex flex-col items-stretch flex-1">
                <span className="box-border text-[16px] font-bold">
                  {itemId}
                </span>
                {itemInfo && (
                  <span className="box-border text-[12px] text-[var(--colorPress)]">
                    {labels.category[itemInfo.category]} •{' '}
                    {labels.rarity[itemInfo.rarity]} • {itemInfo.priceAmount}{' '}
                    {itemInfo.priceCurrency}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setItemId('');
                }}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="box-border flex flex-col items-stretch relative">
              <input
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder={labels.grantDialog.searchItemPlaceholder}
                data-testid="admin-shop-grant-item"
                autoComplete="new-password"
                style={inputStyle}
              />
              {itemSearchQuery.trim().length > 0 && (
                <div className="box-border flex flex-col items-stretch absolute top-full left-0 right-0 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl max-h-[200px] overflow-y-auto z-[100] -mt-1">
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
                      <div
                        className="box-border flex flex-row p-2 hover:bg-[var(--backgroundHover)] cursor-pointer items-center gap-2"
                        onClick={() => {
                          setItemId(item.id);
                          setItemSearchQuery('');
                        }}
                        key={item.id}
                      >
                        <AdminShopItemPreview
                          size={24}
                          colorValue={item.colorValue}
                          assetUrl={item.assetUrl}
                          itemId={item.id}
                        />
                        <div className="box-border flex flex-col items-stretch">
                          <span className="box-border text-[16px] font-bold">
                            {item.id}
                          </span>
                          <span className="box-border text-[12px] text-[var(--colorPress)]">
                            {labels.category[item.category]} •{' '}
                            {labels.rarity[item.rarity]}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reason & Predefined Reasons */}
        <div className="box-border flex flex-col items-stretch gap-1">
          <span className="box-border text-[14px] text-[var(--color)]">
            {labels.grantDialog.reason}
          </span>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={280}
            data-testid="admin-shop-grant-reason"
            autoComplete="new-password"
            style={inputStyle}
          />
          <span className="box-border text-[12px] text-[var(--colorPress)] -mt-1">
            {labels.grantDialog.suggestedReasonsLabel}
          </span>
          <div className="box-border flex flex-row items-stretch gap-null flex-wrap -mt-1">
            {Object.values(labels.grantDialog.reasons).map((text) => (
              <Button
                className={'py-1 px-2 text-[12px] rounded-[16px]'}
                key={text}
                size="sm"
                variant="outline"
                onClick={() => setReason(text)}
              >
                {text}
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <span
            className="box-border text-[var(--danger)] text-[14px]"
            data-testid="admin-shop-grant-error"
          >
            {error}
          </span>
        ) : null}

        <div className="box-border flex flex-row items-stretch gap-3 justify-end -mt-2">
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
        </div>
      </div>
    </DialogShell>
  );
}
