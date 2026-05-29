'use client';

import { useMemo } from 'react';
import { XStack, Text } from 'tamagui';
import { PlayerAvatar } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { RARITY_GLOW } from '../lib/rarity';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

export interface ShopMannequinStageLabels {
  tryOn: string;
  stage: { level: string; online: string };
}

export interface ShopMannequinStageProps {
  preview: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  hoverItem: EffectiveShopItem | null;
  displayName: string;
  /** When null/undefined (e.g. no BE level data yet) the badge shows just "Online". */
  level: number | null;
  labels: ShopMannequinStageLabels;
}

export function ShopMannequinStage({
  preview,
  hoverItem,
  displayName,
  level,
  labels,
}: ShopMannequinStageProps) {
  const { t } = useTranslation();
  const avatar = preview.avatar ?? null;
  const badge = preview.badge ?? null;
  const nameColor = preview.name_color ?? null;
  const skin = preview.game_skin ?? null;
  const banner = preview.banner ?? null;
  const aura = preview.aura ?? null;
  const frame = preview.frame ?? null;
  const background = preview.background ?? null;

  const rarityGlow = useMemo(() => {
    const focus = hoverItem ?? avatar ?? badge ?? skin ?? nameColor;
    return focus ? RARITY_GLOW[focus.rarity] : null;
  }, [hoverItem, avatar, badge, skin, nameColor]);

  const skinChip = skin
    ? {
        id: skin.id,
        label: String(t(`pages.shop.${skin.nameKey}` as TranslationKey)),
        prefix: t('common.cosmetics.skin'),
      }
    : null;

  const hoverName = hoverItem
    ? String(t(`pages.shop.${hoverItem.nameKey}` as TranslationKey))
    : '';

  const presenceLine =
    level !== null && level !== undefined && Number.isFinite(level)
      ? labels.stage.level.replace('{level}', String(level))
      : labels.stage.online;

  const topLeftOverlay = hoverItem ? (
    <XStack
      alignItems="center"
      gap={6}
      paddingHorizontal={8}
      paddingVertical={4}
      borderRadius={6}
      borderWidth={1}
      borderColor="rgba(34,197,94,0.55)"
      backgroundColor="rgba(16,185,129,0.10)"
    >
      <XStack width={6} height={6} borderRadius={3} backgroundColor="#22c55e" />
      <Text
        fontSize={10}
        letterSpacing={1}
        textTransform="uppercase"
        fontWeight="800"
        color="$green11"
      >
        {labels.tryOn}
      </Text>
      <Text fontSize={11} color="$gray11">
        · {hoverName}
      </Text>
    </XStack>
  ) : null;

  // Signature of the previewed look — when it changes, the wrapper remounts and
  // replays the `shop-morph` animation so the mannequin cross-fades on swap.
  const morphKey = [
    avatar,
    badge,
    frame,
    aura,
    background,
    banner,
    nameColor,
    skin,
  ]
    .map((i) => i?.id ?? '-')
    .join('|');

  return (
    <div key={morphKey} className="shop-stage-morph">
      <PlayerAvatar
        data-testid="shop-stage"
        name={displayName}
        size="profile"
        avatarUrl={avatar?.assetUrl ?? null}
        badgeUrl={badge?.assetUrl ?? null}
        frameColor={frame?.colorValue ?? null}
        auraColor={aura?.colorValue ?? null}
        backgroundColor={background?.colorValue ?? null}
        bannerColor={banner?.colorValue ?? null}
        nameColor={nameColor?.colorValue ?? null}
        rarityGlow={rarityGlow}
        skinChip={skinChip}
        topLeftOverlay={topLeftOverlay}
        presenceLine={presenceLine}
        priority
      />
    </div>
  );
}
