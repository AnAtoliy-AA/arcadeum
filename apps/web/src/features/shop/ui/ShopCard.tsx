'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
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
}

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
  labels: ShopCardLabels;
  /**
   * Used when Buy & equip can't run inline — insufficient funds, or the BE
   * returned an error we want the confirmation dialog to surface with its
   * richer copy + retry affordance.
   */
  onPurchaseFallback: (item: EffectiveShopItem) => void;
}

const CardFrame = styled(Stack, {
  name: 'ShopCardFrame',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: 200,
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  overflow: 'hidden',
  position: 'relative',
  hoverStyle: {
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    y: -2,
  },

  variants: {
    small: {
      true: { width: 144 },
    },
  } as const,
});

const ArtBox = styled(Stack, {
  name: 'ShopCardArt',
  position: 'relative',
  height: 140,
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    small: {
      true: { height: 96 },
    },
  } as const,
});

const Chip = styled(Stack, {
  name: 'ShopCardChip',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: '$2',
  borderWidth: 1,
});

const ActionButton = styled(Stack, {
  name: 'ShopCardActionButton',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  width: '100%',
  paddingVertical: '$2',
  borderRadius: '$3',
  borderWidth: 1,
  cursor: 'pointer',
  // Keyboard focus ring lives on the button itself, not the card.
  focusStyle: {
    outlineColor: 'rgba(125,211,252,0.6)',
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 1,
  },

  variants: {
    intent: {
      buy: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.18)',
        hoverStyle: {
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderColor: 'rgba(255,255,255,0.30)',
        },
      },
      equip: {
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderColor: 'rgba(34,197,94,0.45)',
        hoverStyle: {
          backgroundColor: 'rgba(16,185,129,0.20)',
          borderColor: 'rgba(34,197,94,0.70)',
        },
      },
      unequip: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.14)',
        hoverStyle: {
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(255,255,255,0.28)',
        },
      },
    },
    affordable: {
      false: { opacity: 0.7 },
      true: {},
    },
    pending: {
      true: { opacity: 0.55 },
      false: {},
    },
  } as const,
});

function uuid(): string {
  return globalThis.crypto.randomUUID();
}

type CardAction = 'buy' | 'equip' | 'unequip';

export function ShopCard({
  item,
  owned,
  equipped,
  balance,
  small,
  priority = false,
  labels,
  onPurchaseFallback,
}: ShopCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const setHover = useShopPreviewStore((s) => s.setHover);
  const scheduleClear = useShopPreviewStore((s) => s.scheduleClear);
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(false);
  const [isPending, startTransition] = useTransition();

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

        <XStack
          position="absolute"
          top={8}
          right={8}
          gap={4}
          pointerEvents="none"
        >
          {equipped ? (
            <Chip backgroundColor={`${accent}1f`} borderColor={`${accent}66`}>
              <Text
                fontSize={9}
                letterSpacing={1}
                textTransform="uppercase"
                fontWeight="800"
                color={accent}
              >
                {labels.equipped}
              </Text>
            </Chip>
          ) : owned ? (
            <Chip
              backgroundColor="rgba(255,255,255,0.06)"
              borderColor="rgba(255,255,255,0.18)"
            >
              <Text
                fontSize={9}
                letterSpacing={1}
                textTransform="uppercase"
                fontWeight="700"
                color="$gray11"
              >
                {labels.owned}
              </Text>
            </Chip>
          ) : null}
        </XStack>
      </ArtBox>

      <YStack paddingHorizontal="$3" paddingVertical="$2" gap={6}>
        <Text
          fontSize={small ? 12 : 13}
          fontWeight="700"
          color="$white"
          numberOfLines={1}
        >
          {name}
        </Text>
        <XStack alignItems="center" justifyContent="space-between" gap={6}>
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
              {item.rarity}
            </Text>
          </Stack>
          <XStack alignItems="center" gap={4}>
            <Text fontSize={12}>{CURRENCY_GLYPH[item.priceCurrency]}</Text>
            <Text
              fontSize={12}
              fontWeight="800"
              color={CURRENCY_COLOR[item.priceCurrency]}
            >
              {formatNumber(item.priceAmount, locale)}
            </Text>
          </XStack>
        </XStack>

        <ActionButton
          intent={action}
          affordable={affordable}
          pending={isPending}
          role="button"
          tabIndex={0}
          onPress={handleAction}
          onKeyDown={handleKey}
          onFocus={handleEnter}
          onBlur={handleLeave}
          aria-disabled={isPending}
          data-testid={`shop-card-action-${item.id}`}
          data-affordable={affordable ? 'true' : 'false'}
        >
          <Text
            fontSize={11}
            letterSpacing={0.8}
            textTransform="uppercase"
            fontWeight="800"
            color="$white"
          >
            {actionLabel}
          </Text>
        </ActionButton>
      </YStack>
    </CardFrame>
  );
}
