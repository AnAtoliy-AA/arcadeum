'use client';

import { Typography } from '../Typography/Typography';
import React from 'react';
import Link from 'next/link';
import { cx } from '../../utils/cx';

type ProfileTypographyProps = Pick<
  React.ComponentProps<typeof Typography>,
  'children' | 'color' | 'style' | 'className' | 'data-testid'
>;

export const ProfileMenuContainer = ({
  children,
  className,
  'data-testid': dataTestId,
  'data-profile-menu': dataProfileMenu,
}: {
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  'data-profile-menu'?: string | boolean;
}) => (
  <div
    className={cx('relative z-[100] hidden sm:block print:block', className)}
    data-testid={dataTestId}
    data-profile-menu={dataProfileMenu}
  >
    {children}
  </div>
);

export const UserName = ({
  children,
  color,
  style,
  className,
  'data-testid': dataTestId,
}: ProfileTypographyProps) => (
  <Typography
    uiSize="sm"
    weight="500"
    color={color}
    style={style ?? { maxWidth: 140 }}
    className={className}
    data-testid={dataTestId}
  >
    {children}
  </Typography>
);

export const UserNameEllipsis = ({
  children,
  color,
  style,
  className,
  'data-testid': dataTestId,
}: ProfileTypographyProps) => (
  <Typography
    uiSize="sm"
    weight="800"
    color={color}
    style={
      style ?? {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 140,
      }
    }
    className={className}
    data-testid={dataTestId}
  >
    {children}
  </Typography>
);

type ProfileDropdownProps = {
  isOpen?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  'data-testid'?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

export const ProfileDropdownWrapper = ({
  isOpen = false,
  children,
  onClick,
  className,
  style,
}: ProfileDropdownProps) => (
  <div
    data-testid="profile-dropdown"
    onClick={onClick}
    style={{
      position: 'absolute',
      right: 0,
      minWidth: 240,
      top: 'calc(100% + 12px)',
      transformOrigin: 'right top',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      visibility: isOpen ? 'visible' : 'hidden',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.96)',
      ...style,
    }}
    className={cx(
      'rounded-[20px] border border-[var(--glassBorderStrong)] bg-[var(--background)]',
      'z-[1000] overflow-hidden backdrop-blur-[32px]',
      'shadow-[0_20px_50px_rgba(0,0,0,0.15)] print:hidden',
      className,
    )}
  >
    <div
      className="pointer-events-none absolute left-0 right-0 top-0 z-[2] h-[2px] opacity-50"
      style={{ background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }}
    />
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'linear-gradient(135deg, var(--glassBgHover) 0%, transparent 50%)',
      }}
    />
    <div
      data-testid="profile-dropdown-scroll"
      className="max-h-[calc(100dvh-110px)] overflow-y-auto overflow-x-hidden py-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--glassBorder) transparent',
      }}
    >
      {children}
    </div>
  </div>
);

export const DropdownItem = ({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  'data-testid': dataTestId,
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  'data-testid'?: string;
}) => (
  <div
    data-testid={dataTestId}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={cx(
      'relative flex h-[54px] cursor-pointer items-center gap-4 px-5 text-[var(--color)]',
      'transition-all duration-200 hover:bg-[var(--backgroundHover)] active:opacity-80',
      className,
    )}
  >
    {children}
  </div>
);

const DropdownAccent = ({ active }: { active?: boolean }) => (
  <span
    aria-hidden
    className="absolute bottom-3 left-0 top-3 w-[2px] rounded-[2px] bg-[var(--primary)] transition-all duration-200"
    style={{ opacity: active ? 1 : 0 }}
  />
);

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
        <span className="flex items-center gap-5">
          {icon}
          <Typography uiSize="sm" weight="800" color="var(--color)">
            {children}
          </Typography>
        </span>
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
      <span className="flex items-center gap-5">
        {icon}
        <Typography uiSize="sm" weight="800" color="var(--color)">
          {children}
        </Typography>
      </span>
    </DropdownItem>
  );
}
