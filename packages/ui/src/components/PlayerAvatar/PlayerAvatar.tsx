'use client';

import { memo } from 'react';
import { YStack } from 'tamagui';
import { AvatarDisc } from './AvatarDisc';
import { CardChrome } from './CardChrome';
import { pickSwatchColor } from './colors';
import { DISC_SIZE, type PlayerAvatarSize } from './constants';
import { buildRaysStyle, RaysHalo } from './RaysHalo';
import { getRoleGlyph, getRoleTierColor } from './roles';

export type { PlayerAvatarSize } from './constants';

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
  /** Prestige role (premium/vip/supporter). Drives a tier aura + nameplate
   *  treatment so paid tiers are visible everywhere the avatar appears. */
  role?: string | null;
  priority?: boolean;
  /** Resolved skin item label for the SKIN chip. Only rendered at card/profile.
   *  `prefix` is the localized category word; the literal lives in the consumer. */
  skinChip?: { id: string; label: string; prefix?: string } | null;
  /** Overlay rendered top-left (used by shop for the TRY-ON tag). card/profile only. */
  topLeftOverlay?: React.ReactNode;
  'data-testid'?: string;
  onPress?: () => void;
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
  role,
  priority,
  skinChip,
  topLeftOverlay,
  'data-testid': testId,
  onPress,
}: PlayerAvatarProps) {
  const disc = DISC_SIZE[size];
  const roleColor = getRoleTierColor(role);
  const roleGlyph = getRoleGlyph(role);

  // Every size renders the full set of disc-level cosmetics (badge, frame,
  // aura/rays, background). Only the chrome wrapper — banner backdrop, name
  // label, skin chip — stays gated to the card/profile presentations, since
  // those need a name to sit on. Banner is therefore "biggest only".
  const showCardChrome = size === 'card' || size === 'profile';
  // VIP tier glows even without an equipped aura, so prestige players are
  // recognizable in any list. An equipped aura/rarity glow still takes priority.
  const showRays = !!auraColor || !!rarityGlow || !!roleColor;
  const raysColor =
    pickSwatchColor(auraColor ?? null) ??
    pickSwatchColor(rarityGlow ?? null) ??
    pickSwatchColor(roleColor);
  const raysBg = buildRaysStyle(raysColor);

  // Soft bloom under the disc, driven by the same color as the rays (aura,
  // falling back to rarity glow) so an equipped aura and a hovered shop item
  // both light the avatar.
  const glowColor = showRays ? raysColor : null;
  // Halo reaches past the disc on the hero card sizes; tighter on inline sizes
  // so list rows don't bloom into their neighbours.
  const haloSize = Math.round(disc * (showCardChrome ? 1.75 : 1.45));

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
      <AvatarDisc
        name={name}
        size={size}
        avatarUrl={avatarUrl}
        badgeUrl={badgeUrl}
        frameColor={frameColor}
        auraColor={auraColor}
        backgroundColor={backgroundColor}
        glowColor={glowColor}
        priority={priority}
        testId={testId}
      />
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
    <CardChrome
      name={name}
      size={size}
      bannerColor={bannerColor}
      nameColor={nameColor}
      presenceLine={presenceLine}
      skinChip={skinChip}
      topLeftOverlay={topLeftOverlay}
      roleColor={roleColor}
      roleGlyph={roleGlyph}
      testId={testId}
      onPress={onPress}
    >
      {discZone}
    </CardChrome>
  );
});
