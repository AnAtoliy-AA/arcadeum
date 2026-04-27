'use client';

import { HEADER_HEIGHT } from '@/shared/config/layout';
import React from 'react';

import Link from 'next/link';
import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { LinkButton } from '@arcadeum/ui/components/Button/LinkButton';
import './header-stable.css';

// ─── Header Inner ─────────────────────────────────────────────────────────────
// (Using plain HTML in HeaderLayout for hydration safety)

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="link-no-decoration"
      aria-label="Arcadeum"
    >
      <div className="logo-inner" data-testid="logo-inner">
        {children}
      </div>
    </Link>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────
// (Using plain HTML in HeaderInteractive for hydration safety)

// ─── Actions ──────────────────────────────────────────────────────────────────
// (Using plain HTML in HeaderInteractive for hydration safety)
// ─── Navigation Link ──────────────────────────────────────────────────────────

export const NavLinkWrapper = styled(XStack, {
  name: 'NavLinkWrapper',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  height: 72,
});

export const NavLinkIndicator = styled(XStack, {
  name: 'NavLinkIndicator',
  position: 'absolute',
  // Center is 36, button is 36. Top of button is 18, bottom is 54.
  top: 18,
  height: 36,
  left: 0,
  right: 0,
  borderRadius: '$4',
  borderBottomWidth: 3,
  borderBottomColor: '#57c3ff',
  pointerEvents: 'none',
  zIndex: 10,
  opacity: 0,
  style: {
    transition: 'all 0.2s ease-in-out',
  },

  variants: {
    active: {
      true: {
        opacity: 1,
      },
    },
  } as const,
});

export const DesktopOnly = styled(XStack, {
  name: 'DesktopOnly',
  alignItems: 'center',
  gap: '$2',
  $md: { display: 'none' },
});

// ─── Profile Menu ─────────────────────────────────────────────────────────────

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
});

export const ProfileDropdown = styled(YStack, {
  name: 'ProfileDropdown',
  position: 'absolute',
  right: 0,
  minWidth: 220,
  backgroundColor: '$glassBg',
  borderColor: '$glassBorder',
  borderWidth: 1,
  borderRadius: '$4',
  overflow: 'hidden',
  zIndex: 1000,
  top: 'calc(100% + 12px)',
  backdropFilter: 'blur(20px) saturate(160%)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
  transformOrigin: 'right top',

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
          background="linear-gradient(90deg, transparent, color-mix(in srgb, var(--primaryGradientStart) 25%, transparent), transparent)"
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
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="link-no-decoration"
      onClick={onClick}
    >
      <XStack
        alignItems="center"
        gap="$3"
        paddingVertical={11}
        paddingHorizontal="$4"
        cursor="pointer"
        hoverStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <Typography
          uiSize="sm"
          weight="500"
          color="$color"
          flexDirection="row"
          alignItems="center"
          gap={12}
        >
          {children}
        </Typography>
      </XStack>
    </Link>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

export const MobileMenuContainer = styled(XStack, {
  name: 'MobileMenuContainer',
  display: 'none',
  $md: { display: 'flex' },
});

export const MobileNav = styled(YStack, {
  name: 'MobileNav',
  position: 'fixed',
  top: HEADER_HEIGHT,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  maxWidth: '100vw',
  zIndex: '$1',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingHorizontal: '$5',
  paddingTop: '$4',
  gap: '$1',
  height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
  backdropFilter: 'blur(32px) saturate(180%)',
  overflowY: 'auto',
});

export const MobileVersionText = styled(Typography, {
  name: 'MobileVersionText',
  uiSize: 'xs',
  alpha: 'medium',
  textCenter: true,
  marginTop: 'auto',
  paddingVertical: '$4',
  paddingHorizontal: '$2',
});

export const MobileUserInfo = styled(XStack, {
  name: 'MobileUserInfo',
  paddingVertical: 14,
  paddingHorizontal: '$4',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  marginVertical: '$1',
  alignItems: 'center',
  gap: '$2',
  flexWrap: 'wrap',
});

export const NavHeaderLink = styled(LinkButton, {
  name: 'NavHeaderLink',
  borderRadius: '$4',
  overflow: 'visible',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
    transform: 'translateY(-1px)',
  },
  pressStyle: {
    transform: 'translateY(1px)',
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: '$backgroundPress',
        color: '$color',
      },
    },
  } as const,
});

export const NavMobileLink = styled(LinkButton, {
  name: 'NavMobileLink',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  justifyContent: 'flex-start',
  variants: {
    isActive: {
      true: {
        backgroundColor: '$backgroundPress',
        color: '$primary',
      },
    },
  } as const,
});
