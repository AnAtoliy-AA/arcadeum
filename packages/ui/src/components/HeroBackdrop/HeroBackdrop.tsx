import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type HeroBackdropProps = {
  children?: ReactNode;
  testID?: string;
  'data-testid'?: string;
  className?: string;
};

const ORB_KEYFRAMES = `
@keyframes arcadeum-orb-drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -20px) scale(1.05); }
}
@keyframes arcadeum-orb-drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.08); }
}
`;

const STYLE_ID = '__arcadeum-hero-orbs';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = ORB_KEYFRAMES;
  document.head.appendChild(styleEl);
}

const RootClasses = [
  '',
  'relative',
  'flex',
  'flex-col',
  'gap-4',
  'overflow-hidden',
  'rounded-3xl',
  'border',
  'border-[var(--borderColor)]',
  'px-6',
  'py-8',
  'min-h-[240px]',
].join(' ');

const LayerClasses = 'pointer-events-none absolute inset-0';

const ContentClasses = 'relative z-[1] flex flex-col gap-4';

export function HeroBackdrop({
  children,
  testID,
  'data-testid': dataTestId,
  className,
}: HeroBackdropProps) {
  return (
    <div
      data-testid={dataTestId ?? testID}
      className={cx(RootClasses, className)}
    >
      <div
        className={LayerClasses}
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          opacity: 0.35,
        }}
      />
      <div
        className={LayerClasses}
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className={LayerClasses}
        style={{
          top: -40,
          left: -40,
          width: 320,
          height: 320,
          background:
            'radial-gradient(closest-side, rgba(167,139,250,0.45), transparent)',
          filter: 'blur(60px)',
          animation: 'arcadeum-orb-drift-a 14s ease-in-out infinite',
        }}
      />
      <div
        className={LayerClasses}
        style={{
          top: 40,
          right: -60,
          left: 'auto',
          bottom: 'auto',
          width: 280,
          height: 280,
          background:
            'radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)',
          filter: 'blur(70px)',
          animation: 'arcadeum-orb-drift-b 16s ease-in-out infinite',
        }}
      />
      <div className={ContentClasses}>{children}</div>
    </div>
  );
}
