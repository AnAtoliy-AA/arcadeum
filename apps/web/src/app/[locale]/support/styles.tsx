import React, { type ComponentProps } from 'react';
import Link from 'next/link';
import { YStack, XStack, styled, GetProps } from 'tamagui';
import { GlassCard } from '@arcadeum/ui';
import { CopyActionButton } from '@/features/support/copy-action/ui/CopyActionButton';

export const supportStyles = `
  @keyframes supportFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .support-page {
    min-height: 100vh;
    padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 5vw, 2rem);
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .support-content-wrapper {
    z-index: 1;
    position: relative;
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 5vw, 4rem);
    animation: supportFadeIn 0.8s ease-out forwards;
    width: 100%;
  }

  .support-animated-card {
    animation: supportFadeIn 0.8s ease-out forwards;
    opacity: 0;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .support-animated-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    border-color: var(--color-primary-gradient-start, #7ad7ff);
  }

  .support-section-title {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .support-section-title::before {
    content: '';
    display: block;
    width: 6px;
    height: 24px;
    border-radius: 4px;
    flex-shrink: 0;
    background: linear-gradient(
      180deg,
      var(--color-primary-gradient-start, #7ad7ff),
      var(--color-primary-gradient-end, #a78bfa)
    );
  }

  .support-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    font-size: 0.95rem;
    border: 1px solid #32353d;
    background: rgba(50, 53, 61, 0.5);
    color: var(--color);
    transition: all 0.2s ease;
  }

  .support-cta:focus-visible {
    outline: 2px solid var(--color-border-focus, #7ad7ff);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .support-cta:hover {
      transform: translateY(-2px);
      border-color: #7ad7ff;
      background: rgba(50, 53, 61, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .support-cta {
      transition: none;
    }
    .support-cta:hover {
      transform: none;
    }
  }

  .support-linkedin-btn {
    padding: 0.4rem;
    border-radius: 50%;
    min-width: auto;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .support-linkedin-btn span {
    font-size: 1.2rem;
  }

  .support-copy-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .support-copy-wrapper > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .support-copy-wrapper button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    font-size: 0.95rem;
    border: 1px solid #32353d;
    background: rgba(50, 53, 61, 0.5);
    color: var(--color);
    transition: all 0.2s ease;
    width: 100%;
    cursor: pointer;
  }

  @media (hover: hover) and (pointer: fine) {
    .support-copy-wrapper button:hover {
      transform: translateY(-2px);
      border-color: #7ad7ff;
      background: rgba(50, 53, 61, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .support-copy-wrapper button {
      transition: none;
    }
    .support-copy-wrapper button:hover {
      transform: none;
    }
  }

  .support-copy-notice {
    display: block;
    margin-top: 0.35rem;
    min-height: 1.2rem;
    font-size: 0.8rem;
    color: var(--color-accent, #7ad7ff);
    text-align: center;
  }
`;

export const Page = styled(YStack, {
  name: 'SupportPageRoot',
  minHeight: '100vh',
  backgroundColor: '$background',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
});

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
  $delay,
  style,
  className,
  ...props
}: {
  children: React.ReactNode;
  $delay?: string;
} & GetProps<typeof GlassCard>) {
  return (
    <GlassCard
      {...props}
      className={`support-animated-card ${className || ''}`}
      style={[style, { animationDelay: $delay || '0s' }]}
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

import { Paragraph, H3 } from 'tamagui';

export const Tagline = styled(Paragraph, {
  color: '$color',
  opacity: 0.7,
  maxWidth: 650,
  lineHeight: '$relaxed',
});

export function SectionTitle({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <h2 id={id} className="support-section-title" style={{ color: 'inherit' }}>
      {children}
    </h2>
  );
}

export const HeaderDescription = styled(Paragraph, {
  color: '$color',
  opacity: 0.5,
  maxWidth: 700,
  lineHeight: '$multiplier17',
});

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
  $hasLinkedin,
}: {
  children: React.ReactNode;
  $hasLinkedin: boolean;
}) {
  return (
    <YStack
      position="relative"
      flexDirection="column"
      gap="$2"
      paddingBottom={$hasLinkedin ? '3.5rem' : 0}
    >
      {children}
    </YStack>
  );
}

export const TeamHeader = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
});

export function TeamIcon({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}
      {...props}
    >
      {children}
    </span>
  );
}

export const TeamName = styled(H3, {
  margin: 0,
  fontSize: '$6',
  fontWeight: '700',
  color: '$color',
  marginBottom: '$1',
});

export const TeamRole = styled(Paragraph, {
  color: '$color',
  opacity: 0.8,
  marginBottom: '$2',
});

export const TeamBio = styled(Paragraph, {
  color: '$color',
  opacity: 0.6,
  lineHeight: '$multiplier16',
});

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

export const ActionHeader = styled(XStack, {
  alignItems: 'center',
  gap: '$3',
});

export const ActionTitle = styled(H3, {
  color: '$color',
  opacity: 0.9,
});

export const ActionDescription = styled(Paragraph, {
  color: '$color',
  opacity: 0.6,
  lineHeight: '$multiplier16',
});

export const CtaRow = styled(XStack, {
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
});

export const CtaLink = ({
  children,
  href,
  ...props
}: {
  children: React.ReactNode;
  href: string;
} & Omit<ComponentProps<typeof Link>, 'href' | 'children'>) => (
  <Link className="support-cta" href={href} {...props}>
    {children}
  </Link>
);

export const ExternalCta = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode;
}) => (
  <a className="support-cta" {...props}>
    {children}
  </a>
);

export const LinkedInButton = ({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode;
  as?: string;
}) => {
  const { as: _as, ...rest } = props as {
    as?: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
  return (
    <a className="support-cta support-linkedin-btn" {...rest}>
      {children}
    </a>
  );
};

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

export const Thanks = styled(Paragraph, {
  color: '$color',
  opacity: 0.6,
  lineHeight: '$multiplier17',
});
