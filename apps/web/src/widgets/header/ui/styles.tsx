'use client';

import React from 'react';

export const HEADER_HEIGHT = 72;
import Link from 'next/link';
import { styled, GetProps, Header, Nav as TamaguiNav } from 'tamagui';
import { XStack, YStack, Typography } from '@arcadeum/ui';

// ─── Header Container ─────────────────────────────────────────────────────────

const HeaderOuter = styled(Header, {
  name: 'HeaderContainer',
  position: 'sticky',
  top: 0,
  zIndex: '$1',
  backgroundColor: '$background',
});

const HeaderBorderLine = styled(YStack, {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 1,
  pointerEvents: 'none',
  background:
    'linear-gradient(90deg, transparent 0%, var(--borderColor) 15%, var(--primaryGradientStart) 50%, var(--borderColor) 85%, transparent 100%)',
});

export function HeaderContainer({ children }: { children: React.ReactNode }) {
  return (
    <HeaderOuter
      style={
        {
          backdropFilter: 'blur(24px) saturate(180%)',
        } satisfies React.CSSProperties
      }
    >
      {children}
      <HeaderBorderLine />
    </HeaderOuter>
  );
}

// ─── Header Inner ─────────────────────────────────────────────────────────────

export const HeaderInner = styled(XStack, {
  name: 'HeaderInner',
  maxWidth: 1440,
  width: '100%',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: HEADER_HEIGHT,
  paddingHorizontal: '$6',
  gap: '$8',
  $xl: { gap: '$4' },
  $xs: { paddingHorizontal: '$4', gap: '$2' },
});

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} style={{ textDecoration: 'none' }}>
      <XStack
        alignItems="center"
        gap="$2"
        flexShrink={0}
        cursor="pointer"
        style={{ transition: 'opacity 0.2s ease' }}
        hoverStyle={{ opacity: 0.85 }}
      >
        {children}
      </XStack>
    </Link>
  );
}

export const LogoText = styled(Typography, {
  name: 'LogoText',
  fontSize: 22,
  weight: '800',
  color: '$primaryGradientStart',
  $xs: { display: 'none' },
});

// ─── Navigation ───────────────────────────────────────────────────────────────

export const Nav = styled(TamaguiNav, {
  name: 'Nav',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  flex: 1,
  $md: { display: 'none' },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const Actions = styled(XStack, {
  name: 'Actions',
  alignItems: 'center',
  gap: '$2',
  flexShrink: 0,
  $xs: { gap: '$1' },
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

export function ProfileDropdown({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <YStack
      position="absolute"
      right={0}
      minWidth={210}
      backgroundColor="$glassBg"
      borderColor="$glassBorder"
      borderWidth={1}
      borderRadius="$3"
      overflow="hidden"
      zIndex={1000}
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={{
        top: 'calc(100% + 10px)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen
          ? 'translateY(0) scale(1)'
          : 'translateY(-6px) scale(0.98)',
        transformOrigin: 'top right',
        transition:
          'opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease',
      }}
    >
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        height={1}
        pointerEvents="none"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primaryGradientStart) 25%, transparent), transparent)',
        }}
      />
      {children}
    </YStack>
  );
}

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
      style={{ textDecoration: 'none' }}
      onClick={onClick}
    >
      <XStack
        alignItems="center"
        gap="$3"
        paddingVertical={11}
        paddingHorizontal="$4"
        cursor="pointer"
        style={{ transition: 'background 0.15s ease' }}
        hoverStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <Typography
          uiSize="sm"
          weight="500"
          color="$color"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
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

type MobileNavProps = {
  isOpen: boolean;
  children: React.ReactNode;
} & Omit<GetProps<typeof YStack>, 'children'>;

export function MobileNav({ isOpen, children, ...props }: MobileNavProps) {
  return (
    <YStack
      position="fixed"
      top={HEADER_HEIGHT}
      left={0}
      right={0}
      bottom={0}
      zIndex="$1"
      backgroundColor="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      paddingHorizontal="$5"
      paddingTop="$4"
      gap="$1"
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={{
        height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
        backdropFilter: 'blur(24px) saturate(160%)',
        overflowY: 'auto',
        overscrollBehavior: 'none',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen ? 'translateY(0)' : 'translateY(-12px)',
        transition:
          'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, visibility 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      {...props}
    >
      {children}
    </YStack>
  );
}

export const MobileVersionText = styled(Typography, {
  name: 'MobileVersionText',
  uiSize: 'xs',
  alpha: 'medium',
  textCenter: true,
  marginTop: 'auto',
  paddingVertical: '$4',
  paddingHorizontal: '$2',
  color: '$neutral',
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
