'use client';

import React from 'react';
import Link from 'next/link';
import {
  LinkButton,
  type LinkButtonProps,
} from '@arcadeum/ui/components/Button/LinkButton';
import { cx } from '@arcadeum/ui/utils/cx';

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
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cx(
      'relative flex h-[72px] items-center justify-center',
      className,
    )}
  >
    {children}
  </div>
);

/** Visible from md (768px) up only. */
export const DesktopOnly = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cx('hidden items-center gap-2 md:flex', className)}>
    {children}
  </div>
);

/** Hidden at narrow widths — used to move a header action into the mobile menu. */
export const HeaderMobileHidden = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cx('hidden items-center sm:flex print:flex', className)}>
    {children}
  </div>
);

interface HeaderLinkProps {
  href: string;
  variant?: LinkButtonProps['variant'];
  size?: LinkButtonProps['size'];
  icon?: LinkButtonProps['icon'];
  onClick?: LinkButtonProps['onClick'];
  className?: string;
  children: React.ReactNode;
}

export const NavHeaderLink = ({
  href,
  variant,
  size,
  icon,
  onClick,
  className,
  children,
  isActive,
  accent,
  'data-testid': testId,
  'data-active': dataActive,
}: HeaderLinkProps & {
  isActive?: boolean;
  accent?: boolean;
  'data-testid'?: string;
  'data-active'?: string | boolean;
}) => (
  <LinkButton
    href={href}
    variant={variant}
    size={size}
    icon={icon}
    onClick={onClick}
    className={cx(
      'overflow-visible rounded-[16px] hover:bg-[var(--backgroundHover)] hover:-translate-y-[1px] active:translate-y-[1px]',
      isActive && '!bg-[rgba(87,195,255,0.12)] text-[var(--primary)] font-bold',
      accent && 'font-bold',
      className,
    )}
    style={accent ? { color: 'var(--accent)' } : undefined}
    data-testid={testId}
    data-active={dataActive}
  >
    {children}
  </LinkButton>
);

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

export const MobileMenuContainer = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => <div className={className}>{children}</div>;

export const MobileNav = ({
  className,
  children,
  'data-testid': testId,
}: {
  className?: string;
  children?: React.ReactNode;
  'data-mobile-menu'?: boolean;
  'data-testid'?: string;
}) => (
  <div
    className={cx(
      'fixed bottom-0 left-0 right-0 top-[var(--header-height,64px)] z-[1] flex h-[100dvh] w-full max-w-[100vw] flex-col gap-1 overflow-y-auto border-t border-[var(--glassBorder)] bg-[var(--background)] px-5 pb-4 pt-4',
      className,
    )}
    data-mobile-menu
    data-testid={testId}
  >
    {children}
  </div>
);

export const MobileVersionText = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cx(
      'mt-auto px-2 py-4 text-center text-[12px] leading-[16px] opacity-80',
      className,
    )}
  >
    {children}
  </div>
);

export const MobileUserCard = ({
  className,
  children,
  'data-testid': testId,
}: {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}) => (
  <div
    className={cx(
      'flex flex-wrap items-center gap-3 rounded-[16px] border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3',
      className,
    )}
    data-testid={testId}
  >
    {children}
  </div>
);

export const MobileSection = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => <div className={cx('flex flex-col gap-1', className)}>{children}</div>;

export const MobileSectionLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cx(
      'px-4 pb-1 pt-3 text-[12px] font-bold leading-[16px] tracking-[3px] text-[var(--textSecondary)]',
      className,
    )}
  >
    {children}
  </div>
);

export const MobileBottomBar = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={cx(
      'mt-auto flex flex-wrap items-center justify-between gap-3 px-2 py-3',
      className,
    )}
  >
    {children}
  </div>
);

export const NavMobileLink = ({
  href,
  variant,
  size,
  fullWidth,
  icon,
  onClick,
  className,
  children,
  isActive,
  'data-testid': testId,
}: HeaderLinkProps & {
  fullWidth?: boolean;
  isActive?: boolean;
  'data-testid'?: string;
}) => (
  <LinkButton
    href={href}
    variant={variant}
    size={size}
    fullWidth={fullWidth}
    icon={icon}
    onClick={onClick}
    className={cx(
      'justify-start px-4 py-3 hover:bg-[var(--backgroundHover)] text-[var(--color)]',
      isActive && 'bg-[var(--glassBgHover)] text-[var(--primary)]',
      className,
    )}
    data-testid={testId}
  >
    {children}
  </LinkButton>
);
