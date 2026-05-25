'use client';

import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '../Typography/Typography';
import React from 'react';
import Link from 'next/link';

export const ProfileMenuContainer = styled(YStack, {
  name: 'ProfileMenuContainer',
  position: 'relative',
  zIndex: 100,
  $sm: {
    display: 'none',
  },
});

export const UserName = styled(Typography, {
  name: 'UserName',
  uiSize: 'sm',
  weight: '500',
  maxWidth: 140,
});

export const UserNameEllipsis = styled(UserName, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  weight: '800',
});

export const ProfileDropdown = styled(YStack, {
  name: 'ProfileDropdown',
  position: 'absolute',
  right: 0,
  minWidth: 240,
  backgroundColor: 'rgba(12, 14, 15, 0.98)',
  borderColor: '$glassBorder',
  borderWidth: 1,
  borderRadius: '$5',
  overflow: 'hidden',
  zIndex: 1000,
  top: 'calc(100% + 12px)',
  backdropFilter: 'blur(32px) saturate(160%)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  transformOrigin: 'right top',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

  variants: {
    isOpen: {
      true: {
        opacity: 1,
        pointerEvents: 'auto',
        visibility: 'visible',
        transform: 'translateY(0) scale(1)',
      },
      false: {
        opacity: 0,
        pointerEvents: 'none',
        visibility: 'hidden',
        transform: 'translateY(-10px) scale(0.96)',
      },
    },
  } as const,
});

const ProfileDropdownScroll = styled(YStack, {
  name: 'ProfileDropdownScroll',
  paddingVertical: '$4',
  maxHeight: 'calc(100dvh - 110px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  // Subtle scrollbar so it doesn't fight the glass aesthetic
  style: {
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.15) transparent',
  },
});

export const ProfileDropdownWrapper = ProfileDropdown.styleable(
  ({ isOpen, children, onPress, onClick, ...props }, ref) => {
    return (
      <ProfileDropdown
        ref={ref}
        isOpen={isOpen}
        {...props}
        onClick={(onClick || onPress || undefined) as React.MouseEventHandler}
      >
        {/* Top Glow Edge — outside scroll area so it stays pinned */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={2}
          pointerEvents="none"
          background="linear-gradient(90deg, transparent, var(--primary), transparent)"
          opacity={0.5}
          zIndex={2}
        />
        {/* Glass Highlight Shine — outside scroll area, covers visible bounds */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          background="linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)"
        />
        <ProfileDropdownScroll data-testid="profile-dropdown-scroll">
          {children}
        </ProfileDropdownScroll>
      </ProfileDropdown>
    );
  },
);

export const DropdownItem = styled(XStack, {
  name: 'DropdownItem',
  alignItems: 'center',
  gap: '$4',
  height: 54,
  paddingHorizontal: '$5',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  pressStyle: {
    opacity: 0.8,
  },
});

const DropdownAccent = styled(YStack, {
  position: 'absolute',
  left: 0,
  top: 12,
  bottom: 12,
  width: 2,
  borderRadius: 2,
  backgroundColor: '$primary',
  opacity: 0,
  transition: 'all 0.2s ease',

  variants: {
    active: {
      true: {
        opacity: 1,
      },
    },
  } as const,
});

export function DropdownLink({
  href,
  onClick,
  children,
  icon,
  'data-testid': dataTestId,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  'data-testid'?: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={href}
      prefetch={false}
      style={{ textDecoration: 'none' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={dataTestId}
    >
      <DropdownItem>
        <DropdownAccent active={isHovered} />
        <XStack alignItems="center" gap={20}>
          {icon}
          <Typography uiSize="sm" weight="800" color="$color">
            {children}
          </Typography>
        </XStack>
      </DropdownItem>
    </Link>
  );
}

export function DropdownButton({
  onClick,
  children,
  icon,
  'data-testid': dataTestId,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  'data-testid'?: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <DropdownItem
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={dataTestId}
    >
      <DropdownAccent active={isHovered} />
      <XStack alignItems="center" gap={20}>
        {icon}
        <Typography uiSize="sm" weight="800" color="$color">
          {children}
        </Typography>
      </XStack>
    </DropdownItem>
  );
}

