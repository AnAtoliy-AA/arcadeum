import { memo } from 'react';
import type { ReactElement } from 'react';
import { Spinner, SpinnerSize } from '../Spinner/Spinner';
import { cx } from '../../utils/cx';

export type LoadingStateProps = {
  message?: string;
  size?: SpinnerSize;
  'data-testid'?: string;
  className?: string;
};

export const LoadingState = memo(function LoadingState({
  message = 'Loading...',
  size = 'md',
  'data-testid': dataTestId,
  className,
}: LoadingStateProps): ReactElement {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-col items-center justify-center gap-4 p-8',
        className,
      )}
    >
      <Spinner size={size} />
      {message && (
        <span className="text-[14px] leading-[18px] text-[var(--color)] opacity-60">
          {message}
        </span>
      )}
    </div>
  );
});
