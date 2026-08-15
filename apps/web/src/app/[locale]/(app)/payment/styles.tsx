import type { ComponentProps } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { TextArea } from '@arcadeum/ui';

export function StyledTextArea(
  props: ComponentProps<typeof TextArea> & { 'aria-label'?: string },
) {
  return (
    <TextArea
      {...props}
      className={cx(
        'box-border rounded-2xl border border-[var(--borderColor)] p-4 text-[18px] leading-[24px]',
        props.className,
      )}
    />
  );
}

export function StatusMessage({
  messageType,
  className,
  children,
  ...props
}: {
  messageType: 'error' | 'success';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-2 rounded-2xl border p-4',
        messageType === 'error'
          ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]'
          : 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
