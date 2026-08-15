import { memo } from 'react';
import type { ReactElement } from 'react';
import { Button } from '../Button/Button';
import { Typography } from '../Typography/Typography';
import { cx } from '../../utils/cx';

export type ErrorStateProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  'data-testid'?: string;
  className?: string;
};

export const ErrorState = memo(function ErrorState({
  message,
  title,
  onRetry,
  retryLabel = 'Try Again',
  'data-testid': dataTestId,
  className,
}: ErrorStateProps): ReactElement {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'box-border flex flex-col items-center justify-center gap-4 p-8',
        className,
      )}
      style={{ backgroundColor: 'var(--background)' }}
    >
      <span style={{ fontSize: 32 }}>⚠️</span>
      {title && (
        <Typography
          className="m-0 text-[20px] font-semibold"
          color="var(--color)"
        >
          {title}
        </Typography>
      )}
      <Typography uiSize="sm" color="var(--color)" className="text-center opacity-60">
        {message}
      </Typography>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
});
