'use client';

import { useState, useCallback, memo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import { cx } from '../../utils/cx';

export type CollapsibleSectionProps = {
  title?: string;
  description?: string;
  defaultExpanded?: boolean;
  showLabel?: string;
  hideLabel?: string;
  headerContent?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  description,
  defaultExpanded = true,
  showLabel = 'Show',
  hideLabel = 'Hide',
  headerContent,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);

  return (
    <div
      className={cx(
        'flex w-full flex-col gap-2 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-[18px] font-semibold text-[var(--color)]">
              {title}
            </span>
          )}
          {headerContent}
        </div>
        <Button variant="outline" size="sm" onClick={toggle}>
          <span className="flex items-center gap-1">
            <span className="text-[14px]">
              {isExpanded ? hideLabel : showLabel}
            </span>
            <span
              className={cx(
                'text-[14px] transition-transform duration-200',
                isExpanded ? '' : 'rotate-180',
              )}
            >
              ▼
            </span>
          </span>
        </Button>
      </div>
      {description && (
        <span className="mb-2 block text-[14px] text-[var(--color)] opacity-60">
          {description}
        </span>
      )}
      {isExpanded && children}
    </div>
  );
});
