'use client';

import { YStack, Text, styled, Circle, FontSizeTokens } from 'tamagui';
import { memo, useMemo } from 'react';
import type { ReactElement } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
};

const fontSizeMap: Record<AvatarSize, FontSizeTokens> = {
  sm: '$2',
  md: '$4',
  lg: '$6',
  xl: '$8',
};

const StyledAvatarContainer = styled(Circle, {
  name: 'AvatarContainer',
  backgroundColor: '$primary',
  borderWidth: 1,
  borderColor: '$borderColor',
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  shadowColor: '$shadowColor',
  shadowOpacity: 0.2,
  shadowRadius: 10,

  variants: {
    size: {
      sm: { width: sizeMap.sm, height: sizeMap.sm },
      md: { width: sizeMap.md, height: sizeMap.md },
      lg: { width: sizeMap.lg, height: sizeMap.lg },
      xl: { width: sizeMap.xl, height: sizeMap.xl },
    },
  } as const,
});

const GlisteningOverlay = styled(YStack, {
  position: 'absolute',
  inset: 0,
  opacity: 0.15,
  background: 'linear-gradient(135deg, $glassBorder 0%, transparent 100%)',
  pointerEvents: 'none',
});

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export type AvatarProps = {
  name?: string;
  alt?: string;
  src?: string;
  size?: AvatarSize;
  'data-testid'?: string;
  isHost?: boolean;
};

export const Avatar = memo(function Avatar({
  name = '?',
  alt,
  src,
  size = 'md',
  'data-testid': dataTestId,
  isHost,
}: AvatarProps): ReactElement {
  const initials = useMemo(() => getInitials(name), [name]);
  const sizeValue = sizeMap[size];
  const fontSize = fontSizeMap[size];

  return (
    <StyledAvatarContainer size={size} data-testid={dataTestId}>
      {src ? (
        <img
          src={src}
          alt={alt ?? name}
          style={{ width: sizeValue, height: sizeValue, objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <Text color="$white" fontWeight="700" fontSize={fontSize}>
          {initials}
        </Text>
      )}
      <GlisteningOverlay />
    </StyledAvatarContainer>
  );
});
