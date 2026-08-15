import React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

// CSS for pseudo-states, keyframes, and hover effects — injected once in ReferralDashboard
export const referralsStyles = `
  @keyframes referralsGlow {
    0%, 100% { box-shadow: 0 0 8px rgba(87, 195, 255, 0.3); }
    50% { box-shadow: 0 0 16px rgba(87, 195, 255, 0.5); }
  }
  .referrals-copy-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #7ad7ff; background: transparent; color: #7ad7ff; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .referrals-copy-btn:hover { background: #7ad7ff; color: #050316; }
  .referrals-tier-card-unlocked { animation: referralsGlow 3s ease-in-out infinite; }
`;

function DashboardContainer({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-6 p-7 max-w-[720px] self-center md:py-9 md:px-8',
        className,
      )}
      {...props}
    />
  );
}

function DashboardTitle({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={`box-border m-0 text-[32px] leading-[38px] font-bold text-[var(--color)] ${className ?? ''}`}
      {...props}
    />
  );
}

function DashboardSubtitle({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`box-border -mt-2 mb-3 text-[16px] leading-[24px] text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`box-border flex flex-row items-center gap-2 mb-3 text-[18px] leading-[24px] font-semibold text-[var(--color)] ${className ?? ''}`}
      {...props}
    />
  );
}

function CodeContainer({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-row items-center gap-3 p-3 px-4 rounded-[10px] border border-[var(--borderColor)] bg-[var(--backgroundHover)] ${className ?? ''}`}
      {...props}
    />
  );
}

function CodeText({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border flex-1 text-[20px] leading-[28px] font-bold text-[var(--accent)] ${className ?? ''}`}
      style={{
        fontFamily: "'SF Mono','Fira Code','Courier New',monospace",
        letterSpacing: '2px',
      }}
      {...props}
    />
  );
}

export function CopyButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button className="referrals-copy-btn" {...props}>
      {children}
    </button>
  );
}

function ShareLinkRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-row items-center gap-2 mt-3 ${className ?? ''}`}
      {...props}
    />
  );
}

function ShareLink({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border text-[var(--accent)] ${className ?? ''}`}
      style={{ wordBreak: 'break-all' }}
      {...props}
    />
  );
}

function ProgressSection({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-col items-stretch gap-2 ${className ?? ''}`}
      {...props}
    />
  );
}

function ProgressLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-row items-center justify-between ${className ?? ''}`}
      {...props}
    />
  );
}

function ProgressCount({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border text-[28px] leading-[34px] font-bold text-[var(--color)] ${className ?? ''}`}
      {...props}
    />
  );
}

function ProgressTarget({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border font-medium text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
      {...props}
    />
  );
}

function TierList({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-col items-stretch gap-4 ${className ?? ''}`}
      {...props}
    />
  );
}

interface TierCardProps {
  $unlocked: boolean;
  children: React.ReactNode;
  'data-testid'?: string;
  'data-unlocked'?: boolean;
}

export function TierCard({ $unlocked, children, ...props }: TierCardProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-start gap-4 p-4 rounded-[12px] border',
        $unlocked && 'referrals-tier-card-unlocked',
      )}
      style={{
        borderColor: $unlocked
          ? 'var(--primaryGradientStart)'
          : 'var(--borderColor)',
        backgroundColor: $unlocked
          ? 'rgba(122,215,255,0.12)'
          : 'var(--backgroundHover)',
        opacity: $unlocked ? 1 : 0.6,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TierIcon({
  $unlocked,
  children,
}: {
  $unlocked: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="box-border text-[24px] shrink-0"
      style={{ opacity: $unlocked ? 1 : 0.4 }}
    >
      {children}
    </span>
  );
}

function TierContent({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-col items-stretch gap-2 flex-1 ${className ?? ''}`}
      {...props}
    />
  );
}

function TierTitle({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border text-[16px] leading-[20px] font-semibold text-[var(--color)] ${className ?? ''}`}
      {...props}
    />
  );
}

function TierDescription({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border text-[14px] leading-[18px] text-[rgba(236,239,238,0.45)] ${className ?? ''}`}
      {...props}
    />
  );
}

export function TierBadge({
  $unlocked,
  children,
}: {
  $unlocked: boolean;
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
        background: $unlocked
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : 'rgba(107,114,128,0.3)',
        color: $unlocked ? 'white' : 'rgba(255,255,255,0.5)',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
}

function CopiedNotice({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`box-border text-[14px] leading-[18px] font-medium text-[var(--accent)] ${className ?? ''}`}
      {...props}
    />
  );
}

function BadgesRowContainer({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`box-border flex flex-row items-stretch gap-2 flex-wrap ${className ?? ''}`}
      {...props}
    />
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
