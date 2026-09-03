'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Typography } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { track } from '@/shared/lib/analytics';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { RARITY_COLOR, RARITY_GLOW } from '../lib/rarity';
import { CURRENCY_COLOR, CURRENCY_GLYPH } from '../lib/currency';
import {
  equipItemAction,
  purchaseItemAction,
  unequipItemAction,
} from '../server/shop.actions';
import { syncEquippedToSession } from '../lib/syncEquippedToSession';
import { ItemAsset } from './ItemAsset';
import { ShopArcPaymentOverlay } from './ShopArcPaymentOverlay';
import { useArcPricing } from '@/features/solana-pay/hooks/useArcPricing';
import { CardFrame, ArtBox, Chip, ActionButton, uuid } from './shopCardStyles';
import type {
  EffectiveShopItem,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopCardLabels {
  owned: string;
  equipped: string;
  buyEquip: string;
  equip: string;
  unequip: string;
  sell: string;
}

export type ShopCardMode = 'shop' | 'inventory';

import type { InventoryItemView } from '../server/shop.types';

export interface ShopCardProps {
  item: EffectiveShopItem;
  owned: boolean;
  equipped: boolean;
  balance: WalletBalanceView;
  small?: boolean;
  /**
   * Mark this card's image as eager-loaded — set true for the first few cards
   * of the first catalog row so an above-the-fold card asset never becomes
   * the LCP target with `loading="lazy"`.
   */
  priority?: boolean;
  /**
   * 'shop' (default) renders the catalog affordance (Buy / Equip / Unequip).
   * 'inventory' adds a secondary Sell button under the primary action so
   * the same card layout serves the owned-items grid.
   */
  mode?: ShopCardMode;
  /**
   * Required in inventory mode — the live inventory row backing this item.
   * Used to pass purchaseId + paidAmount/Currency into SellConfirmDialog.
   */
  inventoryRow?: InventoryItemView | null;
  labels: ShopCardLabels;
  /**
   * Used when Buy & equip can't run inline — insufficient funds, or the BE
   * returned an error we want the confirmation dialog to surface with its
   * richer copy + retry affordance.
   */
  onPurchaseFallback: (item: EffectiveShopItem) => void;
  /**
   * Inventory mode only — invoked when the user clicks Sell on a card.
   * Parent owns the SellConfirmDialog state and refund calculation.
   */
  onSellRequest?: (row: InventoryItemView) => void;
  token?: string;
}

type CardAction = 'buy' | 'equip' | 'unequip';

export function ShopCard({
  item,
  owned,
  equipped,
  balance,
  small,
  priority = false,
  mode = 'shop',
  inventoryRow = null,
  labels,
  onPurchaseFallback,
  onSellRequest,
  token,
}: ShopCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const setHover = useShopPreviewStore((s) => s.setHover);
  const scheduleClear = useShopPreviewStore((s) => s.scheduleClear);
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [showArcPayment, setShowArcPayment] = useState(false);
  const { pricing, calculateArcPrice } = useArcPricing();

  const name = String(
    t(`pages.shop.${item.nameKey}` as TranslationKey),
  ) as string;

  const accent = RARITY_COLOR[item.rarity];
  const glow = RARITY_GLOW[item.rarity];

  const { coins, gems } = balance;
  const balanceFor = item.priceCurrency === 'coins' ? coins : gems;
  const affordable = balanceFor >= item.priceAmount;

  const action: CardAction = equipped ? 'unequip' : owned ? 'equip' : 'buy';
  const actionLabel =
    action === 'unequip'
      ? labels.unequip
      : action === 'equip'
        ? labels.equip
        : labels.buyEquip;

  const shopUsdValue = item.priceAmount * (pricing?.gemToUsdRate ?? 0.1);
  const arcPrice = calculateArcPrice(shopUsdValue);

  const handleEnter = useCallback(() => {
    if (hoverRef.current) return;
    hoverRef.current = true;
    setHover(item);
    setHovered(true);
    track('shop.preview.hover', {
      itemId: item.id,
      rarity: item.rarity,
      category: item.category,
    });
  }, [item, setHover]);

  const handleLeave = useCallback(() => {
    if (!hoverRef.current) return;
    hoverRef.current = false;
    scheduleClear();
    setHovered(false);
  }, [scheduleClear]);

  const runBuy = useCallback(() => {
    track('shop.purchase.click', {
      itemId: item.id,
      currency: item.priceCurrency,
      amount: item.priceAmount,
      source: 'card',
    });
    if (!affordable) {
      onPurchaseFallback(item);
      return;
    }
    const nonce = uuid();
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
        return;
      }
      track('shop.purchase.failure', { itemId: item.id, reason: result.error });
      onPurchaseFallback(item);
    });
  }, [item, affordable, onPurchaseFallback, router]);

  const runEquip = useCallback(() => {
    track('shop.equip', { itemId: item.id, source: 'card' });
    startTransition(async () => {
      const result = await equipItemAction(item.id);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
    });
  }, [item.id, router]);

  const runUnequip = useCallback(() => {
    track('shop.unequip', { category: item.category, source: 'card' });
    startTransition(async () => {
      const result = await unequipItemAction(item.category);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
    });
  }, [item.category, router]);

  const handleAction = () => {
    if (isPending) return;
    if (action === 'unequip') runUnequip();
    else if (action === 'equip') runEquip();
    else runBuy();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  };

  // The action button is the focus / click target. The outer card is just a
  // visual hover surface so pointer-enter still drives the mannequin preview.
  return (
    <CardFrame
      small={small}
      data-testid={`shop-card-${item.id}`}
      data-rarity={item.rarity}
      data-owned={owned ? 'true' : 'false'}
      data-equipped={equipped ? 'true' : 'false'}
      data-action={action}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{
        borderColor: equipped ? accent : undefined,
        boxShadow: hovered ? `0 12px 30px -16px ${glow}` : undefined,
      }}
    >
      <ArtBox
        small={small}
        style={{
          backgroundImage: `radial-gradient(120% 80% at 50% 0%, ${glow}, transparent 70%)`,
        }}
      >
        <ItemAsset item={item} size={small ? 64 : 96} priority={priority} />

        <div className="flex flex-row items-stretch absolute top-[8px] right-[8px] gap-4 pointer-events-none">
          {equipped ? (
            <Chip backgroundColor={`${accent}1f`} borderColor={`${accent}66`}>
              <Typography uiSize="sm" variant="label" weight="800">
                {labels.equipped}
              </Typography>
            </Chip>
          ) : owned ? (
            <Chip
              backgroundColor="var(--glassBg)"
              borderColor="var(--glassBorder)"
            >
              <Typography
                uiSize="sm"
                weight="700"
                color="var(--textSecondary)"
                tracking="md"
              >
                {labels.owned}
              </Typography>
            </Chip>
          ) : null}
        </div>
      </ArtBox>

      <div className="flex flex-col items-stretch px-3 py-2 gap-6">
        <Typography
          uiSize={small ? 'xs' : 'sm'}
          weight="700"
          color="var(--color)"
          className="line-clamp-1"
        >
          {name}
        </Typography>
        <div className="flex flex-row items-center justify-between gap-6">
          <Badge accent={accent} dot>
            {item.rarity}
          </Badge>
          <div className="flex flex-row items-center gap-4">
            <Typography uiSize="xs">
              {CURRENCY_GLYPH[item.priceCurrency]}
            </Typography>
            <Typography
              uiSize="xs"
              weight="800"
              color={CURRENCY_COLOR[item.priceCurrency]}
            >
              {formatNumber(item.priceAmount, locale)}
            </Typography>
          </div>
        </div>

        <ActionButton
          intent={action}
          affordable={affordable}
          pending={isPending}
          role="button"
          tabIndex={0}
          onClick={handleAction}
          onKeyDown={
            handleKey as unknown as React.KeyboardEventHandler<HTMLButtonElement>
          }
          onFocus={handleEnter}
          onBlur={handleLeave}
          aria-disabled={isPending}
          data-testid={`shop-card-action-${item.id}`}
          data-affordable={affordable ? 'true' : 'false'}
        >
          <Typography
            uiSize="xs"
            weight="800"
            color="var(--color)"
            tracking="sm"
            className="uppercase"
          >
            {actionLabel}
          </Typography>
        </ActionButton>

        {/* ARC payment option */}
        {!owned &&
          item.priceCurrency === 'gems' &&
          arcPrice > 0 &&
          pricing?.shopAllowArc !== false && (
            <ActionButton
              intent="buy"
              affordable={true}
              pending={isPending}
              role="button"
              tabIndex={0}
              onClick={() => setShowArcPayment(true)}
              onKeyDown={
                handleKey as unknown as React.KeyboardEventHandler<HTMLButtonElement>
              }
              style={{
                backgroundColor: 'rgba(34,197,94,0.12)',
                borderColor: 'rgba(34,197,94,0.45)',
              }}
            >
              <Typography
                uiSize="xs"
                weight="800"
                color="#22c55e"
                tracking="sm"
                className="uppercase"
              >
                {formatNumber(arcPrice, locale)} ARC
              </Typography>
            </ActionButton>
          )}

        {showArcPayment && (
          <ShopArcPaymentOverlay
            itemId={item.id}
            arcPrice={arcPrice}
            purchaseId={uuid()}
            token={token}
            onPurchased={() => {
              setShowArcPayment(false);
              router.refresh();
            }}
            onCancel={() => setShowArcPayment(false)}
          />
        )}

        {/* Inventory-mode secondary action. Hidden in catalog (shop) mode.
            Also hidden when the row is missing, the item is a starter
            (BE rejects with shop.starterNotSellable), or it's currently
            equipped (BE rejects with shop.unequipFirst — user must
            Unequip first). Click hands the inventory row up to the page
            which owns the SellConfirmDialog. */}
        {mode === 'inventory' &&
        inventoryRow &&
        !item.starter &&
        !equipped &&
        onSellRequest ? (
          <Typography
            uiSize="3xl"
            weight="600"
            color="#94a3b8"
            tracking="md"
            className="uppercase cursor-pointer py-1 text-center hover:text-[#ef4444]"
            onClick={() => {
              track('shop.sell.click', {
                itemId: item.id,
                source: 'card',
              });
              onSellRequest(inventoryRow);
            }}
            data-testid={`shop-card-sell-${item.id}`}
          >
            {labels.sell}
          </Typography>
        ) : null}
      </div>
    </CardFrame>
  );
}
