'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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

const PanelFrame = styled(Stack, {
  name: 'ShopActionPanel',
  width: '100%',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  padding: '$3',
  gap: 12,
});

const Eyebrow = styled(Text, {
  name: 'ShopActionEyebrow',
  fontSize: 10,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  fontWeight: '800',
  color: '$gray11',
});

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
        <YStack gap={4}>
          <Text fontSize="$5" fontWeight="800" color="$white">
            {name}
          </Text>
          <Text fontSize="$2" color="$gray11" numberOfLines={4}>
            {desc}
          </Text>
        </YStack>
        <XStack gap={8} alignItems="center" justifyContent="space-between">
          <Stack
            flexDirection="row"
            alignItems="center"
            gap={4}
            paddingHorizontal={6}
            paddingVertical={2}
            borderRadius="$2"
            backgroundColor={`${accent}14`}
            borderWidth={1}
            borderColor={`${accent}44`}
          >
            <Stack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={accent}
            />
            <Text
              fontSize={9}
              letterSpacing={1}
              textTransform="uppercase"
              fontWeight="800"
              color={accent}
            >
              {hoverItem.rarity}
            </Text>
          </Stack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={14}>{CURRENCY_GLYPH[hoverItem.priceCurrency]}</Text>
            <Text
              fontSize="$4"
              fontWeight="800"
              color={CURRENCY_COLOR[hoverItem.priceCurrency]}
            >
              {hoverItem.priceAmount.toLocaleString()}
            </Text>
          </XStack>
        </XStack>
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
        <XStack justifyContent="space-between" alignItems="center">
          <Eyebrow>{actionLabels.selectedSlotEyebrow}</Eyebrow>
          <Text
            fontSize={10}
            letterSpacing={1}
            textTransform="uppercase"
            fontWeight="700"
            color="$blue11"
            cursor="pointer"
            onPress={() => clearActiveSlot()}
            data-testid="shop-action-clear"
          >
            {actionLabels.clear}
          </Text>
        </XStack>
        <YStack gap={4}>
          <Text fontSize="$5" fontWeight="800" color="$white">
            {slot.label}
          </Text>
          <Text fontSize="$2" color="$gray11">
            {slot.desc}
          </Text>
        </YStack>
        <YStack
          gap={4}
          padding="$2"
          borderRadius="$3"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.08)"
          backgroundColor="rgba(255,255,255,0.02)"
        >
          <Eyebrow>{actionLabels.equippedEyebrow}</Eyebrow>
          <Text fontSize={13} fontWeight="700" color="$white">
            {equippedName}
          </Text>
        </YStack>
        {canSell && equippedRow ? (
          <Button
            variant="danger"
            onPress={() => {
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
      <YStack gap={4}>
        <Text fontSize="$5" fontWeight="800" color="$white">
          {actionLabels.idleTitle}
        </Text>
        <Text fontSize="$2" color="$gray11">
          {actionLabels.idleBody}
        </Text>
      </YStack>
      <WalletRail
        balance={balance}
        nextGemPack={nextGemPack}
        labels={walletLabels}
      />
    </PanelFrame>
  );
}
