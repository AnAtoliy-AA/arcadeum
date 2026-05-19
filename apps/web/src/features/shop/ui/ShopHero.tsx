'use client';

import { useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, XStack, YStack } from '@arcadeum/ui';
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
import { CURRENCY_GLYPH } from '../lib/currency';
import { equipItemAction, unequipItemAction } from '../server/shop.actions';
import { syncEquippedToSession } from '../lib/syncEquippedToSession';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem } from '../server/shop.types';

// `endsAtIso` was on this component to drive a countdown, but the BE has no
// scheduled-drop concept yet — every featured drop comes back with `endsAtIso:
// null`. Half-shipped UI that we know never lights up is worse than no UI, so
// the countdown and its prop are gone until BE adds an `endsAt` on shop items.

export interface ShopHeroLabels {
  tag: string;
  tryOn: string;
  buyNow: string;
  bodySuffix: string;
  equip: string;
  unequip: string;
  equipped: string;
}

export interface ShopHeroProps {
  item: EffectiveShopItem;
  owned: boolean;
  equipped: boolean;
  labels: ShopHeroLabels;
  onBuyClick?: (item: EffectiveShopItem) => void;
}

const HeroFrame = styled(Stack, {
  name: 'ShopHeroFrame',
  width: '100%',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  paddingHorizontal: '$5',
  paddingVertical: '$5',
  overflow: 'hidden',
  position: 'relative',
});

const HeroTag = styled(Stack, {
  name: 'ShopHeroTag',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: '$2',
  borderWidth: 1,
  alignSelf: 'flex-start',
});

type HeroAction = 'buy' | 'equip' | 'unequip';

export function ShopHero({
  item,
  owned,
  equipped,
  labels,
  onBuyClick,
}: ShopHeroProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const setHover = useShopPreviewStore((s) => s.setHover);
  const [isPending, startTransition] = useTransition();

  const itemName = String(
    t(`pages.shop.${item.nameKey}` as TranslationKey),
  ) as string;
  const itemDesc = String(
    t(`pages.shop.${item.descKey}` as TranslationKey),
  ) as string;

  const accent = RARITY_COLOR[item.rarity];
  const glow = RARITY_GLOW[item.rarity];

  const bgStyle = useMemo<React.CSSProperties>(
    () => ({
      backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${glow}, transparent 60%), radial-gradient(80% 60% at 0% 100%, rgba(15,23,42,0.6), transparent 70%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(2,6,23,0.85))`,
    }),
    [glow],
  );

  const handleHoverOn = () => {
    setHover(item);
    track('shop.preview.try_on', {
      itemId: item.id,
      rarity: item.rarity,
      category: item.category,
      source: 'hero',
    });
  };
  const handleHoverOff = () => setHover(null);

  // Action mapping mirrors ShopCard: equipped → Unequip, owned-but-not
  // → Equip, otherwise → Buy now. Without this, the Buy button on the
  // featured drop always opens the purchase dialog for an item the user
  // already owns, and the BE's defensive short-circuit silently no-ops
  // the click — the user has no idea why nothing visible changed.
  const action: HeroAction = equipped ? 'unequip' : owned ? 'equip' : 'buy';

  const handleBuy = () => {
    track('shop.purchase.click', {
      itemId: item.id,
      currency: item.priceCurrency,
      amount: item.priceAmount,
      source: 'hero',
    });
    onBuyClick?.(item);
  };

  const handleEquip = () => {
    if (isPending) return;
    track('shop.equip', { itemId: item.id, source: 'hero' });
    startTransition(async () => {
      const result = await equipItemAction(item.id);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
    });
  };

  const handleUnequip = () => {
    if (isPending) return;
    track('shop.unequip', { category: item.category, source: 'hero' });
    startTransition(async () => {
      const result = await unequipItemAction(item.category);
      if (result.ok) {
        syncEquippedToSession(result.data);
        router.refresh();
      }
    });
  };

  const handleActionPress = () => {
    if (action === 'unequip') handleUnequip();
    else if (action === 'equip') handleEquip();
    else handleBuy();
  };

  const actionLabel =
    action === 'unequip'
      ? labels.unequip
      : action === 'equip'
        ? labels.equip
        : labels.buyNow;

  const actionTestId =
    action === 'unequip'
      ? 'shop-hero-unequip'
      : action === 'equip'
        ? 'shop-hero-equip'
        : 'shop-hero-buy';

  return (
    <YStack
      id="shop-featured"
      data-testid="shop-hero"
      data-rarity={item.rarity}
      data-owned={owned ? 'true' : 'false'}
      data-equipped={equipped ? 'true' : 'false'}
      data-action={action}
      onPointerEnter={handleHoverOn}
      onPointerLeave={handleHoverOff}
    >
      <HeroFrame style={bgStyle}>
        <XStack
          gap="$5"
          alignItems="center"
          $sm={{ flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <Stack
            width={140}
            height={140}
            borderRadius={70}
            alignItems="center"
            justifyContent="center"
            backgroundColor="rgba(255,255,255,0.04)"
            borderWidth={2}
            borderColor={`${accent}66`}
            style={{ boxShadow: `0 0 48px ${glow}` }}
          >
            <ItemAsset item={item} size={108} priority />
          </Stack>

          <YStack flex={1} gap="$3" minWidth={0}>
            <XStack gap="$2" alignItems="center" flexWrap="wrap">
              <HeroTag
                backgroundColor={`${accent}1a`}
                borderColor={`${accent}55`}
              >
                <Stack
                  width={6}
                  height={6}
                  borderRadius={3}
                  backgroundColor={accent}
                />
                <Text
                  fontSize={11}
                  letterSpacing={1.5}
                  textTransform="uppercase"
                  fontWeight="800"
                  color={accent}
                >
                  {labels.tag}
                </Text>
              </HeroTag>
              {equipped ? (
                <HeroTag
                  backgroundColor={`${accent}1a`}
                  borderColor={`${accent}55`}
                  data-testid="shop-hero-equipped-chip"
                >
                  <Text
                    fontSize={11}
                    letterSpacing={1.5}
                    textTransform="uppercase"
                    fontWeight="800"
                    color={accent}
                  >
                    {labels.equipped}
                  </Text>
                </HeroTag>
              ) : null}
            </XStack>

            <YStack gap="$1">
              <Text
                fontSize="$10"
                fontWeight="900"
                letterSpacing={-1}
                color="$white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent}, #ffffff)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {itemName}
              </Text>
              <Text fontSize="$4" color="$gray11" maxWidth={640}>
                {itemDesc} {labels.bodySuffix}
              </Text>
            </YStack>

            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button
                onPress={handleActionPress}
                disabled={isPending}
                data-testid={actionTestId}
                data-action={action}
                style={{
                  backgroundImage:
                    action === 'buy'
                      ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
                      : undefined,
                  borderColor: accent,
                }}
              >
                <Text
                  fontSize="$4"
                  fontWeight="800"
                  color={action === 'buy' ? '#0a0a0a' : '$white'}
                >
                  {actionLabel}
                </Text>
                {action === 'buy' ? (
                  <Text fontSize="$3" fontWeight="700" color="#0a0a0a">
                    · {CURRENCY_GLYPH[item.priceCurrency]}{' '}
                    {formatNumber(item.priceAmount, locale)}
                  </Text>
                ) : null}
              </Button>
              <Link href="#shop-rail" style={{ textDecoration: 'none' }}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap={6}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.14)"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: 'rgba(255,255,255,0.32)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={handleHoverOn}
                  onMouseLeave={handleHoverOff}
                  data-testid="shop-hero-tryon"
                >
                  <Text fontSize="$3" fontWeight="700" color="$white">
                    {labels.tryOn} →
                  </Text>
                </Stack>
              </Link>
            </XStack>
          </YStack>
        </XStack>
      </HeroFrame>
    </YStack>
  );
}
