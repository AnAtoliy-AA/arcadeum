'use client';

import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '../Typography/Typography';
import React from 'react';
import Link from 'next/link';

export const ProfileMenuContainer = styled(YStack, {
  name: 'ProfileMenuContainer',
  position: 'relative',
  $md: { display: 'none' },
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
  paddingVertical: '$2',

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

export const ProfileDropdownWrapper = ProfileDropdown.styleable(
  ({ isOpen, children, onPress, onClick, ...props }, ref) => {
    return (
      <ProfileDropdown
        ref={ref}
        isOpen={isOpen}
        {...props}
        onClick={(onClick || onPress || undefined) as React.MouseEventHandler}
      >
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={1}
          pointerEvents="none"
          background="linear-gradient(90deg, transparent, color-mix(in srgb, var(--primaryGradientStart) 10%, transparent), transparent)"
        />
        {children}
      </ProfileDropdown>
    );
  },
);

export function DropdownLink({
  href,
  onClick,
  children,
  icon,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      style={{ textDecoration: 'none' }}
      onClick={onClick}
    >
      <XStack
        alignItems="center"
        gap="$4"
        height={48}
        paddingHorizontal="$4"
        cursor="pointer"
        hoverStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        transition="background-color 0.2s ease"
      >
        <Typography
          uiSize="sm"
          weight="800"
          color="$color"
          flexDirection="row"
          alignItems="center"
          gap={12}
        >
          {icon}
          {children}
        </Typography>
      </XStack>
    </Link>
  );
}

export function DropdownButton({
  onClick,
  children,
  icon,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <XStack
      alignItems="center"
      gap="$4"
      height={48}
      paddingHorizontal="$4"
      cursor="pointer"
      hoverStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      transition="background-color 0.2s ease"
      onClick={onClick}
    >
      <Typography
        uiSize="sm"
        weight="800"
        color="$color"
        flexDirection="row"
        alignItems="center"
        gap={12}
      >
        {icon}
        {children}
      </Typography>
    </XStack>
  );
}
