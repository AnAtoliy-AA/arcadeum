import type { CSSProperties, FormEventHandler, ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Input as UIInput } from '@arcadeum/ui';

export const roomStyles = `
  .games-room-container.games-room-container.is-fullscreen.is-fullscreen {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    margin: 0;
    padding: 0.5rem;
    background: #151718;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
  }
  @media (min-width: 801px) {
    .games-room-container.games-room-container.is-fullscreen.is-fullscreen {
      padding: 1rem 1.5rem;
    }
  }
`;

export const formAnimationsCss = `
  @keyframes cardEnter {
    0% { opacity: 0; transform: translateY(24px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes iconGlow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(2px); }
  }
  .icon-pulse {
    position: relative;
  }
  .icon-pulse::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(139,92,246,0.25);
    animation: iconGlow 3s ease-in-out infinite;
    pointer-events: none;
  }
`;

/**
 * Animation utilities for the room forms. The `animation` declarations live
 * in classes (not inline styles) so the global reduced-motion kill-switch in
 * utilities.scss keeps applying to them.
 */
export const cardEnterClass =
  '[animation:cardEnter_500ms_cubic-bezier(0.16,1,0.3,1)_both]';

export const fadeInUpClass =
  '[animation:fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_var(--anim-delay)_both]';

/** Per-element stagger delay consumed by `fadeInUpClass`. */
export const animationDelayVars = (delay: string): CSSProperties =>
  ({ '--anim-delay': delay }) as CSSProperties;

export const errorShakeClass = 'animate-[errorShake_0.4s_ease-in-out]';

export function Container({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex w-full max-w-[1400px] flex-col gap-4 p-4 mx-auto flex-1 min-h-0 max-[1150px]:overflow-y-auto max-[1023px]:p-3 max-[1023px]:gap-3 max-[800px]:p-2 max-[800px]:gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CenteredContainer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Container className={cx('items-center justify-center', className)}>
      {children}
    </Container>
  );
}

export function LoadingContainer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex min-h-[50vh] flex-col items-center justify-center text-[18px] text-[var(--textSecondary)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ErrorContainer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center p-8 text-[var(--danger)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GameWrapper({
  className,
  children,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-visible rounded-2xl max-[1150px]:grow-0 max-[1150px]:shrink-0 max-[1150px]:basis-auto max-[1150px]:min-h-[calc(100dvh-180px)] max-[1023px]:grow-0 max-[1023px]:shrink-0 max-[1023px]:basis-auto max-[800px]:min-h-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        'flex w-full max-w-[460px] flex-col items-stretch gap-0 overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-10 pb-10 pt-14 mx-auto backdrop-blur-[32px]',
        className,
      )}
      style={
        style ?? {
          boxShadow:
            '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }
      }
    >
      {children}
    </div>
  );
}

export function IconCircle({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex h-20 w-20 items-center justify-center self-center rounded-full border border-[rgba(139,92,246,0.25)] mb-7',
        className,
      )}
      style={{
        background:
          'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.18) 100%)',
        boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
      }}
    >
      {children}
    </div>
  );
}

export function IconEmoji({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <span className={cx('text-[36px]', className)}>{children}</span>;
}

export function Title({
  className,
  children,
  style,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cx(
        'mb-2.5 text-center text-[26px] font-bold tracking-[-0.15px] text-[var(--accent)]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function Description({
  className,
  children,
  style,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx('mb-8 flex flex-col items-center px-4', className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function DescriptionText({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-center text-[15px] leading-[22px] opacity-[0.6] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Form({
  className,
  children,
  style,
  onSubmit,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form
      className={cx('flex w-full flex-col gap-4', className)}
      style={style}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}

export function InputRow({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx('flex w-full flex-col items-stretch gap-3', className)}>
      {children}
    </div>
  );
}

export function ErrorMessage({
  className,
  children,
  style,
}: {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center self-center rounded-xl border border-[var(--errorBorder)] bg-[var(--errorBg)] px-8 py-3',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function ErrorText({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-center text-[14px] font-semibold text-[var(--error)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export { UIInput as Input };

export function LoginLink({
  className,
  children,
  href,
}: {
  className?: string;
  children?: ReactNode;
  href?: string;
}) {
  return (
    <a
      className={cx(
        'mt-4 inline-block text-[var(--accent)] underline',
        className,
      )}
      href={href}
    >
      {children}
    </a>
  );
}

export function NoticeMessage({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'self-center rounded-xl border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.08)] px-4 py-2.5 text-center text-[13px] text-[var(--accent)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
