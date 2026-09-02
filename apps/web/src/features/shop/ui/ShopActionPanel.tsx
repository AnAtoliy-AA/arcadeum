'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Typography } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { track } from '@/shared/lib/analytics';
import { RARITY_COLOR } from '../lib/rarity';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { WalletRail, type WalletRailLabels } from './WalletRail';
import { SellConfirmDialog, type SellConfirmLabels } from './SellConfirmDialog';
import type {
  EffectiveShopItem,
  InventoryItemView,
  NextGemPackView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

// The panel's preview mode is now display-only: name, description,
// rarity, price. The actual Buy & equip / Equip / Unequip action lives on
// the card itself (much closer to the cursor — no traversal across the
// page to hit a button). Slot mode keeps its Sell button because Sell
// doesn't have a card-side equivalent.

export interface ShopActionLabels {
  previewingEyebrow: string;
  selectedSlotEyebrow: string;
  loadoutEyebrow: string;
  equippedEyebrow: string;
  idleTitle: string;
  idleBody: string;
  sell: string;
  clear: string;
  slotEmpty: string;
}

export interface ShopActionPanelProps {
  hoverItem: EffectiveShopItem | null;
  activeSlot: ShopCategory | null;
  preview: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  inventory: InventoryItemView[];
  balance: WalletBalanceView;
  gemToCoinRate: number;
  nextGemPack: NextGemPackView | null;
  slotLabels: Record<ShopCategory, { label: string; desc: string }>;
  actionLabels: ShopActionLabels;
  walletLabels: WalletRailLabels;
  sellLabels: SellConfirmLabels;
}

function PanelFrame({
  className,
  role,
  'data-testid': dataTestId,
  'data-mode': dataMode,
  'aria-live': ariaLive,
  'aria-label': ariaLabel,
  children,
}: {
  className?: string;
  role?: string;
  'data-testid'?: string;
  'data-mode'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-label'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      data-mode={dataMode}
      className={cx(
        'flex flex-col items-stretch w-full gap-3 p-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Typography
      uiSize="xs"
      weight="800"
      color="var(--textSecondary)"
      tracking="lg"
      className={cx('uppercase', className)}
    >
      {children}
    </Typography>
  );
}

function refundForRow(row: InventoryItemView, gemToCoinRate: number): number {
  if (row.paidAmount === null || row.paidCurrency === null) return 0;
  if (row.paidCurrency === 'coins') return Math.floor(row.paidAmount * 0.5);
  return Math.floor(row.paidAmount * gemToCoinRate * 0.5);
}

type ActionMode = 'preview' | 'slot' | 'idle';

export function ShopActionPanel({
  hoverItem,
  activeSlot,
  preview,
  inventory,
  balance,
  gemToCoinRate,
  nextGemPack,
  slotLabels,
  actionLabels,
  walletLabels,
  sellLabels,
}: ShopActionPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [sellTarget, setSellTarget] = useState<InventoryItemView | null>(null);
  const clearActiveSlot = useShopPreviewStore((s) => s.clearActiveSlot);

  const mode: ActionMode = hoverItem ? 'preview' : activeSlot ? 'slot' : 'idle';
  const ariaLabel =
    mode === 'preview'
      ? actionLabels.previewingEyebrow
      : mode === 'slot'
        ? actionLabels.selectedSlotEyebrow
        : actionLabels.loadoutEyebrow;

  if (hoverItem) {
    const accent = RARITY_COLOR[hoverItem.rarity];
    const name = String(t(`pages.shop.${hoverItem.nameKey}` as TranslationKey));
    const desc = String(t(`pages.shop.${hoverItem.descKey}` as TranslationKey));

    return (
      <PanelFrame
        data-testid="shop-action-panel"
        data-mode={mode}
        role="region"
        aria-live="polite"
        aria-label={ariaLabel}
      >
        <Eyebrow>{actionLabels.previewingEyebrow}</Eyebrow>
        <div className="flex flex-col items-stretch gap-4">
          <Typography uiSize="xl" weight="800" color="var(--color)">
            {name}
          </Typography>
          <Typography
            uiSize="sm"
            color="var(--textSecondary)"
            className="line-clamp-4"
          >
            {desc}
          </Typography>
        </div>
        <div className="flex flex-row gap-6 items-center justify-between">
          <Badge accent={accent} dot>
            {hoverItem.rarity}
          </Badge>
          <div className="flex flex-row items-center gap-4">
            <Typography uiSize="sm">
              {CURRENCY_GLYPH[hoverItem.priceCurrency]}
            </Typography>
            <Typography
              uiSize="lg"
              weight="800"
              color={CURRENCY_COLOR[hoverItem.priceCurrency]}
            >
              {formatNumber(hoverItem.priceAmount, locale)}
            </Typography>
          </div>
        </div>
      </PanelFrame>
    );
  }

  if (activeSlot) {
    const slot = slotLabels[activeSlot];
    const equippedItem = preview[activeSlot] ?? null;
    const equippedName = equippedItem
      ? String(t(`pages.shop.${equippedItem.nameKey}` as TranslationKey))
      : actionLabels.slotEmpty;
    const equippedRow = equippedItem
      ? (inventory.find(
          (r) => r.itemId === equippedItem.id && r.soldAt === null,
        ) ?? null)
      : null;
    const canSell =
      equippedRow !== null && equippedItem !== null && !equippedItem.starter;

    return (
      <PanelFrame
        data-testid="shop-action-panel"
        data-mode={mode}
        role="region"
        aria-live="polite"
        aria-label={ariaLabel}
      >
        <div className="flex flex-row justify-between items-center">
          <Eyebrow>{actionLabels.selectedSlotEyebrow}</Eyebrow>
          <Typography
            uiSize="sm"
            weight="600"
            color="#3b82f6"
            tracking="md"
            className="uppercase cursor-pointer"
            onClick={() => clearActiveSlot()}
            data-testid="shop-action-clear"
          >
            {actionLabels.clear}
          </Typography>
        </div>
        <div className="flex flex-col items-stretch gap-4">
          <Typography uiSize="xl" weight="800" color="var(--color)">
            {slot.label}
          </Typography>
          <Typography uiSize="sm" color="var(--textSecondary)">
            {slot.desc}
          </Typography>
        </div>
        <div className="flex flex-col items-stretch gap-4 p-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)]">
          <Eyebrow>{actionLabels.equippedEyebrow}</Eyebrow>
          <Typography uiSize="sm" weight="700" color="var(--color)">
            {equippedName}
          </Typography>
        </div>
        {canSell && equippedRow ? (
          <Button
            variant="danger"
            onClick={() => {
              track('shop.sell.click', {
                itemId: equippedRow.itemId,
                refundCoins: refundForRow(equippedRow, gemToCoinRate),
              });
              setSellTarget(equippedRow);
              startTransition(() => {});
            }}
            disabled={isPending}
            data-testid="shop-action-sell"
          >
            {actionLabels.sell}
          </Button>
        ) : null}

        <SellConfirmDialog
          inventoryItem={sellTarget}
          refundCoins={sellTarget ? refundForRow(sellTarget, gemToCoinRate) : 0}
          open={sellTarget !== null}
          onClose={() => setSellTarget(null)}
          onSuccess={() => {
            setSellTarget(null);
            router.refresh();
          }}
          labels={sellLabels}
        />
      </PanelFrame>
    );
  }

  return (
    <PanelFrame
      data-testid="shop-action-panel"
      data-mode={mode}
      role="region"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Eyebrow>{actionLabels.loadoutEyebrow}</Eyebrow>
      <div className="flex flex-col items-stretch gap-4">
        <Typography uiSize="md" weight="800" color="var(--color)">
          {actionLabels.idleTitle}
        </Typography>
        <Typography uiSize="xs" color="var(--textSecondary)">
          {actionLabels.idleBody}
        </Typography>
      </div>
      <WalletRail
        balance={balance}
        nextGemPack={nextGemPack}
        labels={walletLabels}
      />
    </PanelFrame>
  );
}
