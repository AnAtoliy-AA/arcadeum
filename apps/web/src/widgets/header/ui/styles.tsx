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

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

export const MobileMenuContainer = styled(XStack, {
  name: 'MobileMenuContainer',
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
  backgroundColor: 'rgba(12, 14, 15, 0.95)',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
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
  paddingVertical: '$4',
  paddingHorizontal: '$2',
  alignItems: 'center',
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
