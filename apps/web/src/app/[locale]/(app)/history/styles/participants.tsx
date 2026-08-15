import type React from 'react';
import { type ReactNode, type ComponentProps } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';

export function ParticipantRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-between px-5 py-4 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--backgroundStrong, rgba(255,255,255,0.03))]',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantInfo({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-3 flex-1',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantName({
  children,
  ...props
}: { children?: ReactNode } & ComponentProps<typeof Typography>) {
  return (
    <Typography className={'flex-1'} weight="500" {...props}>
      {children}
    </Typography>
  );
}

// Native checkbox — appearance:none + pseudo-selectors handled via Tailwind classes.
// Styles injected via a <style> block rendered alongside the component.
const checkboxStyles = `
  .history-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    background: transparent;
    flex-shrink: 0;
  }
  .history-checkbox:checked {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-color: #6366f1;
  }
  .history-checkbox:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
  }
  .history-checkbox:hover {
    border-color: #6366f1;
  }
  .history-checkbox:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
`;

export function Checkbox(props: ComponentProps<'input'>) {
  return (
    <>
      <style>{checkboxStyles}</style>
      <input {...props} type="checkbox" className="history-checkbox" />
    </>
  );
}
