'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { RARITY_COLOR, RARITY_GLOW } from '../lib/rarity';
import { CURRENCY_GLYPH } from '../lib/currency';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem } from '../server/shop.types';

export interface ShopHeroLabels {
  tag: string;
  ends: string;
  tryOn: string;
  buyNow: string;
  bodySuffix: string;
}

export interface ShopHeroProps {
  item: EffectiveShopItem;
  endsAtIso: string | null;
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

function formatCountdown(targetIso: string, now: number): string {
  const target = new Date(targetIso).getTime();
  const remaining = Math.max(0, target - now);
  const d = Math.floor(remaining / 86_400_000);
  const h = Math.floor((remaining / 3_600_000) % 24);
  const m = Math.floor((remaining / 60_000) % 60);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

export function ShopHero({
  item,
  endsAtIso,
  labels,
  onBuyClick,
}: ShopHeroProps) {
  const { t } = useTranslation();
  const setHover = useShopPreviewStore((s) => s.setHover);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAtIso) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAtIso]);

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

  const handleHoverOn = () => setHover(item);
  const handleHoverOff = () => setHover(null);

  return (
    <YStack
      id="shop-featured"
      data-testid="shop-hero"
      data-rarity={item.rarity}
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
            <ItemAsset item={item} size={108} />
          </Stack>

          <YStack flex={1} gap="$3" minWidth={0}>
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
              {endsAtIso ? (
                <Text fontSize={11} color="$gray11" letterSpacing={0.5}>
                  ·{' '}
                  {labels.ends.replace(
                    '{time}',
                    formatCountdown(endsAtIso, now),
                  )}
                </Text>
              ) : null}
            </HeroTag>

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
                onPress={() => onBuyClick?.(item)}
                data-testid="shop-hero-buy"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  borderColor: accent,
                }}
              >
                <Text fontSize="$4" fontWeight="800" color="#0a0a0a">
                  {labels.buyNow}
                </Text>
                <Text fontSize="$3" fontWeight="700" color="#0a0a0a">
                  · {CURRENCY_GLYPH[item.priceCurrency]}{' '}
                  {item.priceAmount.toLocaleString()}
                </Text>
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
