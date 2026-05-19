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

// Extract a single representative color from a colorValue (hex or
// linear-gradient string). The rays/halo need a solid CSS color, not a
// gradient, so for gradient values we pluck the first hex and use that.
function pickSwatchColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/#[0-9a-fA-F]{3,8}/);
  if (match) return match[0];
  return value.includes('gradient') ? null : value;
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

  // Aura wins over rarity-derived glow when equipped/hovered. Falls back to
  // the focused item's rarity glow when no aura is selected so the stage
  // still feels alive (matches the old behavior).
  const accentGlow = useMemo(() => {
    const auraColor = pickSwatchColor(aura?.colorValue ?? null);
    if (auraColor) return auraColor;
    const focus = hoverItem ?? avatar ?? badge ?? skin ?? nameColor;
    return focus ? RARITY_GLOW[focus.rarity] : 'rgba(96,165,250,0.25)';
  }, [aura, hoverItem, avatar, badge, skin, nameColor]);

  // Banner drives the full stage backdrop. Solid colorValue → backgroundColor;
  // a linear-gradient value → backgroundImage. Fallback preserves the
  // default dark-navy wash so the stage doesn't look broken bare.
  const stageBg = useMemo<React.CSSProperties>(() => {
    const value = banner?.colorValue;
    if (!value) return { backgroundColor: 'rgba(15,23,42,0.55)' };
    return value.includes('gradient')
      ? { backgroundImage: value }
      : { backgroundColor: value };
  }, [banner]);

  // Frame drives the avatar disc. Solid hex → both fill and a stronger
  // border accent; gradient → fill only (border falls back to the
  // translucent default). Without a frame the disc stays its old
  // translucent-white wash so the stage degrades gracefully.
  const frameStyle = useMemo<React.CSSProperties>(() => {
    const value = frame?.colorValue;
    if (!value) {
      return {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.18)',
      };
    }
    if (value.includes('gradient')) {
      return { backgroundImage: value };
    }
    return { backgroundColor: value, borderColor: value };
  }, [frame]);

  const raysBg = useMemo<React.CSSProperties>(() => {
    // 12 narrow rays evenly spaced every 30°. The previous 4-wide-spike
    // layout read as a rotating X / square corners; a 12-spike halo reads
    // as a soft shimmer, with no obvious "shape" rotating.
    //
    // Anchor: `50% 41%` — the avatar circle's vertical center inside a
    // 280-tall stage (content stack is ~188 tall, centered → avatar
    // center sits ~115 px from the top). Conic, mask, and transform-origin
    // share this anchor so the rotation orbit is centered on the avatar.
    const stops: string[] = [];
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const peak = (i * 360) / steps;
      const valley = peak + 360 / steps / 2;
      stops.push(`${accentGlow} ${peak}deg`);
      stops.push(`transparent ${valley}deg`);
    }
    stops.push(`${accentGlow} 360deg`);
    return {
      backgroundImage: `conic-gradient(from 0deg at 50% 41%, ${stops.join(', ')})`,
    };
  }, [accentGlow]);

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
    <StageFrame
      data-testid="shop-stage"
      data-banner={banner?.id ?? ''}
      style={stageBg}
    >
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
          borderWidth={2}
          position="relative"
          overflow="hidden"
          style={{
            ...frameStyle,
            boxShadow: `0 0 56px ${accentGlow}`,
          }}
          data-testid="shop-stage-avatar"
          data-frame={frame?.id ?? ''}
          data-aura={aura?.id ?? ''}
        >
          {avatar ? (
            <ItemAsset item={avatar} size={108} priority />
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
              <ItemAsset item={badge} size={28} priority />
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
