import { memo } from 'react';
import { PageTitle } from '../PageTitle/PageTitle';
import { Typography } from '../Typography/Typography';
import { cx } from '../../utils/cx';

export type ChatHeaderProps = {
  title: string;
  isConnected: boolean;
  statusText?: string;
  onBack?: () => void;
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        'h-2 w-2 rounded-full',
        connected
          ? 'bg-[var(--success)] shadow-[0_0_8px_color-mix(in_srgb,var(--success)_50%,transparent)]'
          : 'bg-[var(--warning)] shadow-[0_0_8px_color-mix(in_srgb,var(--warning)_30%,transparent)]',
      )}
    />
  );
}

export const ChatHeader = memo(function ChatHeader({
  title,
  isConnected,
  statusText,
}: ChatHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between border-b border-b-[var(--glassBorder)] bg-[var(--glassBg)] px-5 py-3 backdrop-blur-[24px]">
      <div className="flex flex-col items-stretch gap-1">
        <PageTitle size="sm" gradient>
          {title || 'Chat'}
        </PageTitle>
        <div className="flex flex-row items-center gap-2 opacity-80">
          <StatusDot connected={isConnected} />
          <Typography
            uiSize="xs"
            weight="600"
            alpha="medium"
            className="uppercase tracking-[1px]"
          >
            {statusText}
          </Typography>
        </div>
      </div>
    </div>
  );
});
