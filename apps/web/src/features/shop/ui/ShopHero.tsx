'use client';

import { useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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

function HeroFrame({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={style}
      className={cx(
        'w-full px-5 py-5 rounded-3xl border border-[rgba(255,255,255,0.08)] overflow-hidden relative shrink-0 max-[800px]:min-h-[400px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function HeroTag({
  backgroundColor,
  borderColor,
  className,
  'data-testid': dataTestId,
  children,
}: {
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-row items-center gap-2 px-[10px] py-1 rounded-lg border self-start',
        className,
      )}
      style={{ backgroundColor, borderColor }}
    >
      {children}
    </div>
  );
}

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
    <div
      className="flex flex-col items-stretch"
      id="shop-featured"
      data-testid="shop-hero"
      data-rarity={item.rarity}
      data-owned={owned ? 'true' : 'false'}
      data-equipped={equipped ? 'true' : 'false'}
      data-action={action}
      onPointerEnter={handleHoverOn}
      onPointerLeave={handleHoverOff}
    >
      <HeroFrame className="animate-entrance" style={bgStyle}>
        <div className="flex flex-row gap-5 items-center max-[660px]:flex-col max-[660px]:items-start max-[660px]:gap-3 max-[800px]:flex-col max-[800px]:items-start max-[800px]:gap-3">
          <div
            className="flex flex-col w-[140px] h-[140px] rounded-[70px] items-center justify-center bg-[rgba(255,255,255,0.04)] border-[2px] shop-featured-disc"
            style={{ borderColor: `${accent}66` }}
          >
            <ItemAsset item={item} size={108} priority />
          </div>

          <div className="flex flex-col items-stretch flex-1 gap-3 min-w-0">
            <div className="flex flex-row gap-2 items-center flex-wrap">
              <HeroTag
                backgroundColor={`${accent}1a`}
                borderColor={`${accent}55`}
              >
                <div
                  className="flex flex-col items-stretch w-[6px] h-[6px] rounded-xl"
                  style={{ backgroundColor: accent }}
                />
                <Typography
                  uiSize="xs"
                  weight="800"
                  color={accent}
                  tracking="lg"
                  className="uppercase"
                >
                  {labels.tag}
                </Typography>
              </HeroTag>
              {equipped ? (
                <HeroTag
                  backgroundColor={`${accent}1a`}
                  borderColor={`${accent}55`}
                  data-testid="shop-hero-equipped-chip"
                >
                  <Typography
                    uiSize="xs"
                    weight="800"
                    color={accent}
                    tracking="lg"
                    className="uppercase"
                  >
                    {labels.equipped}
                  </Typography>
                </HeroTag>
              ) : null}
            </div>

            <div className="flex flex-col items-stretch gap-1">
              <Typography
                uiSize="xl"
                variant="heading"
                color="#f5f7ff"
                className="max-w-[640px]"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accent}, #ffffff)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {itemName}
              </Typography>
              <Typography uiSize="lg" color="#94a3b8" className="max-w-[640px]">
                {itemDesc} {labels.bodySuffix}
              </Typography>
            </div>

            <div className="flex flex-row gap-3 items-center flex-wrap">
              <Button
                className={action === 'buy' ? 'hero-gold-pulse' : undefined}
                style={{
                  backgroundImage:
                    action === 'buy'
                      ? `linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)`
                      : undefined,
                  borderColor: action === 'buy' ? '#f59e0b' : accent,
                }}
                onClick={handleActionPress}
                disabled={isPending}
                data-testid={actionTestId}
                data-action={action}
                size="sm"
              >
                <Typography
                  uiSize="md"
                  weight="800"
                  color={action === 'buy' ? '#0a0a0a' : '#f5f7ff'}
                >
                  {actionLabel}
                </Typography>
                {action === 'buy' ? (
                  <Typography uiSize="sm" weight="700" color="#0a0a0a">
                    · {CURRENCY_GLYPH[item.priceCurrency]}{' '}
                    {formatNumber(item.priceAmount, locale)}
                  </Typography>
                ) : null}
              </Button>
              <Link href="#shop-rail" style={{ textDecoration: 'none' }}>
                <div
                  className="flex flex-row items-center gap-6 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] cursor-pointer hover:border-[rgba(255,255,255,0.32)] hover:bg-[rgba(255,255,255,0.04)]"
                  onMouseEnter={handleHoverOn}
                  onMouseLeave={handleHoverOff}
                  data-testid="shop-hero-tryon"
                >
                  <Typography uiSize="md" weight="700" color="#f5f7ff">
                    {labels.tryOn} →
                  </Typography>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </HeroFrame>
    </div>
  );
}
