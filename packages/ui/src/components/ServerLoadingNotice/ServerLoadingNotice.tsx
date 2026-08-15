'use client';
import { memo } from 'react';
import { Spinner } from '../Spinner';
import { Button } from '../Button';
import { ProgressBar } from '../Progress/Progress';
import { cx } from '../../utils/cx';

export type ServerLoadingNoticeProps = {
  title: string;
  message: string;
  progress: number;
  elapsedSeconds: number;
  supportLabel: string;
  onSupportClick: () => void;
  className?: string;
};

export const ServerLoadingNotice = memo(function ServerLoadingNotice({
  title,
  message,
  progress,
  elapsedSeconds,
  supportLabel,
  onSupportClick,
  className,
}: ServerLoadingNoticeProps) {
  return (
    <div
      className={cx(
        'relative',
        '',
        'flex',
        'flex-col',
        'gap-3',
        'max-w-[480px]',
        'overflow-hidden',
        'rounded-2xl',
        'border',
        'border-[rgba(37,99,235,0.4)]',
        'bg-[rgba(37,99,235,0.1)]',
        'p-5',
        'shadow-[0_6px_14px_rgba(37,99,235,0.2)]',
        className,
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <Spinner size="sm" color="var(--primary)" />
        <span className="text-[18px] font-bold leading-[24px] tracking-[0.5px] text-[var(--color)]">
          {title}
        </span>
      </div>

      <div className="flex flex-col gap-4 pl-8">
        <p className="m-0 text-[16px] leading-[24px] text-[var(--color)] opacity-80">
          {message}
        </p>

        <div className="flex flex-col gap-2">
          <ProgressBar value={progress} height={10} color="var(--primary)" />
          <div className="flex flex-row items-center justify-between">
            <span className="text-[16px] font-bold leading-[24px] text-[var(--primary)]">
              {Math.round(progress)}%
            </span>
            <span className="text-[14px] font-medium leading-[18px] opacity-60">
              {elapsedSeconds}s
            </span>
          </div>
        </div>

        <div className="mt-1 flex flex-row justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onSupportClick}
            shape="round"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {supportLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});
