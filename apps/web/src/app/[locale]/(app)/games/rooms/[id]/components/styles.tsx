import type { HTMLAttributes } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Input as UIInput } from '@arcadeum/ui';

export const roomStyles = `
  .games-room-container.is-fullscreen {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 0.5rem !important;
    background: #151718 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 1000;
  }
  @media (min-width: 801px) {
    .games-room-container.is-fullscreen {
      padding: 1rem 1.5rem !important;
    }
  }
`;

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const formAnimationsCss = `
  @keyframes cardEnter {
    0% { opacity: 0; transform: translateY(24px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes iconGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.35), 0 4px 20px rgba(139,92,246,0.2); }
    50% { box-shadow: 0 0 0 12px rgba(139,92,246,0), 0 4px 28px rgba(139,92,246,0.35); }
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

export const cardEnterStyle = {
  animation: `cardEnter 500ms ${ease} both`,
} as const;

export const fadeInUpDelayed = (delay: string) =>
  ({
    animation: `fadeInUp 500ms ${ease} ${delay} both`,
  }) as const;

export const errorShakeStyle = {
  animation: 'errorShake 0.4s ease-in-out',
} as const;

type DivProps = HTMLAttributes<HTMLDivElement> & { className?: string };
type SpanProps = HTMLAttributes<HTMLSpanElement> & { className?: string };

export function Container({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex w-full max-w-[1400px] flex-col gap-4 p-4 mx-auto flex-1 min-h-0 max-[1150px]:overflow-y-auto max-[1023px]:p-3 max-[1023px]:gap-3 max-[800px]:p-2 max-[800px]:gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function CenteredContainer({ className, ...props }: DivProps) {
  return (
    <Container
      className={cx('items-center justify-center', className)}
      {...props}
    />
  );
}

export function LoadingContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex min-h-[50vh] flex-col items-center justify-center text-[18px] text-[var(--textSecondary)]',
        className,
      )}
      {...props}
    />
  );
}

export function ErrorContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center p-8 text-[var(--danger)]',
        className,
      )}
      {...props}
    />
  );
}

export function GameWrapper({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-visible rounded-2xl max-[1150px]:grow-0 max-[1150px]:shrink-0 max-[1150px]:basis-auto max-[1150px]:min-h-[calc(100dvh-180px)] max-[1023px]:grow-0 max-[1023px]:shrink-0 max-[1023px]:basis-auto max-[800px]:min-h-0',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex w-full max-w-[460px] flex-col items-stretch gap-0 overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-10 pb-10 pt-14 mx-auto backdrop-blur-[32px]',
        className,
      )}
      style={{
        boxShadow:
          '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
      }}
      {...props}
    />
  );
}

export function IconCircle({ className, ...props }: DivProps) {
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
      {...props}
    />
  );
}

export function IconEmoji({ className, ...props }: SpanProps) {
  return <span className={cx('text-[36px]', className)} {...props} />;
}

export function Title({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'mb-2.5 text-center text-[26px] font-bold tracking-[-0.15px] text-[var(--accent)]',
        className,
      )}
      {...props}
    />
  );
}

export function Description({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('mb-8 flex flex-col items-center px-4', className)}
      {...props}
    />
  );
}

export function DescriptionText({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'text-center text-[15px] leading-[22px] opacity-[0.6] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function Form({
  className,
  ...props
}: HTMLAttributes<HTMLFormElement> & { className?: string }) {
  return (
    <form className={cx('flex w-full flex-col gap-4', className)} {...props} />
  );
}

export function InputRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex w-full flex-col items-stretch gap-3', className)}
      {...props}
    />
  );
}

export function ErrorMessage({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center self-center rounded-xl border border-[var(--errorBorder)] bg-[var(--errorBg)] px-8 py-3',
        className,
      )}
      {...props}
    />
  );
}

export function ErrorText({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'text-center text-[14px] font-semibold text-[var(--error)]',
        className,
      )}
      {...props}
    />
  );
}

export { UIInput as Input };

export function LoginLink({
  className,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { className?: string }) {
  return (
    <a
      className={cx(
        'mt-4 inline-block text-[var(--accent)] underline',
        className,
      )}
      {...props}
    />
  );
}

export function NoticeMessage({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'self-center rounded-xl border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.08)] px-4 py-2.5 text-center text-[13px] text-[var(--accent)]',
        className,
      )}
      {...props}
    />
  );
}
