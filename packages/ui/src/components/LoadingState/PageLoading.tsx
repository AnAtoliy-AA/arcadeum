import { memo } from 'react';
import type { ReactElement } from 'react';
import { cx } from '../../utils/cx';
import {
  ShimmerBox,
  HomeLoading,
  GridLayout,
  StandardLoading,
  StatsLoading,
  RoomLoading,
  AuthLoading,
  CardsLoading,
  TableLoading,
  ChatLoading,
  ProfileLoading,
  SplashLoading,
} from './layouts';

export type PageLoadingLayout =
  | 'standard'
  | 'stats'
  | 'grid'
  | 'room'
  | 'auth'
  | 'home'
  | 'cards'
  | 'table'
  | 'chat'
  | 'profile'
  | 'splash';

export interface PageLoadingProps {
  layout?: PageLoadingLayout;
  className?: string;
  message?: string;
  'data-testid'?: string;
}

const layoutRenderers: Record<
  PageLoadingLayout,
  (props?: { message?: string }) => ReactElement
> = {
  home: HomeLoading,
  grid: GridLayout,
  standard: StandardLoading,
  stats: StatsLoading,
  room: RoomLoading,
  auth: AuthLoading,
  cards: CardsLoading,
  table: TableLoading,
  chat: ChatLoading,
  profile: ProfileLoading,
  splash: (props) => <SplashLoading message={props?.message} />,
};

export const PageLoading = memo(function PageLoading({
  layout = 'standard',
  className,
  message,
  'data-testid': dataTestId = 'page-loading',
}: PageLoadingProps) {
  const Renderer = layoutRenderers[layout] ?? layoutRenderers.standard;

  if (layout === 'splash') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading Arcadeum"
        data-testid={dataTestId}
        className={cx(
          'flex min-h-screen w-full items-center justify-center bg-[var(--background)] text-[var(--color)]',
          className,
        )}
      >
        <Renderer message={message} />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      data-testid={dataTestId}
      className={cx(
        'min-h-screen w-full bg-[var(--background)] px-4 py-8 text-[var(--color)] sm:px-6 lg:px-8',
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {layout !== 'home' && layout !== 'auth' && (
          <div className="flex flex-col gap-3">
            <ShimmerBox className="h-10 w-64 rounded-xl" />
            <ShimmerBox className="h-4 w-96 max-w-full" />
          </div>
        )}
        <Renderer message={message} />
      </div>
    </div>
  );
});

export { SplashLoading } from './layouts/SplashLoading';
export { ShimmerBox, GlassPanel } from './layouts/primitives';
