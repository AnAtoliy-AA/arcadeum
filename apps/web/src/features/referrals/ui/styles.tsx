import React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

// CSS for pseudo-states, keyframes, and hover effects — injected once in ReferralDashboard
export const referralsStyles = `
  @keyframes referralsGlow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .referrals-copy-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #7ad7ff; background: transparent; color: #7ad7ff; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .referrals-copy-btn:hover { background: #7ad7ff; color: #050316; }
  .referrals-tier-card-unlocked { animation: referralsGlow 3s ease-in-out infinite; }
`;

function DashboardContainer({
  className,
  children,
  id,
  'data-testid': dataTestId,
  style,
  role,
  'aria-label': ariaLabel,
}: {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
  style?: React.CSSProperties;
  role?: string;
  'aria-label'?: string;
}) {
  return (
    <div
      id={id}
      data-testid={dataTestId}
      style={style}
      role={role}
      aria-label={ariaLabel}
      className={cx(
        'flex flex-col items-stretch gap-6 p-7 max-w-[720px] self-center md:py-9 md:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

function DashboardTitle({
  className,
  children,
  id,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}) {
  return (
    <h1
      id={id}
      data-testid={dataTestId}
      className={`m-0 text-[32px] leading-[38px] font-bold text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </h1>
  );
}

function DashboardSubtitle({
  className,
  children,
  id,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}) {
  return (
    <p
      id={id}
      data-testid={dataTestId}
      className={`-mt-2 mb-3 text-[16px] leading-[24px] text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}

function CardTitle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <h2
      className={`flex flex-row items-center gap-2 mb-3 text-[18px] leading-[24px] font-semibold text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </h2>
  );
}

function CodeContainer({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-row items-center gap-3 p-3 px-4 rounded-[10px] border border-[var(--borderColor)] bg-[var(--backgroundHover)] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

function CodeText({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-testid={dataTestId}
      className={`flex-1 text-[20px] leading-[28px] font-bold text-[var(--accent)] ${className ?? ''}`}
      style={{
        fontFamily: "'SF Mono','Fira Code','Courier New',monospace",
        letterSpacing: '2px',
      }}
    >
      {children}
    </span>
  );
}

export function CopyButton({
  onClick,
  disabled,
  'data-testid': dataTestId,
  'aria-label': ariaLabel,
  children,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  'data-testid'?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className="referrals-copy-btn"
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

function ShareLinkRow({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-row items-center gap-2 mt-3 ${className ?? ''}`}>
      {children}
    </div>
  );
}

function ShareLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`text-[var(--accent)] ${className ?? ''}`}
      style={{ wordBreak: 'break-all' }}
    >
      {children}
    </span>
  );
}

function ProgressSection({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-stretch gap-2 ${className ?? ''}`}>
      {children}
    </div>
  );
}

function ProgressLabel({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-row items-center justify-between ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

function ProgressCount({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-testid={dataTestId}
      className={`text-[28px] leading-[34px] font-bold text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function ProgressTarget({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`font-medium text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function TierList({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-stretch gap-4 ${className ?? ''}`}>
      {children}
    </div>
  );
}

interface TierCardProps {
  unlocked: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
  'data-unlocked'?: boolean;
}

export function TierCard({
  unlocked,
  'data-testid': dataTestId,
  'data-unlocked': dataUnlocked,
  children,
}: TierCardProps) {
  return (
    <div
      data-testid={dataTestId}
      data-unlocked={dataUnlocked}
      className={cx(
        'flex flex-row items-start gap-4 p-4 rounded-[12px] border',
        unlocked && 'referrals-tier-card-unlocked',
      )}
      style={{
        borderColor: unlocked
          ? 'var(--primaryGradientStart)'
          : 'var(--borderColor)',
        backgroundColor: unlocked
          ? 'rgba(122,215,255,0.12)'
          : 'var(--backgroundHover)',
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      {children}
    </div>
  );
}

export function TierIcon({
  unlocked,
  children,
}: {
  unlocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="text-[24px] shrink-0"
      style={{ opacity: unlocked ? 1 : 0.4 }}
    >
      {children}
    </span>
  );
}

function TierContent({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col items-stretch gap-2 flex-1 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

function TierTitle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`text-[16px] leading-[20px] font-semibold text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function TierDescription({
  className,
  'data-testid': dataTestId,
  'data-coins': dataCoins,
  style,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  'data-coins'?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-testid={dataTestId}
      data-coins={dataCoins}
      style={style}
      className={`text-[14px] leading-[18px] text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

export function TierBadge({
  unlocked,
  children,
}: {
  unlocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '0.25rem 0.5rem',
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: '0.25rem',
        background: unlocked
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'rgba(107,114,128,0.3)',
        color: unlocked ? 'white' : 'rgba(255,255,255,0.5)',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
}

function CopiedNotice({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`text-[14px] leading-[18px] font-medium text-[var(--accent)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

function BadgesRowContainer({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-row items-stretch gap-2 flex-wrap ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export {
  DashboardContainer,
  DashboardTitle,
  DashboardSubtitle,
  CardTitle,
  CodeContainer,
  CodeText,
  ShareLinkRow,
  ShareLink,
  ProgressSection,
  ProgressLabel,
  ProgressCount,
  ProgressTarget,
  TierList,
  TierContent,
  TierTitle,
  TierDescription,
  CopiedNotice,
  BadgesRowContainer,
};
