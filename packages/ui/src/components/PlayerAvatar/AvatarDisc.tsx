'use client';

import { Text, View, YStack } from 'tamagui';
import { getInitials, isGradient, pickSwatchColor } from './colors';
import { BADGE_SIZE, DISC_SIZE, RING_WIDTH, type PlayerAvatarSize } from './constants';

interface AvatarDiscProps {
  name: string;
  size: PlayerAvatarSize;
  avatarUrl?: string | null;
  badgeUrl?: string | null;
  frameColor?: string | null;
  auraColor?: string | null;
  backgroundColor?: string | null;
  /** Soft bloom color under the disc (rays/aura → rarity glow), or null. */
  glowColor: string | null;
  priority?: boolean;
  testId?: string;
}

// The avatar disc: a circular base with optional frame tint, aura ring, inner
// background wash, the avatar art (or initials fallback) and a corner badge.
// Rendered at every size; the surrounding chrome (card/banner/name) lives in
// CardChrome and the rays halo is layered behind the disc by the parent.
export function AvatarDisc({
  name,
  size,
  avatarUrl,
  badgeUrl,
  frameColor,
  auraColor,
  backgroundColor,
  glowColor,
  priority,
  testId,
}: AvatarDiscProps) {
  const disc = DISC_SIZE[size];
  const badge = BADGE_SIZE[size];
  const ring = RING_WIDTH[size];

  const showBadge = !!badgeUrl;
  const showFrame = !!frameColor;
  const showAura = !!auraColor;

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

  return (
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
}
