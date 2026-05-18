'use client';

import { useMemo } from 'react';
import { YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { nameColorRenderProps } from '../lib/nameColor';
import { RARITY_GLOW } from '../lib/rarity';
import { ItemAsset } from './ItemAsset';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';
import stageStyles from './ShopMannequinStage.module.css';

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

const StageFrame = styled(Stack, {
  name: 'ShopStageFrame',
  position: 'relative',
  width: '100%',
  minHeight: 280,
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  paddingHorizontal: '$4',
  paddingVertical: '$4',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: 'rgba(15,23,42,0.55)',
});

const RaysLayer = styled(Stack, {
  name: 'ShopStageRays',
  position: 'absolute',
  inset: 0,
  opacity: 0.5,
  pointerEvents: 'none',
});

const TryOnTag = styled(Stack, {
  name: 'ShopStageTryOnTag',
  position: 'absolute',
  top: 12,
  left: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: 'rgba(34,197,94,0.55)',
  backgroundColor: 'rgba(16,185,129,0.10)',
});

const SkinChip = styled(Stack, {
  name: 'ShopStageSkinChip',
  position: 'absolute',
  top: 12,
  right: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.16)',
  backgroundColor: 'rgba(0,0,0,0.4)',
});

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

  const accentGlow = useMemo(() => {
    const focus = hoverItem ?? avatar ?? badge ?? skin ?? nameColor;
    return focus ? RARITY_GLOW[focus.rarity] : 'rgba(96,165,250,0.25)';
  }, [hoverItem, avatar, badge, skin, nameColor]);

  const raysBg = useMemo<React.CSSProperties>(
    () => ({
      backgroundImage: `conic-gradient(from 0deg at 50% 60%, transparent 0deg, ${accentGlow} 30deg, transparent 60deg, ${accentGlow} 120deg, transparent 150deg, ${accentGlow} 210deg, transparent 240deg, ${accentGlow} 300deg, transparent 360deg)`,
    }),
    [accentGlow],
  );

  const nameProps = nameColor
    ? nameColorRenderProps(nameColor.colorValue ?? null)
    : null;

  const hoverName = hoverItem
    ? String(t(`pages.shop.${hoverItem.nameKey}` as TranslationKey))
    : '';

  const skinName = skin
    ? String(t(`pages.shop.${skin.nameKey}` as TranslationKey))
    : '';

  const presenceLine =
    level !== null && level !== undefined && Number.isFinite(level)
      ? labels.stage.level.replace('{level}', String(level))
      : labels.stage.online;

  return (
    <StageFrame data-testid="shop-stage">
      <RaysLayer className={stageStyles.rays} style={raysBg} />

      {hoverItem ? (
        <TryOnTag>
          <Stack
            width={6}
            height={6}
            borderRadius={3}
            backgroundColor="#22c55e"
          />
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
        </TryOnTag>
      ) : null}

      {skin ? (
        <SkinChip data-testid="shop-stage-skin-chip">
          <Text
            fontSize={9}
            letterSpacing={1}
            textTransform="uppercase"
            color="$gray11"
            fontWeight="800"
          >
            SKIN · {skinName}
          </Text>
        </SkinChip>
      ) : null}

      <YStack alignItems="center" gap="$3" zIndex={1}>
        <Stack
          width={140}
          height={140}
          borderRadius={70}
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(255,255,255,0.04)"
          borderWidth={2}
          borderColor="rgba(255,255,255,0.18)"
          position="relative"
          style={{ boxShadow: `0 0 56px ${accentGlow}` }}
          data-testid="shop-stage-avatar"
        >
          {avatar ? (
            <ItemAsset item={avatar} size={108} />
          ) : (
            <Text fontSize={64} color="$gray10">
              ◉
            </Text>
          )}

          {badge ? (
            <Stack
              position="absolute"
              bottom={-6}
              right={-6}
              width={44}
              height={44}
              borderRadius={22}
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgba(2,6,23,0.85)"
              borderWidth={2}
              borderColor="rgba(255,255,255,0.20)"
              data-testid="shop-stage-badge"
            >
              <ItemAsset item={badge} size={28} />
            </Stack>
          ) : null}
        </Stack>

        <YStack alignItems="center" gap={4}>
          <Text
            fontSize="$6"
            fontWeight="900"
            letterSpacing={-0.3}
            color="$white"
            data-testid="shop-stage-name"
            {...(nameProps ?? {})}
          >
            {displayName}
          </Text>
          <Text
            fontSize={10}
            letterSpacing={2}
            textTransform="uppercase"
            color="$gray11"
            fontWeight="700"
            data-testid="shop-stage-presence"
          >
            {presenceLine}
          </Text>
        </YStack>
      </YStack>
    </StageFrame>
  );
}
