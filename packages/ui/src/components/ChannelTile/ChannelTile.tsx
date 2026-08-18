'use client';

import type { ReactNode, MouseEventHandler, CSSProperties } from 'react';
import { cx } from '../../utils/cx';

export type ChannelTileProps = {
  icon: ReactNode;
  title: string;
  sub?: string;
  gradient?: string;
  href?: string;
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  'data-testid'?: string;
  className?: string;
};

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
  className,
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
      <div
        className={cx(
          'relative flex flex-1 cursor-pointer flex-row items-center gap-3 overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-[14px] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--accent)] active:scale-[0.98]',
          className,
        )}
      >
        {gradient ? (
          <span aria-hidden="true" style={gradientOverlayStyle(gradient)} />
        ) : null}
        <div className="z-[2] flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.35)]">
          <span style={iconColorStyle}>{icon}</span>
        </div>
        <div className="z-[2] flex flex-1 flex-col gap-0.5">
          <span className="text-[15px] font-bold text-[var(--color)]">
            {title}
          </span>
          {sub ? (
            <span className="text-[12.5px] text-[var(--textSecondary)]">
              {sub}
            </span>
          ) : null}
        </div>
        <span
          aria-hidden
          className="z-[2] ml-1.5 text-[16px] text-[var(--textSecondary)]"
        >
          →
        </span>
      </div>
    </a>
  );
}

ChannelTile.displayName = 'ChannelTile';
