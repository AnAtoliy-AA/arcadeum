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
  bannerColor?: string | null;
  nameColor?: string | null;
  level?: number | null;
  presenceLine?: string;
  priority?: boolean;
  'data-testid'?: string;
  onPress?: () => void;
}

const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 28,
  sm: 40,
  md: 72,
  lg: 140,
  card: 140,
  profile: 200,
};
const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 14,
  md: 24,
  lg: 36,
  card: 36,
  profile: 52,
};
const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 0,
  sm: 2,
  md: 3,
  lg: 3,
  card: 3,
  profile: 4,
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

export const PlayerAvatar = memo(function PlayerAvatar({
  name,
  size = 'sm',
  avatarUrl,
  badgeUrl,
  frameColor,
  auraColor,
  bannerColor,
  nameColor,
  presenceLine,
  priority,
  'data-testid': testId,
  onPress,
}: PlayerAvatarProps) {
  const disc = DISC_SIZE[size];
  const badge = BADGE_SIZE[size];
  const ring = RING_WIDTH[size];

  const showBadge = size !== 'icon' && !!badgeUrl;
  const showFrame = size !== 'icon' && !!frameColor;
  const showAura = (size === 'md' || size === 'card') && !!auraColor;
  const showCardChrome = size === 'card' || size === 'profile';

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

  const auraSwatch = showAura
    ? (pickSwatchColor(auraColor) ?? 'rgba(96,165,250,0.45)')
    : null;

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
        ...(auraSwatch
          ? { boxShadow: `0 0 ${Math.round(disc * 0.4)}px ${auraSwatch}` }
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

  if (!showCardChrome) {
    return (
      <YStack
        data-testid={testId}
        onPress={onPress}
        cursor={onPress ? 'pointer' : 'default'}
      >
        {inner}
      </YStack>
    );
  }

  return (
    <YStack
      data-testid={testId}
      onPress={onPress}
      cursor={onPress ? 'pointer' : 'default'}
      width={size === 'profile' ? '100%' : 220}
      borderRadius="$5"
      paddingHorizontal="$4"
      paddingVertical="$4"
      alignItems="center"
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
      {inner}
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
