'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
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
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch w-full gap-3 p-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]',
        className,
      )}
      {...props}
    />
  );
}

function Eyebrow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[10px] tracking-[1.4px] uppercase font-extrabold text-[#94a3b8]',
        className,
      )}
      {...props}
    />
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

  // — Previewing state: details only, no buttons. The card has the action.
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
        <div className="box-border flex flex-col items-stretch gap-4">
          <span className="box-border text-[20px] font-extrabold text-[#f5f7ff]">
            {name}
          </span>
          <span className="box-border text-[14px] text-[#94a3b8] line-clamp-4">
            {desc}
          </span>
        </div>
        <div className="box-border flex flex-row gap-8 items-center justify-between">
          <div
            className="box-border flex flex-row items-center gap-4 px-6 py-2 rounded-lg border"
            style={{
              backgroundColor: `${accent}14`,
              borderColor: `${accent}44`,
            }}
          >
            <div
              className="box-border flex flex-col items-stretch w-[6px] h-[6px] rounded-xl"
              style={{ backgroundColor: accent }}
            />
            <span
              className="box-border text-[40px] tracking-[1px] uppercase font-extrabold"
              style={{ color: accent }}
            >
              {hoverItem.rarity}
            </span>
          </div>
          <div className="box-border flex flex-row items-center gap-4">
            <span className="box-border text-[14px]">
              {CURRENCY_GLYPH[hoverItem.priceCurrency]}
            </span>
            <span
              className="box-border text-[18px] font-extrabold"
              style={{ color: CURRENCY_COLOR[hoverItem.priceCurrency] }}
            >
              {formatNumber(hoverItem.priceAmount, locale)}
            </span>
          </div>
        </div>
      </PanelFrame>
    );
  }

  // — Selected slot state — still owns Sell because there's no per-card sell.
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
        <div className="box-border flex flex-row justify-between items-center">
          <Eyebrow>{actionLabels.selectedSlotEyebrow}</Eyebrow>
          <span
            className="box-border text-[48px] tracking-[1px] uppercase font-bold text-[#3b82f6] cursor-pointer"
            onClick={() => clearActiveSlot()}
            data-testid="shop-action-clear"
          >
            {actionLabels.clear}
          </span>
        </div>
        <div className="box-border flex flex-col items-stretch gap-4">
          <span className="box-border text-[20px] font-extrabold text-[#f5f7ff]">
            {slot.label}
          </span>
          <span className="box-border text-[14px] text-[#94a3b8]">
            {slot.desc}
          </span>
        </div>
        <div className="box-border flex flex-col items-stretch gap-4 p-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
          <Eyebrow>{actionLabels.equippedEyebrow}</Eyebrow>
          <span className="box-border text-[13px] font-bold text-[#f5f7ff]">
            {equippedName}
          </span>
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
              startTransition(() => {
                // hook into useTransition for parity with the rest of the
                // panel's async-style affordances; the actual sell happens
                // inside SellConfirmDialog
              });
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

  // — Idle state.
  return (
    <PanelFrame
      data-testid="shop-action-panel"
      data-mode={mode}
      role="region"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Eyebrow>{actionLabels.loadoutEyebrow}</Eyebrow>
      <div className="box-border flex flex-col items-stretch gap-4">
        <span className="box-border text-[20px] font-extrabold text-[#f5f7ff]">
          {actionLabels.idleTitle}
        </span>
        <span className="box-border text-[14px] text-[#94a3b8]">
          {actionLabels.idleBody}
        </span>
      </div>
      <WalletRail
        balance={balance}
        nextGemPack={nextGemPack}
        labels={walletLabels}
      />
    </PanelFrame>
  );
}
