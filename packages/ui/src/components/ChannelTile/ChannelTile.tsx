'use client';

import type { ReactNode, MouseEventHandler, CSSProperties } from 'react';
import { XStack, YStack, Text, styled } from 'tamagui';

export type ChannelTileProps = {
  icon: ReactNode;
  title: string;
  sub?: string;
  gradient?: string;
  href?: string;
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  'data-testid'?: string;
};

const TileShell = styled(XStack, {
  name: 'ChannelTile',
  alignItems: 'center',
  gap: '$3',
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$glassBorder',
  backgroundColor: '$glassBg',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  flex: 1,
  hoverStyle: {
    borderColor: '$accent',
    y: -2,
  },
  pressStyle: {
    scale: 0.98,
  },
});

const IconBadge = styled(YStack, {
  width: 44,
  height: 44,
  borderRadius: '$3',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.35)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  flexShrink: 0,
  zIndex: 2,
});

const Meta = styled(YStack, {
  flex: 1,
  gap: 2,
  zIndex: 2,
});

const Title = styled(Text, {
  fontSize: 15,
  fontWeight: '700',
  color: '$color',
});

const Sub = styled(Text, {
  fontSize: 12.5,
  color: '$textSecondary',
});

const Arrow = styled(Text, {
  fontSize: 16,
  color: '$textSecondary',
  marginLeft: 6,
  zIndex: 2,
});

const linkResetStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  height: '100%',
};

const gradientOverlayStyle = (gradient: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  background: gradient,
  opacity: 0.18,
  pointerEvents: 'none',
  zIndex: 0,
});

const iconColorStyle: CSSProperties = { color: '#ffffff' };

export function ChannelTile({
  icon,
  title,
  sub,
  gradient,
  href,
  external,
  onClick,
  'data-testid': testId,
}: ChannelTileProps) {
  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <a
      href={href}
      onClick={onClick}
      data-testid={testId}
      style={linkResetStyle}
      {...linkProps}
    >
      <TileShell>
        {gradient ? (
          <span aria-hidden="true" style={gradientOverlayStyle(gradient)} />
        ) : null}
        <IconBadge>
          <span style={iconColorStyle}>{icon}</span>
        </IconBadge>
        <Meta>
          <Title>{title}</Title>
          {sub ? <Sub>{sub}</Sub> : null}
        </Meta>
        <Arrow aria-hidden>→</Arrow>
      </TileShell>
    </a>
  );
}

ChannelTile.displayName = 'ChannelTile';
