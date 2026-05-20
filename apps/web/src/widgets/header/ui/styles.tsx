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
    <Link href={href} prefetch={false} className="link-no-decoration">
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

export const DesktopOnly = styled(XStack, {
  name: 'DesktopOnly',
  alignItems: 'center',
  gap: '$2',
  $md: { display: 'none' },
});

// Hidden at narrow widths — used to move a header action into the mobile menu.
export const HeaderMobileHidden = styled(XStack, {
  name: 'HeaderMobileHidden',
  alignItems: 'center',
  $sm: { display: 'none' },
});

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

export const MobileMenuContainer = styled(XStack, {
  name: 'MobileMenuContainer',
});

export const MobileNav = styled(YStack, {
  name: 'MobileNav',
  position: 'fixed',
  // Track the responsive header height defined in header-stable.css so the
  // drawer always starts flush against the header (no transparent gap at
  // <=480px when the header shrinks to 56px).
  top: `var(--header-height, ${HEADER_HEIGHT}px)` as unknown as number,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  maxWidth: '100vw',
  zIndex: '$1',
  // Fully opaque so the page never shows through the empty gaps above the
  // user card or below the last menu item.
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
  paddingHorizontal: '$5',
  paddingTop: '$4',
  paddingBottom: '$4',
  gap: '$1',
  height: '100dvh',
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
  paddingVertical: '$4',
  paddingHorizontal: '$2',
  alignItems: 'center',
  gap: '$3',
  flexWrap: 'wrap',
});

export const MobileUserCard = styled(XStack, {
  name: 'MobileUserCard',
  alignItems: 'center',
  gap: '$3',
  padding: '$3',
  borderRadius: '$4',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  borderWidth: 1,
  borderColor: '$glassBorder',
  flexWrap: 'wrap',
});

export const MobileSection = styled(YStack, {
  name: 'MobileSection',
  gap: '$1',
});

export const MobileSectionLabel = styled(Typography, {
  name: 'MobileSectionLabel',
  uiSize: 'xs',
  weight: '700',
  tracking: 'xl',
  alpha: 'medium',
  paddingHorizontal: '$4',
  paddingTop: '$3',
  paddingBottom: '$1',
});

export const MobileBottomBar = styled(XStack, {
  name: 'MobileBottomBar',
  marginTop: 'auto',
  paddingVertical: '$3',
  paddingHorizontal: '$2',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',
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
        backgroundColor: 'rgba(87, 195, 255, 0.12)',
        color: '$primary',
        fontWeight: '700',
      },
    },
  } as const,
});

export const NavMobileLink = styled(LinkButton, {
  name: 'NavMobileLink',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  justifyContent: 'flex-start',
  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        color: '$primary',
      },
    },
  } as const,
});
