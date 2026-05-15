'use client';

import { useState } from 'react';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';
import type { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';
import { AdminShopEditDialog } from './AdminShopEditDialog';
import { AdminShopGrantDialog } from './AdminShopGrantDialog';

type Labels = typeof adminShopEn;

interface Props {
  catalog: EffectiveShopItem[];
  labels: Labels;
}

export function AdminShopTable({ catalog, labels }: Props) {
  const [editing, setEditing] = useState<EffectiveShopItem | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantDefaultItemId, setGrantDefaultItemId] = useState<
    string | undefined
  >(undefined);

  if (catalog.length === 0) {
    return (
      <YStack padding="$4" data-testid="admin-shop-empty">
        <Text fontSize="$3" color="$gray11">
          {labels.empty}
        </Text>
      </YStack>
    );
  }

  const openGrantForItem = (itemId?: string) => {
    setGrantDefaultItemId(itemId);
    setGrantOpen(true);
  };

  return (
    <>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$3"
      >
        <Text fontSize="$4" fontWeight="600">
          {catalog.length} items
        </Text>
        <Button
          onPress={() => openGrantForItem(undefined)}
          data-testid="admin-shop-grant-open"
        >
          {labels.buttons.grant}
        </Button>
      </XStack>

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          border: '1px solid var(--borderColor)',
          borderRadius: 8,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
          data-testid="admin-shop-table"
        >
          <thead>
            <tr style={{ background: 'var(--backgroundHover)' }}>
              <Th>{labels.columns.id}</Th>
              <Th>{labels.columns.category}</Th>
              <Th>{labels.columns.rarity}</Th>
              <Th>{labels.columns.defaultPrice}</Th>
              <Th>{labels.columns.effectivePrice}</Th>
              <Th>{labels.columns.available}</Th>
              <Th>{labels.columns.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => {
              const overridden = item.overridden;
              return (
                <tr
                  key={item.id}
                  data-testid={`admin-shop-row-${item.id}`}
                  style={{
                    borderTop: '1px solid var(--borderColor)',
                  }}
                >
                  <Td>
                    <code>{item.id}</code>
                  </Td>
                  <Td>{labels.category[item.category]}</Td>
                  <Td>{labels.rarity[item.rarity]}</Td>
                  <Td>
                    {item.defaultPriceAmount} {item.defaultPriceCurrency}
                  </Td>
                  <Td>
                    <span>
                      {item.priceAmount} {item.priceCurrency}
                    </span>
                    {overridden ? (
                      <span
                        style={{
                          marginLeft: 6,
                          padding: '1px 6px',
                          background: 'rgba(167,139,250,0.18)',
                          color: '#a78bfa',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {labels.columns.overridden}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    {item.available ? (
                      '✓'
                    ) : (
                      <span style={{ color: 'var(--colorPress)' }}>—</span>
                    )}
                  </Td>
                  <Td>
                    <XStack gap="$2">
                      <RowActionButton
                        onClick={() => setEditing(item)}
                        data-testid={`admin-shop-edit-${item.id}`}
                      >
                        {labels.buttons.edit}
                      </RowActionButton>
                      <RowActionButton
                        onClick={() => openGrantForItem(item.id)}
                        data-testid={`admin-shop-grant-row-${item.id}`}
                      >
                        {labels.buttons.grant}
                      </RowActionButton>
                    </XStack>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminShopEditDialog
        item={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        labels={labels}
      />
      <AdminShopGrantDialog
        open={grantOpen}
        onClose={() => setGrantOpen(false)}
        labels={labels}
        defaultItemId={grantDefaultItemId}
      />
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '10px 12px',
        fontWeight: 700,
        color: 'var(--colorPress)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
      {children}
    </td>
  );
}

interface RowActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  'data-testid'?: string;
}

function RowActionButton({
  children,
  onClick,
  'data-testid': testId,
}: RowActionButtonProps) {
  // CSS custom properties from the active Tamagui theme so this button reads
  // correctly under both dark and light themes.
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={{
        padding: '4px 12px',
        borderRadius: 6,
        border: '1px solid var(--borderColor)',
        background: 'var(--backgroundFocus)',
        color: 'var(--color)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
