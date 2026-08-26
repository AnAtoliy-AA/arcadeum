import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@arcadeum/ui';
import { CopyActionButton } from '@/features/support/copy-action/ui/CopyActionButton';

export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-screen justify-center overflow-hidden relative bg-[var(--background)] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export function BackgroundBlob() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '140vw',
        height: 800,
        background:
          'radial-gradient(circle at center, rgba(122, 215, 255, 0.15) 0%, transparent 70%)',
        opacity: 0.6,
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }}
    />
  );
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  return <div className="support-content-wrapper">{children}</div>;
}

export function AnimatedGlassCard({
  children,
  delay,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <GlassCard
      className={`support-animated-card ${className || ''}`}
      style={{ ...style, animationDelay: delay || '0s' }}
    >
      {children}
    </GlassCard>
  );
}

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'center',
        alignItems: 'center',
        padding: '2rem 0',
      }}
    >
      {children}
    </header>
  );
}

export function Tagline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`max-w-[650px] leading-[24px] opacity-[0.7] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <h2 className="support-section-title" id={id}>
      {children}
    </h2>
  );
}

export function HeaderDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`max-w-[700px] leading-[24px] opacity-[0.5] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}

export function TeamGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {children}
    </div>
  );
}

export function TeamCardInner({
  children,
  hasLinkedin,
}: {
  children: React.ReactNode;
  hasLinkedin: boolean;
}) {
  return (
    <div
      className="relative flex flex-col gap-2"
      style={{ paddingBottom: hasLinkedin ? '3.5rem' : 0 }}
    >
      {children}
    </div>
  );
}

export function TeamHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-row items-start justify-between w-full ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export function TeamIcon({
  children,
  'aria-hidden': ariaHidden,
}: {
  children: React.ReactNode;
  'aria-hidden'?: boolean | 'true' | 'false';
}) {
  return (
    <span
      aria-hidden={ariaHidden}
      style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}
    >
      {children}
    </span>
  );
}

export function TeamName({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`m-0 mb-1 text-[24px] leading-[30px] font-bold text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </h3>
  );
}

export function TeamRole({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mb-2 opacity-[0.8] text-[var(--color)] ${className ?? ''}`}>
      {children}
    </p>
  );
}

export function TeamBio({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`leading-[32px] opacity-[0.6] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}

export function ActionList({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {children}
    </div>
  );
}

export function ActionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-row items-center gap-3 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function ActionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-[24px] leading-[30px] font-bold opacity-[0.9] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </h3>
  );
}

export function ActionDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`leading-[32px] opacity-[0.6] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}

export function CtaRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-row items-center justify-between gap-3 flex-wrap ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export const CtaLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link className="support-cta" href={href}>
    {children}
  </Link>
);

export const ExternalCta = ({
  children,
  href,
  target,
  rel,
  'data-testid': dataTestId,
}: {
  children?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  'data-testid'?: string;
}) => (
  <a
    className="support-cta"
    href={href}
    target={target}
    rel={rel}
    data-testid={dataTestId}
  >
    {children}
  </a>
);

export const LinkedInButton = ({
  children,
  href,
  target,
  rel,
  'aria-label': ariaLabel,
}: {
  children?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}) => (
  <a
    className="support-cta support-linkedin-btn"
    href={href}
    target={target}
    rel={rel}
    aria-label={ariaLabel}
  >
    {children}
  </a>
);

export function CopyActionWrapper({
  value,
  label,
  successMessage,
}: {
  value: string;
  label: string;
  successMessage: string;
}) {
  return (
    <div className="support-copy-wrapper">
      <CopyActionButton
        value={value}
        label={label}
        successMessage={successMessage}
        noticeClassName="support-copy-notice"
      />
    </div>
  );
}

export const CtaIcon = ({ children }: { children: React.ReactNode }) => (
  <span>{children}</span>
);

export function Thanks({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`leading-[24px] opacity-[0.6] text-[var(--color)] ${className ?? ''}`}
    >
      {children}
    </p>
  );
}
