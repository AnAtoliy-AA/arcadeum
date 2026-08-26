import { cx } from '../../utils/cx';

export type FooterLinkProps = {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
};

export function FooterLink({
  href,
  onClick,
  children,
  className,
  'data-testid': dataTestId,
}: FooterLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      data-testid={dataTestId}
      className={cx(
        'no-underline transition-all duration-200',
        'text-[15px] leading-6 text-[var(--color)] opacity-85',
        'hover:translate-x-1 hover:text-[var(--primary)] hover:opacity-100',
        'active:scale-[0.98] active:opacity-80',
        className,
      )}
    >
      {children}
    </a>
  );
}
