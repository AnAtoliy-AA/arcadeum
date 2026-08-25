import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type SectionProps = {
  title?: string;
  description?: string;
  variant?: 'legal';
  children: ReactNode;
  'data-testid'?: string;
  className?: string;
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  function Section(
    { title, description, variant, children, 'data-testid': dataTestId, className },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-testid={dataTestId}
        className={cx(
          '',
          'flex',
          'flex-col',
          'gap-3',
          'border',
          'border-[var(--borderColor)]',
          'bg-[var(--glassBg)]',
          'backdrop-blur-[10px]',
          variant === 'legal'
            ? 'rounded-[24px] p-6 backdrop-blur-[14px]'
            : 'rounded-2xl p-5',
          className,
        )}
      >
        {title && (
          <h2
            data-testid="section-title"
            className="m-0 text-[20px] font-semibold leading-[28px] text-[var(--color)]"
          >
            {title}
          </h2>
        )}
        {description && (
          <p className="m-0 text-[16px] leading-[18px] text-[var(--color)] opacity-70">
            {description}
          </p>
        )}
        {children}
      </div>
    );
  },
);

Section.displayName = 'Section';
