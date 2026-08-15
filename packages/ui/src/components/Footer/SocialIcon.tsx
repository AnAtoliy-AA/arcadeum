import { cx } from '../../utils/cx';

export type SocialIconProps = {
  href: string;
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function SocialIcon({ href, children, className, ...rest }: SocialIconProps) {
  return (
    <a
      href={href}
      className={cx(
        'flex h-10 w-10 items-center justify-center rounded-[10px] border',
        'bg-[var(--glassBg)] border-[var(--glassBorder)] text-[var(--color)]',
        'transition-all duration-200',
        'hover:scale-[1.1] hover:rotate-[8deg] hover:border-[var(--primary)]',
        'hover:bg-[var(--glassBgHover)] hover:text-[var(--primary)] hover:opacity-100',
        'hover:shadow-[0_0_12px_var(--primary)] hover:shadow-[0_0_12px_rgba(0,0,0,0.15)]',
        'active:scale-95',
        'opacity-80',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
