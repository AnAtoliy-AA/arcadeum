import { cx } from '@arcadeum/ui/utils/cx';

export function CardFrame({
  small,
  className,
  ...props
}: {
  small?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border relative flex flex-col items-stretch overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.04)]',
        small ? 'w-[144px]' : 'w-[200px]',
        className,
      )}
      {...props}
    />
  );
}

export function ArtBox({
  small,
  className,
  ...props
}: {
  small?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border relative flex items-center justify-center',
        small ? 'h-[96px]' : 'h-[140px]',
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  backgroundColor,
  borderColor,
  className,
  ...props
}: {
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border rounded-lg border border-[var(--borderColor)] px-1.5 py-0.5',
        className,
      )}
      style={{ backgroundColor, borderColor }}
      {...props}
    />
  );
}

const ACTION_INTENT_CLASS = {
  buy: 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.30)]',
  equip:
    'bg-[rgba(16,185,129,0.12)] border-[rgba(34,197,94,0.45)] hover:bg-[rgba(16,185,129,0.20)] hover:border-[rgba(34,197,94,0.70)]',
  unequip:
    'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.28)]',
} as const;

export function ActionButton({
  intent,
  affordable = true,
  pending = false,
  className,
  ...props
}: {
  intent: keyof typeof ACTION_INTENT_CLASS;
  affordable?: boolean;
  pending?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        'box-border flex w-full cursor-pointer flex-row items-center justify-center gap-1.5 rounded-xl border px-4 py-2 transition-colors duration-150 focus:outline-2 focus:outline-[rgba(125,211,252,0.6)] focus:outline-offset-1 focus:outline-solid',
        ACTION_INTENT_CLASS[intent],
        !affordable && 'opacity-[0.7]',
        pending && 'opacity-[0.55]',
        className,
      )}
      {...props}
    />
  );
}

export function uuid(): string {
  return globalThis.crypto.randomUUID();
}
