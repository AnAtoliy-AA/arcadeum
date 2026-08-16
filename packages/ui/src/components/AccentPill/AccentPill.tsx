import { memo } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type AccentPillProps = Omit<HTMLAttributes<HTMLSpanElement>, 'style'> & {
  accent: string;
  dot?: boolean;
  className?: string;
  children?: ReactNode;
};

export const AccentPill = memo(function AccentPill({
  accent,
  dot = true,
  className,
  children,
  ...rest
}: AccentPillProps): React.ReactElement {
  const style = { '--pill-accent': accent } as CSSProperties;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border border-solid px-[9px] py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur',
        'border-[color:color-mix(in_srgb,var(--pill-accent)_35%,transparent)] text-[color:color-mix(in_srgb,var(--pill-accent)_80%,white)]',
        className,
      )}
      style={style}
      {...rest}
    >
      {dot ? (
        <span
          className="inline-block h-[5px] w-[5px] rounded-full bg-[var(--pill-accent)] shadow-[0_0_8px_var(--pill-accent)]"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
});
