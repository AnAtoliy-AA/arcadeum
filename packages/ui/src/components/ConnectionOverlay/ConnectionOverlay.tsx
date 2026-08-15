import { memo } from 'react';
import { Spinner } from '../Spinner/Spinner';
import { WifiOffIcon } from '../Icons';
import { cx } from '../../utils/cx';

export type ConnectionOverlayProps = {
  visible: boolean;
  reconnecting?: boolean;
  onReconnect?: () => void;
  title?: string;
  message?: string;
  reconnectingText?: string;
  testId?: string;
  'data-testid'?: string;
  className?: string;
};

const BackdropClasses = [
  'box-border',
  'absolute',
  'inset-0',
  'z-[1000]',
  'flex',
  'flex-col',
  'items-center',
  'justify-center',
  'gap-5',
  'bg-[var(--overlayBg)]',
  'backdrop-blur-[10px]',
].join(' ');

const IconWrapperClasses = [
  'box-border',
  'flex',
  'h-[60px]',
  'w-[60px]',
  'flex-row',
  'items-center',
  'justify-center',
  'rounded-full',
  'border',
  'border-[var(--glassBorder)]',
  'bg-[var(--glassBg)]',
].join(' ');

export const ConnectionOverlay = memo(function ConnectionOverlay({
  visible,
  reconnecting = false,
  onReconnect,
  title = 'Connection Lost',
  message = 'Tap anywhere or move your mouse to reconnect',
  reconnectingText = 'Reconnecting...',
  testId,
  'data-testid': dataTestId,
  className,
}: ConnectionOverlayProps) {
  if (!visible) return null;

  return (
    <div
      onClick={onReconnect}
      data-testid={dataTestId ?? testId}
      className={cx(BackdropClasses, className)}
    >
      {reconnecting ? (
        <Spinner size="lg" />
      ) : (
        <div className={IconWrapperClasses}>
          <WifiOffIcon size={28} />
        </div>
      )}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[20px] font-semibold text-white">
          {reconnecting ? reconnectingText : title}
        </span>
        {!reconnecting && (
          <span className="max-w-[280px] text-center text-[16px] text-white opacity-[0.6]">
            {message}
          </span>
        )}
      </div>
    </div>
  );
});
