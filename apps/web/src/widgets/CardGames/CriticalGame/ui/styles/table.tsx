import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

const CARD_SLOT_CLASS = {
  deck: 'w-[74px] h-[102px] max-[800px]:w-[58px] max-[800px]:h-[80px]',
  lastPlayed: 'w-[92px] h-[126px] max-[800px]:w-[72px] max-[800px]:h-[100px]',
} as const;

export function CardSlot({
  className,
  style,
  role,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  role?: 'deck' | 'lastPlayed';
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center relative z-[2]',
        role ? CARD_SLOT_CLASS[role] : undefined,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
