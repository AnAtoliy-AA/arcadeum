import { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { getThemeById } from '@/features/games/lib/shared-themes';

export {
  Button,
  type ButtonProps,
  BotCountButton,
  DeleteButton,
  StartButton,
  IconButton,
  RefreshButton,
} from '@arcadeum/ui';

export const LobbyContent = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-start gap-5 flex-1 min-h-0 p-5 pb-[96px] overflow-y-auto overflow-x-hidden max-[1023px]:flex-col max-[1023px]:flex-1 max-[1023px]:min-h-0 max-[1023px]:overflow-y-visible max-[1023px]:overflow-x-visible max-[1023px]:p-3 max-[1023px]:pb-[96px] max-[1023px]:gap-3 max-[1023px]:items-stretch',
      className,
    )}
  >
    {children}
  </div>
);

export const CenterSection = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center gap-5 flex-1 min-w-0 max-w-full min-h-full max-[1023px]:flex-[0] max-[1023px]:min-h-[unset] max-[1023px]:w-full max-[1023px]:justify-start max-[1023px]:gap-3',
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

export const GameIcon = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[80px] leading-[96px] [filter:drop-shadow(0_8px_24px_rgba(99,102,241,0.3))] max-[800px]:text-[48px] max-[800px]:leading-[60px]',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);

export const LobbyTitle = ({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <h2
    className={cx(
      'text-[28px] max-[800px]:text-[20px] font-bold text-center',
      className,
    )}
    style={style}
  >
    {children}
  </h2>
);

export const LobbyEmptyText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[16px] text-[rgba(180,180,200,0.7)] text-center pt-5 leading-[1]',
      className,
    )}
  >
    {children}
  </span>
);

export const LobbySubtitle = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <p
    className={cx(
      'text-[16px] max-[800px]:text-[13px] text-[var(--textSecondary)] text-center max-w-[400px]',
      className,
    )}
  >
    {children}
  </p>
);

export const RoomNameBadge = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-2 py-2 px-4 bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] rounded-[20px] max-w-full overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);

export const RoomNameIcon = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span className={cx('text-[18px] inline-flex', className)}>{children}</span>
);

export const RoomNameText = ({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) => (
  <span
    data-testid={dataTestId}
    className={cx(
      'text-[20px] font-bold overflow-hidden truncate',
      'bg-gradient-to-r from-[var(--color)] via-[var(--primary)] to-[var(--color)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer',
      className,
    )}
  >
    {children}
  </span>
);

export * from './lobbySidebarStyles';
export * from './lobbyProgressStyles';

export const WaitingDots = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-stretch gap-2', className)}>
    {children}
  </div>
);

export const Dot = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={cx(
      'w-2 h-2 rounded-[4px] bg-[#6366f1] opacity-[0.6]',
      className,
    )}
    style={style}
  />
);

export const VariantSelectorWrapper = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-center relative ml-2', className)}>
    {children}
  </div>
);

export type GameContainerStylesProps = {
  className?: string;
  theme?: string;
  variant?: string;
  bgImage?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export const GameContainer = forwardRef<unknown, GameContainerStylesProps>(
  function GameContainer(
    { className, theme, variant, bgImage, style, children },
    ref,
  ) {
    const themeObj = theme
      ? getThemeById(theme)
      : variant
        ? getThemeById(variant)
        : undefined;
    const resolvedBgImage = bgImage ?? themeObj?.bgImage;

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cx(
          'relative flex flex-col items-stretch flex-1 min-h-0 w-full max-w-full overflow-y-auto bg-[var(--background)] max-[1023px]:min-h-0 max-[1023px]:flex-1',
          className,
        )}
        style={style}
      >
        {resolvedBgImage && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${resolvedBgImage})` }}
          />
        )}
        <div className="relative z-[1] flex flex-col items-stretch min-h-0 w-full max-w-full">
          {children}
        </div>
      </div>
    );
  },
);

export {
  GameHeader,
  GameInfo,
  GameTitleText,
  VariantText,
  HeaderActions,
} from './lobbyStyles-header';

export const BotCountSelector = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center gap-1.5 mb-1.5 max-[800px]:mb-1',
      className,
    )}
  >
    {children}
  </div>
);

export { BotCountLabel, BotCountButtons } from './lobbyStyles-botcount';
