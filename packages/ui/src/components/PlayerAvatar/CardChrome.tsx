'use client';

import { Text, View, YStack } from 'tamagui';
import { isGradient } from './colors';
import type { PlayerAvatarSize } from './constants';

interface CardChromeProps {
  name: string;
  size: PlayerAvatarSize;
  bannerColor?: string | null;
  nameColor?: string | null;
  presenceLine?: string;
  /** SKIN chip. `prefix` is the localized category word (e.g. "Skin"); the
   *  component owns only the separator + styling, never the literal text. */
  skinChip?: { id: string; label: string; prefix?: string } | null;
  topLeftOverlay?: React.ReactNode;
  /** VIP tier accent (premium/vip/supporter) applied to the nameplate. */
  roleColor?: string | null;
  /** Prestige glyph shown beside the name for VIP tiers. */
  roleGlyph?: string | null;
  testId?: string;
  onPress?: () => void;
  /** The disc + halo zone, rendered between the chrome overlays and the name. */
  children: React.ReactNode;
}

// The card/profile presentation: a bordered panel with an optional banner
// backdrop, corner overlays (skin chip, try-on tag) and the player name +
// presence line below the disc zone. Inline sizes skip this entirely.
export function CardChrome({
  name,
  size,
  bannerColor,
  nameColor,
  presenceLine,
  skinChip,
  topLeftOverlay,
  roleColor,
  roleGlyph,
  testId,
  onPress,
  children,
}: CardChromeProps) {
  const bannerStyle: React.CSSProperties | undefined = bannerColor
    ? isGradient(bannerColor)
      ? { backgroundImage: bannerColor }
      : { backgroundColor: bannerColor }
    : undefined;

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
            {skinChip.prefix ? `${skinChip.prefix} · ` : ''}
            {skinChip.label}
          </Text>
        </View>
      ) : null}
      {children}
      <YStack alignItems="center" gap={4}>
        <Text
          fontSize="$6"
          fontWeight="900"
          // Equipped name color wins; otherwise a VIP tier tints the name.
          color={
            nameColor && !isGradient(nameColor)
              ? nameColor
              : (roleColor ?? '$white')
          }
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
            : roleColor
              ? { style: { textShadow: `0 0 12px ${roleColor}66` } }
              : {})}
        >
          {roleGlyph ? `${roleGlyph} ` : ''}
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
}
