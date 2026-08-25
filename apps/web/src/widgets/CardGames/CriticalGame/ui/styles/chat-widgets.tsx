import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { memo } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

const CHAT_BUBBLE_POSITION_CLASS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  left: 'top-1/2 right-full -translate-y-1/2 mr-3',
  right: 'top-1/2 left-full -translate-y-1/2 ml-3',
} as const;

interface ChatBubbleContainerProps {
  visible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode;
  variant?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

export const ChatBubbleContainer = memo(function ChatBubbleContainer({
  visible,
  position,
  variant: _variant,
  style,
  'data-testid': testId,
  children,
}: ChatBubbleContainerProps): ReactElement {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch absolute py-1 px-3 rounded-full border border-[rgba(255,255,255,0.14)] max-w-[180px] z-[100] transition-all duration-150 ease-out',
        visible
          ? 'opacity-[1] scale-[1]'
          : 'opacity-0 scale-[0.9] pointer-events-none',
        position ? CHAT_BUBBLE_POSITION_CLASS[position] : undefined,
      )}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2.5px 5px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      data-testid={testId}
    >
      {children}
    </div>
  );
});
