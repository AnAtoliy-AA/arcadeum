import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type LogoInnerProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
};

const LogoInnerClasses = [
  '',
  'flex',
  'shrink-0',
  'cursor-pointer',
  'flex-row',
  'items-center',
  'gap-3',
  'transition-[transform,opacity]',
  'duration-150',
  'ease-out',
  'hover:scale-[1.02]',
  'hover:opacity-95',
].join(' ');

export const LogoInner = ({
  children,
  className,
  style,
  'data-testid': testId,
}: LogoInnerProps) => {
  return (
    <div
      data-testid={testId ?? 'logo-inner'}
      className={cx(LogoInnerClasses, className)}
      style={style}
    >
      {children}
    </div>
  );
};

LogoInner.displayName = 'LogoInner';
