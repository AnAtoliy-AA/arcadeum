'use client';

import { memo } from 'react';
import { Text, View, YStack } from 'tamagui';

export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

const RAYS_SPIN_CLASS = 'arcadeum-player-avatar-rays-spin';

// Inject the rays-spin keyframes once on the client. packages/ui has no CSS
// module pipeline, so the slow halo rotation (matching the old shop preview)
// lives in a single injected stylesheet. The keyframe keeps the centering
// translate so the halo stays locked on the avatar while it spins, and a
// reduced-motion query disables the animation.
function ensureRaysKeyframes(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(RAYS_SPIN_CLASS)) return;
  const style = document.createElement('style');
  style.id = RAYS_SPIN_CLASS;
  style.textContent = `
@keyframes ${RAYS_SPIN_CLASS} {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.${RAYS_SPIN_CLASS} {
  animation: ${RAYS_SPIN_CLASS} 28s linear infinite;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .${RAYS_SPIN_CLASS} { animation: none; }
}`;
  document.head.appendChild(style);
}

ensureRaysKeyframes();

export interface PlayerAvatarProps {
  name: string;
  size?: PlayerAvatarSize;
  avatarUrl?: string | null;
  badgeUrl?: string | null;
  frameColor?: string | null;
  auraColor?: string | null;
  /** Fallback halo color when no aura is set. Hex/rgba string. */
  rarityGlow?: string | null;
  /** Equipped avatar-background wash (hex or linear-gradient). Overrides the
   *  frame-derived backdrop behind the avatar art when set. */
  backgroundColor?: string | null;
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
  icon: 12,
  sm: 14,
  md: 24,
  lg: 44,
  card: 44,
  profile: 56,
};
const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 2,
  sm: 2,
  md: 3,
  lg: 3,
  card: 3,
  profile: 2,
};

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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
      className={RAYS_SPIN_CLASS}
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
  backgroundColor,
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

  // Every size renders the full set of disc-level cosmetics (badge, frame,
  // aura/rays, background). Only the chrome wrapper — banner backdrop, name
  // label, skin chip — stays gated to the card/profile presentations, since
  // those need a name to sit on. Banner is therefore "biggest only".
  const showBadge = !!badgeUrl;
  const showFrame = !!frameColor;
  const showAura = !!auraColor;
  const showCardChrome = size === 'card' || size === 'profile';
  const showRays = !!auraColor || !!rarityGlow;
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
        // No frame equipped: still paint a base disc (slate fill + faint ring)
        // so initials sit on a visible circle instead of floating as bare
        // letters. Bots/guests with no cosmetics rely on this.
        backgroundColor: 'rgba(15,23,42,0.55)',
        borderColor: 'rgba(255,255,255,0.22)',
      };

  // Soft bloom under the disc. Driven by the same color as the rays (aura,
  // falling back to rarity glow) so an equipped aura and a hovered shop item
  // both light the avatar.
  const glowColor = showRays ? raysColor : null;
  // Halo reaches past the disc on the hero card sizes; tighter on inline
  // sizes so list rows don't bloom into their neighbours.
  const haloSize = Math.round(disc * (showCardChrome ? 1.75 : 1.45));

  const bannerStyle: React.CSSProperties | undefined =
    showCardChrome && bannerColor
      ? isGradient(bannerColor)
        ? { backgroundImage: bannerColor }
        : { backgroundColor: bannerColor }
      : undefined;

  const innerImage = Math.round(disc * 0.92);

  // Soft wash inside the disc, behind the avatar art (and visible through its
  // transparent areas). An equipped `backgroundColor` wins: a gradient paints
  // edge-to-edge, a solid hex gets a radial wash. With no background equipped,
  // the FRAME tint provides the fallback wash so the disc still has depth.
  // (Aura is intentionally NOT used here so the cyan/teal halo doesn't bleed
  // into the disc interior.)
  const frameSwatch = pickSwatchColor(frameColor ?? null);
  const discBgSource = backgroundColor ?? frameSwatch;
  const showDiscBackground = !!discBgSource;
  const discBackground: React.CSSProperties =
    backgroundColor && isGradient(backgroundColor)
      ? { backgroundImage: backgroundColor }
      : {
          backgroundImage: `radial-gradient(circle at 50% 40%, ${discBgSource}73 0%, ${discBgSource}24 65%, transparent 100%)`,
        };

  const inner = (
    <YStack
      width={disc}
      height={disc}
      borderRadius={disc / 2}
      alignItems="center"
      justifyContent="center"
      borderWidth={showFrame ? ring : 1}
      position="relative"
      style={{
        ...ringHexBackground,
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
      {showDiscBackground ? (
        <View
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          borderRadius={disc / 2}
          pointerEvents="none"
          style={discBackground}
          data-testid={testId ? `${testId}-bg` : undefined}
        />
      ) : null}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          width={innerImage}
          height={innerImage}
          style={{
            width: innerImage,
            height: innerImage,
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <Text
          color="$white"
          fontWeight="700"
          fontSize={Math.max(12, Math.round(disc * 0.34))}
          zIndex={1}
        >
          {getInitials(name)}
        </Text>
      )}
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
