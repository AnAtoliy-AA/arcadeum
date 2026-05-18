'use client';

import { useMemo } from 'react';
import { YStack } from '@arcadeum/ui';
import { styled, YStack as Stack } from 'tamagui';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { ShopMannequinStage } from './ShopMannequinStage';
import {
  ShopSlotRing,
  type ShopSlotRingLabels,
  type ShopSlotLabels,
} from './ShopSlotRing';
import { ShopActionPanel, type ShopActionLabels } from './ShopActionPanel';
import type { WalletRailLabels } from './WalletRail';
import type { SellConfirmLabels } from './SellConfirmDialog';
import type {
  EffectiveShopItem,
  InventoryView,
  NextGemPackView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopMannequinLabels {
  tryOn: string;
  stage: { level: string };
  slots: Record<ShopCategory, ShopSlotLabels>;
  action: ShopActionLabels;
  wallet: WalletRailLabels;
}

export interface ShopMannequinRailProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryView;
  balance: WalletBalanceView;
  nextGemPack: NextGemPackView | null;
  gemToCoinRate: number;
  labels: ShopMannequinLabels;
  sellLabels: SellConfirmLabels;
  onPurchase: (item: EffectiveShopItem) => void;
}

const RailHost = styled(Stack, {
  name: 'ShopMannequinRail',
  width: 320,
  gap: 12,
  position: 'sticky',
  top: 16,
  alignSelf: 'flex-start',
  flexShrink: 0,

  $sm: {
    width: '100%',
    position: 'relative',
    top: 0,
  },
});

const SLOT_TO_ROW: Record<ShopCategory, string> = {
  avatar: 'row-avatars',
  badge: 'row-badges',
  name_color: 'row-colors',
  game_skin: 'row-skins',
};

export function ShopMannequinRail({
  catalog,
  inventory,
  balance,
  nextGemPack,
  gemToCoinRate,
  labels,
  sellLabels,
  onPurchase,
}: ShopMannequinRailProps) {
  const { hoverItem, activeSlot, setActiveSlot } = useShopPreviewStore();

  const displayName = useSessionStore(
    (s) => s.snapshot.displayName ?? s.snapshot.username ?? 'Player',
  );

  const catalogById = useMemo(
    () => new Map(catalog.map((c) => [c.id, c])),
    [catalog],
  );

  const equippedAvatar = inventory.equipped.avatar
    ? (catalogById.get(inventory.equipped.avatar) ?? null)
    : null;
  const equippedBadge = inventory.equipped.badge
    ? (catalogById.get(inventory.equipped.badge) ?? null)
    : null;
  const equippedNameColor = inventory.equipped.name_color
    ? (catalogById.get(inventory.equipped.name_color) ?? null)
    : null;
  const equippedSkin = inventory.equipped.game_skin
    ? (catalogById.get(inventory.equipped.game_skin) ?? null)
    : null;

  const preview: Record<ShopCategory, EffectiveShopItem | null | undefined> = {
    avatar: hoverItem?.category === 'avatar' ? hoverItem : equippedAvatar,
    badge: hoverItem?.category === 'badge' ? hoverItem : equippedBadge,
    name_color:
      hoverItem?.category === 'name_color' ? hoverItem : equippedNameColor,
    game_skin: hoverItem?.category === 'game_skin' ? hoverItem : equippedSkin,
  };

  const onSlotClick = (slot: ShopCategory) => {
    setActiveSlot(slot);
    if (typeof document !== 'undefined') {
      document
        .getElementById(SLOT_TO_ROW[slot])
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <RailHost id="shop-rail" data-testid="shop-rail">
      <ShopMannequinStage
        preview={preview}
        hoverItem={hoverItem}
        displayName={displayName}
        level={1}
        labels={{ tryOn: labels.tryOn, stage: labels.stage }}
      />
      <ShopSlotRing
        preview={preview}
        activeSlot={activeSlot}
        hoverItem={hoverItem}
        labels={labels.slots as ShopSlotRingLabels}
        onSlotClick={onSlotClick}
      />
      <YStack>
        <ShopActionPanel
          hoverItem={hoverItem}
          activeSlot={activeSlot}
          preview={preview}
          inventory={inventory.items}
          balance={balance}
          gemToCoinRate={gemToCoinRate}
          nextGemPack={nextGemPack}
          slotLabels={labels.slots}
          actionLabels={labels.action}
          walletLabels={labels.wallet}
          sellLabels={sellLabels}
          onPurchase={onPurchase}
        />
      </YStack>
    </RailHost>
  );
}
