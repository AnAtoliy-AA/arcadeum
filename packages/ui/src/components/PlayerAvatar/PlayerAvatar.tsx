'use client';

import { memo } from 'react';
import { Text, View, YStack } from 'tamagui';
import { Avatar } from '../Avatar/Avatar';

export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

export interface PlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize;
  avatarUrl?: string | null;
  badgeUrl?: string | null;
  frameColor?: string | null;
  auraColor?: string | null;
  /** Fallback halo color when no aura is set. Hex/rgba string. */
  rarityGlow?: string | null;
  bannerColor?: string | null;
  nameColor?: string | null;
  level?: number | null;
  presenceLine?: string;
  priority?: boolean;
  /** Resolved skin item label for the SKIN chip. Only rendered at card/profile. */
  skinChip?: { id: string; label: string } | null;
  /** Overlay rendered top-left (used by shop for the TRY-ON tag). card/profile only. */
  topLeftOverlay?: React.ReactNode;
  'data-testid'?: string;
  onPress?: () => void;
}

const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 28,
  sm: 40,
  md: 72,
  lg: 140,
  card: 140,
  profile: 140,
};
const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 14,
  md: 24,
  lg: 36,
  card: 36,
  profile: 44,
};
const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 2,
  md: 3,
  lg: 3,
  card: 3,
  profile: 2,
};

function pickSwatchColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/#[0-9a-fA-F]{3,8}/);
  if (match) return match[0];
  return value.includes('gradient') ? null : value;
}

function isGradient(value: string | null | undefined): boolean {
  return !!value && value.includes('gradient');
}

// The 12-spike conic gradient + circular mask. Positioning is applied at the
// render site so the halo can be centered on the avatar disc regardless of
// the surrounding layout (the disc sits above the name in card chrome).
function buildRaysStyle(raysColor: string | null): React.CSSProperties | null {
  if (!raysColor) return null;
  const stops: string[] = [];
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const peak = (i * 360) / steps;
    const valley = peak + 360 / steps / 2;
    stops.push(`${raysColor} ${peak}deg`);
    stops.push(`transparent ${valley}deg`);
  }
  stops.push(`${raysColor} 360deg`);
  return {
    opacity: 0.55,
    pointerEvents: 'none',
    backgroundImage: `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`,
    WebkitMaskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 60%, transparent 100%)',
    maskImage:
      'radial-gradient(circle closest-side at 50% 50%, black 0%, black 60%, transparent 100%)',
  };
}

interface RaysHaloProps {
  style: React.CSSProperties;
  testId?: string;
  /** Halo diameter in px — centered on the avatar disc. */
  haloSize: number;
}

// A square ray layer centered on the disc center via 50%/translate, so the
// glow radiates symmetrically around the avatar no matter where the disc sits
// in its parent. Sits behind the disc (the disc paints over the masked center).
function RaysHalo({ style, testId, haloSize }: RaysHaloProps) {
  return (
    <View
      position="absolute"
      top="50%"
      left="50%"
      width={haloSize}
      height={haloSize}
      pointerEvents="none"
      data-testid={testId}
      style={{ ...style, transform: 'translate(-50%, -50%)' }}
    />
  );
}

export const PlayerAvatar = memo(function PlayerAvatar({
  name,
  size = 'sm',
  avatarUrl,
  badgeUrl,
  frameColor,
  auraColor,
  rarityGlow,
  bannerColor,
  nameColor,
  presenceLine,
  priority,
  skinChip,
  topLeftOverlay,
  'data-testid': testId,
  onPress,
}: PlayerAvatarProps) {
  const disc = DISC_SIZE[size];
  const badge = BADGE_SIZE[size];
  const ring = RING_WIDTH[size];

  const showBadge = size !== 'icon' && !!badgeUrl;
  const showFrame = size !== 'icon' && !!frameColor;
  const showAura =
    (size === 'md' || size === 'card' || size === 'profile') && !!auraColor;
  const showCardChrome = size === 'card' || size === 'profile';
  const showRays =
    (size === 'md' ||
      size === 'lg' ||
      size === 'card' ||
      size === 'profile') &&
    (!!auraColor || !!rarityGlow);
  const raysColor =
    pickSwatchColor(auraColor ?? null) ?? pickSwatchColor(rarityGlow ?? null);

  const raysBg = buildRaysStyle(raysColor);

  const ringHexBackground = showFrame
    ? isGradient(frameColor)
      ? {
          backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), ${frameColor}`,
          borderColor: pickSwatchColor(frameColor) ?? 'rgba(255,255,255,0.35)',
        }
      : {
          backgroundColor: `${frameColor}33`,
          borderColor: frameColor as string,
        }
    : {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.18)',
      };

  // Soft bloom under the disc. Driven by the same color as the rays (aura,
  // falling back to rarity glow) so an equipped aura and a hovered shop item
  // both light the avatar.
  const glowColor = showRays ? raysColor : null;
  // Halo reaches well past the disc on the hero card sizes; tighter on inline
  // sizes so list rows don't bloom into their neighbours.
  const haloSize = Math.round(disc * (showCardChrome ? 2.6 : 1.9));

  const bannerStyle: React.CSSProperties | undefined =
    showCardChrome && bannerColor
      ? isGradient(bannerColor)
        ? { backgroundImage: bannerColor }
        : { backgroundColor: bannerColor }
      : undefined;

  const innerImage = Math.round(disc * 0.78);

  const inner = (
    <YStack
      width={disc}
      height={disc}
      borderRadius={disc / 2}
      alignItems="center"
      justifyContent="center"
      borderWidth={showFrame ? ring : 0}
      position="relative"
      style={{
        ...(showFrame ? ringHexBackground : {}),
        ...(glowColor
          ? { boxShadow: `0 0 ${Math.round(disc * 0.4)}px ${glowColor}` }
          : {}),
      }}
      data-testid={testId ? `${testId}-disc` : undefined}
    >
      {showFrame ? (
        <View
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          borderRadius={disc / 2}
          pointerEvents="none"
          data-testid={testId ? `${testId}-frame` : undefined}
        />
      ) : null}
      {showAura ? (
        <View
          position="absolute"
          top={-Math.round(disc * 0.15)}
          right={-Math.round(disc * 0.15)}
          bottom={-Math.round(disc * 0.15)}
          left={-Math.round(disc * 0.15)}
          borderRadius={disc}
          pointerEvents="none"
          data-testid={testId ? `${testId}-aura` : undefined}
        />
      ) : null}
      <Avatar
        name={name}
        src={avatarUrl ?? undefined}
        size="sm"
        priority={priority}
        style={{ width: innerImage, height: innerImage }}
      />
      {showBadge ? (
        <View
          position="absolute"
          bottom={-Math.round(badge * 0.2)}
          right={-Math.round(badge * 0.2)}
          width={badge}
          height={badge}
          borderRadius={badge / 2}
          backgroundColor="rgba(2,6,23,0.85)"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.20)"
          alignItems="center"
          justifyContent="center"
          data-testid={testId ? `${testId}-badge` : undefined}
        >
          <img
            src={badgeUrl as string}
            alt=""
            width={Math.round(badge * 0.75)}
            height={Math.round(badge * 0.75)}
            style={{ objectFit: 'contain' }}
          />
        </View>
      ) : null}
    </YStack>
  );

  // Disc + its halo. The rays sit behind the disc and are centered on the disc
  // center, so the glow radiates symmetrically around the avatar regardless of
  // any sibling content (name/presence) below it.
  const discZone = (
    <YStack
      width={disc}
      height={disc}
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {showRays && raysBg ? (
        <RaysHalo
          style={raysBg}
          testId={testId ? `${testId}-rays` : undefined}
          haloSize={haloSize}
        />
      ) : null}
      {inner}
    </YStack>
  );

  if (!showCardChrome) {
    return (
      <YStack
        data-testid={testId}
        onPress={onPress}
        cursor={onPress ? 'pointer' : 'default'}
        alignItems="center"
        justifyContent="center"
      >
        {discZone}
      </YStack>
    );
  }

  return (
    <YStack
      data-testid={testId}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
      width={size === 'profile' ? '100%' : 220}
      minHeight={size === 'profile' ? 280 : undefined}
      borderRadius="$5"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.08)"
      paddingHorizontal="$4"
      paddingVertical="$4"
      alignItems="center"
      justifyContent="center"
      gap="$3"
      overflow="hidden"
      style={bannerStyle ?? { backgroundColor: 'rgba(15,23,42,0.55)' }}
    >
      {bannerStyle ? (
        <View
          width={0}
          height={0}
          data-testid={testId ? `${testId}-banner` : undefined}
        />
      ) : null}
      {topLeftOverlay ? (
        <View
          position="absolute"
          top={12}
          left={12}
          zIndex={2}
          pointerEvents="auto"
        >
          {topLeftOverlay}
        </View>
      ) : null}
      {skinChip ? (
        <View
          position="absolute"
          top={12}
          right={12}
          zIndex={2}
          paddingHorizontal={8}
          paddingVertical={4}
          borderRadius={6}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.16)"
          backgroundColor="rgba(0,0,0,0.4)"
          data-testid={testId ? `${testId}-skin` : undefined}
        >
          <Text
            fontSize={9}
            letterSpacing={1}
            textTransform="uppercase"
            color="$gray11"
            fontWeight="800"
          >
            SKIN · {skinChip.label}
          </Text>
        </View>
      ) : null}
      {discZone}
      <YStack alignItems="center" gap={4}>
        <Text
          fontSize="$6"
          fontWeight="900"
          color={nameColor && !isGradient(nameColor) ? nameColor : '$white'}
          data-testid={testId ? `${testId}-name` : undefined}
          {...(nameColor && isGradient(nameColor)
            ? {
                style: {
                  background: nameColor,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                },
              }
            : {})}
        >
          {name}
        </Text>
        {presenceLine ? (
          <Text
            fontSize={10}
            letterSpacing={2}
            textTransform="uppercase"
            color="$gray11"
            fontWeight="700"
          >
            {presenceLine}
          </Text>
        ) : null}
      </YStack>
    </YStack>
  );
});
