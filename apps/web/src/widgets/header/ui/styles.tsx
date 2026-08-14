'use client';

import React from 'react';
import Link from 'next/link';
import {
  LinkButton,
  type LinkButtonProps,
} from '@arcadeum/ui/components/Button/LinkButton';

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

export const NavLinkWrapper = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={['relative flex h-[72px] items-center justify-center', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

/** Visible from md (768px) up only. */
export const DesktopOnly = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={['hidden items-center gap-2 md:flex', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

/** Hidden at narrow widths — used to move a header action into the mobile menu. */
export const HeaderMobileHidden = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={['hidden items-center sm:flex', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const NavHeaderLink = ({
  isActive,
  accent,
  className,
  children,
  ...props
}: LinkButtonProps & { accent?: boolean; isActive?: boolean }) => (
  <LinkButton
    className={[
      'overflow-visible rounded-[16px] hover:bg-[var(--backgroundHover)] hover:-translate-y-[1px] active:translate-y-[1px]',
      isActive && '!bg-[rgba(87,195,255,0.12)] text-[var(--primary)] font-bold',
      accent && 'font-bold',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={accent ? { color: 'var(--accent)' } : undefined}
    {...props}
  >
    {children}
  </LinkButton>
);

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

export const MobileMenuContainer = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...rest} />
);

export const MobileNav = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      'fixed bottom-0 left-0 right-0 top-[var(--header-height,64px)] z-[1] flex h-[100dvh] w-full max-w-[100vw] flex-col gap-1 overflow-y-auto border-t border-[var(--glassBorder)] bg-[var(--background)] px-5 pb-4 pt-4',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const MobileVersionText = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      'mt-auto px-2 py-4 text-center text-[12px] leading-[16px] opacity-80',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const MobileUserCard = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      'flex flex-wrap items-center gap-3 rounded-[16px] border border-[var(--glassBorder)] bg-[rgba(255,255,255,0.04)] p-3',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const MobileSection = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}
    {...rest}
  />
);

export const MobileSectionLabel = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      'px-4 pb-1 pt-3 text-[12px] font-bold leading-[16px] tracking-[3px] opacity-80',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const MobileBottomBar = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      'mt-auto flex flex-wrap items-center justify-between gap-3 px-2 py-3',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  />
);

export const NavMobileLink = ({
  isActive,
  className,
  children,
  ...props
}: LinkButtonProps & { isActive?: boolean }) => (
  <LinkButton
    className={[
      'justify-start px-4 py-3 hover:bg-[rgba(255,255,255,0.05)]',
      isActive && '!bg-[rgba(255,255,255,0.08)] !text-[var(--primary)]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </LinkButton>
);
