'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
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
import {
  equipItemAction,
  unequipItemAction,
  purchaseItemAction,
} from '../server/shop.actions';
import { syncEquippedToSession } from '../lib/syncEquippedToSession';
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

export interface ShopActionLabels {
  previewingEyebrow: string;
  selectedSlotEyebrow: string;
  loadoutEyebrow: string;
  equippedEyebrow: string;
  idleTitle: string;
  idleBody: string;
  buyEquip: string;
  equip: string;
  unequip: string;
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
  /**
   * Fallback handler invoked only when the panel's own direct-buy path can't
   * be used (insufficient funds, or the optimistic action returned an error
   * that wants a confirmation dialog). For affordable items the panel
   * commits the purchase itself.
   */
  onPurchaseFallback: (item: EffectiveShopItem) => void;
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

function uuid(): string {
  return globalThis.crypto.randomUUID();
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
  onPurchaseFallback,
}: ShopActionPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [sellTarget, setSellTarget] = useState<InventoryItemView | null>(null);
  const clearActiveSlot = useShopPreviewStore((s) => s.clearActiveSlot);

  // Per-purchase idempotency nonce. Reset whenever the hovered item changes
  // so the next purchase gets a fresh id; resetting on success would race
  // with React strict-mode double-fires of the action.
  const purchaseNonceRef = useRef<string>(uuid());
  const hoverId = hoverItem?.id ?? null;
  useEffect(() => {
    if (hoverId) {
      purchaseNonceRef.current = uuid();
    }
  }, [hoverId]);

  const ownedIds = useMemo(
    () =>
      new Set(
        inventory.filter((row) => row.soldAt === null).map((row) => row.itemId),
      ),
    [inventory],
  );

  const onEquip = (itemId: string, category: ShopCategory) => {
    track('shop.equip', { itemId, source: 'panel' });
    startTransition(async () => {
      const result = await equipItemAction(itemId);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
      void category;
    });
  };

  const onUnequip = (category: ShopCategory) => {
    track('shop.unequip', { category, source: 'panel' });
    startTransition(async () => {
      const result = await unequipItemAction(category);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
    });
  };

  const onBuyDirect = (item: EffectiveShopItem) => {
    track('shop.purchase.click', {
      itemId: item.id,
      currency: item.priceCurrency,
      amount: item.priceAmount,
      source: 'panel',
    });
    const nonce = purchaseNonceRef.current;
    startTransition(async () => {
      const result = await purchaseItemAction(item.id, nonce);
      if (result.ok) {
        syncEquippedToSession(result.data.equipped);
        track('shop.purchase.success', {
          itemId: item.id,
          currency: item.priceCurrency,
          amount: item.priceAmount,
        });
        router.refresh();
        // Fresh nonce for the next purchase of the same item, if the user
        // keeps hovering it.
        purchaseNonceRef.current = uuid();
        return;
      }
      track('shop.purchase.failure', { itemId: item.id, reason: result.error });
      // BE already returned the error — let the confirmation dialog surface
      // the message with its richer copy + retry affordance.
      onPurchaseFallback(item);
    });
  };

  const mode: ActionMode = hoverItem ? 'preview' : activeSlot ? 'slot' : 'idle';
  const ariaLabel =
    mode === 'preview'
      ? actionLabels.previewingEyebrow
      : mode === 'slot'
        ? actionLabels.selectedSlotEyebrow
        : actionLabels.loadoutEyebrow;

  // — Previewing state (hover takes priority)
  if (hoverItem) {
    const owned = ownedIds.has(hoverItem.id);
    const equipped = preview[hoverItem.category]?.id === hoverItem.id && owned;
    const accent = RARITY_COLOR[hoverItem.rarity];
    const name = String(t(`pages.shop.${hoverItem.nameKey}` as TranslationKey));
    const desc = String(t(`pages.shop.${hoverItem.descKey}` as TranslationKey));
    const { coins, gems } = balance;
    const balanceFor = hoverItem.priceCurrency === 'coins' ? coins : gems;
    const affordable = balanceFor >= hoverItem.priceAmount;

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
          <Text fontSize="$2" color="$gray11" numberOfLines={3}>
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

        {equipped ? (
          <Button
            variant="outline"
            onPress={() => onUnequip(hoverItem.category)}
            disabled={isPending}
            data-testid="shop-action-unequip"
          >
            {actionLabels.unequip}
          </Button>
        ) : owned ? (
          <Button
            onPress={() => onEquip(hoverItem.id, hoverItem.category)}
            disabled={isPending}
            data-testid="shop-action-equip"
          >
            {actionLabels.equip}
          </Button>
        ) : (
          <Button
            onPress={() =>
              affordable
                ? onBuyDirect(hoverItem)
                : onPurchaseFallback(hoverItem)
            }
            disabled={isPending}
            data-testid="shop-action-buy-equip"
            data-affordable={affordable ? 'true' : 'false'}
            style={{
              backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              borderColor: accent,
              opacity: affordable ? 1 : 0.7,
            }}
          >
            <Text fontSize="$3" fontWeight="800" color="#0a0a0a">
              {actionLabels.buyEquip}
            </Text>
          </Button>
        )}
      </PanelFrame>
    );
  }

  // — Selected slot state
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
          onSuccess={() => setSellTarget(null)}
          labels={sellLabels}
        />
      </PanelFrame>
    );
  }

  // — Idle state
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
