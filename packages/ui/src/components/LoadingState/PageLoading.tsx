import { memo } from 'react';
import type { ReactElement } from 'react';
import { cx } from '../../utils/cx';

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
  | 'profile';

export interface PageLoadingProps {
  layout?: PageLoadingLayout;
  className?: string;
  'data-testid'?: string;
}

function ShimmerBox({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cx(
        'animate-shimmer rounded-lg bg-gradient-to-r from-[var(--borderColor)]/30 via-white/10 to-[var(--borderColor)]/30 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

function GlassPanel({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'relative flex flex-col overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glassBorderHover)] to-transparent" />
      {children}
    </div>
  );
}

function HomeLayout(): ReactElement {
  const cardIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center justify-between gap-12 py-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5">
          <ShimmerBox className="h-7 w-44 rounded-full" />
          <ShimmerBox className="h-14 w-4/5 rounded-2xl" />
          <ShimmerBox className="h-6 w-full max-w-xl rounded-xl" />
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-4 w-5/6" />
            <ShimmerBox className="h-4 w-3/4" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <ShimmerBox className="h-12 w-36 rounded-xl" />
            <ShimmerBox className="h-12 w-44 rounded-xl" />
          </div>
        </div>
        <div className="flex h-72 w-full flex-1 items-center justify-center lg:max-w-md">
          <div className="relative flex h-64 w-60 items-center justify-center">
            <ShimmerBox className="absolute h-56 w-44 -rotate-12 -translate-x-8 rounded-2xl opacity-40" />
            <ShimmerBox className="absolute h-60 w-48 rotate-12 translate-x-8 rounded-2xl opacity-60" />
            <ShimmerBox className="relative z-10 h-64 w-52 rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>

      <GlassPanel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-3 w-3 rounded-full" />
            <ShimmerBox className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-6">
            <ShimmerBox className="h-5 w-24" />
            <ShimmerBox className="h-5 w-24" />
            <ShimmerBox className="h-5 w-24" />
          </div>
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <ShimmerBox className="h-8 w-56 rounded-xl" />
          <ShimmerBox className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cardIndices.map((i) => (
            <GlassPanel key={i} className="gap-4">
              <ShimmerBox className="h-40 w-full rounded-2xl" />
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <ShimmerBox className="h-5 w-3/4" />
                  <ShimmerBox className="h-3 w-1/2" />
                </div>
              </div>
              <ShimmerBox className="mt-2 h-10 w-full rounded-xl" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

function GridLayout(): ReactElement {
  const cardIndices = [0, 1, 2, 3, 4, 5];
  const chipIndices = [0, 1, 2, 3, 4];
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerBox className="h-11 w-full max-w-md rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          {chipIndices.map((i) => (
            <ShimmerBox key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cardIndices.map((i) => (
          <GlassPanel key={i} className="gap-4">
            <ShimmerBox className="h-44 w-full rounded-2xl" />
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-6 w-36" />
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <ShimmerBox className="h-4 w-full" />
              <ShimmerBox className="h-4 w-4/5" />
            </div>
            <div className="mt-2 flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <ShimmerBox className="h-6 w-14 rounded-md" />
                <ShimmerBox className="h-6 w-14 rounded-md" />
              </div>
              <ShimmerBox className="h-9 w-24 rounded-xl" />
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function StandardLayout(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <GlassPanel className="gap-6 p-8">
        <div className="flex items-center gap-4">
          <ShimmerBox className="h-12 w-12 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2">
            <ShimmerBox className="h-7 w-2/5" />
            <ShimmerBox className="h-4 w-1/4" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-11/12" />
          <ShimmerBox className="h-4 w-3/4" />
        </div>
        <ShimmerBox className="h-52 w-full rounded-2xl" />
        <div className="flex flex-col gap-3">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-4/5" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <ShimmerBox className="h-10 w-28 rounded-xl" />
          <ShimmerBox className="h-10 w-36 rounded-xl" />
        </div>
      </GlassPanel>
    </div>
  );
}

function StatsLayout(): ReactElement {
  const metricIndices = [0, 1, 2, 3];
  const rowIndices = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricIndices.map((i) => (
          <GlassPanel key={i} className="gap-3">
            <ShimmerBox className="h-4 w-24" />
            <ShimmerBox className="h-9 w-32 rounded-lg" />
            <ShimmerBox className="h-3 w-16" />
          </GlassPanel>
        ))}
      </div>
      <GlassPanel className="gap-6">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-4">
          <ShimmerBox className="h-6 w-40" />
          <div className="flex gap-2">
            <ShimmerBox className="h-8 w-20 rounded-lg" />
            <ShimmerBox className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {rowIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-[var(--borderColor)]/10 p-3"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-8 w-8 rounded-full" />
                <ShimmerBox className="h-9 w-9 rounded-full" />
                <ShimmerBox className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-6">
                <ShimmerBox className="h-5 w-16" />
                <ShimmerBox className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

function RoomLayout(): ReactElement {
  const playerIndices = [0, 1];
  const messageIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-6 lg:h-[700px] lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <GlassPanel className="flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-9 w-9 rounded-xl" />
            <ShimmerBox className="h-6 w-36" />
            <ShimmerBox className="h-6 w-20 rounded-full" />
          </div>
          <ShimmerBox className="h-9 w-28 rounded-xl" />
        </GlassPanel>

        <GlassPanel className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              {playerIndices.map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <ShimmerBox className="h-16 w-16 rounded-full" />
                  <ShimmerBox className="h-4 w-20" />
                  <ShimmerBox className="h-3 w-12" />
                </div>
              ))}
            </div>
            <ShimmerBox className="h-64 w-64 rounded-2xl sm:h-80 sm:w-80" />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="w-full gap-4 lg:w-80">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <ShimmerBox className="h-5 w-24" />
          <ShimmerBox className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {messageIndices.map((i) => (
            <div key={i} className="flex items-start gap-2">
              <ShimmerBox className="h-7 w-7 rounded-full" />
              <div className="flex flex-1 flex-col gap-1">
                <ShimmerBox className="h-3 w-16" />
                <ShimmerBox className="h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <ShimmerBox className="h-10 w-full rounded-xl" />
      </GlassPanel>
    </div>
  );
}

function AuthLayout(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pt-8">
      <GlassPanel className="w-full items-center gap-6 p-8">
        <ShimmerBox className="h-16 w-16 rounded-2xl" />
        <div className="flex flex-col items-center gap-2">
          <ShimmerBox className="h-8 w-44 rounded-xl" />
          <ShimmerBox className="h-4 w-56" />
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-3 w-16" />
            <ShimmerBox className="h-11 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-3 w-20" />
            <ShimmerBox className="h-11 w-full rounded-xl" />
          </div>
          <ShimmerBox className="mt-2 h-12 w-full rounded-xl" />
        </div>
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-[var(--glassBorder)]" />
          <ShimmerBox className="h-3 w-8" />
          <div className="h-px flex-1 bg-[var(--glassBorder)]" />
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <ShimmerBox className="h-11 w-full rounded-xl" />
          <ShimmerBox className="h-11 w-full rounded-xl" />
        </div>
      </GlassPanel>
    </div>
  );
}

function CardsLayout(): ReactElement {
  const cardIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <ShimmerBox className="h-9 w-24 rounded-xl" />
          <ShimmerBox className="h-9 w-24 rounded-xl" />
        </div>
        <ShimmerBox className="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {cardIndices.map((i) => (
          <GlassPanel key={i} className="gap-3 p-4">
            <ShimmerBox className="aspect-square w-full rounded-2xl" />
            <ShimmerBox className="h-5 w-3/4" />
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-5 w-16 rounded-full" />
              <ShimmerBox className="h-5 w-12" />
            </div>
            <ShimmerBox className="mt-2 h-9 w-full rounded-xl" />
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

function TableLayout(): ReactElement {
  const rowIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerBox className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex gap-2">
          <ShimmerBox className="h-10 w-28 rounded-xl" />
          <ShimmerBox className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <GlassPanel className="p-0">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] bg-[var(--borderColor)]/10 px-6 py-4">
          <ShimmerBox className="h-4 w-28" />
          <ShimmerBox className="h-4 w-24" />
          <ShimmerBox className="h-4 w-20" />
          <ShimmerBox className="h-4 w-16" />
        </div>
        <div className="flex flex-col divide-y divide-[var(--glassBorder)]">
          {rowIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1">
                  <ShimmerBox className="h-4 w-32" />
                  <ShimmerBox className="h-3 w-20" />
                </div>
              </div>
              <ShimmerBox className="h-4 w-24" />
              <ShimmerBox className="h-6 w-20 rounded-full" />
              <ShimmerBox className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

function ChatLayout(): ReactElement {
  const contactIndices = [0, 1, 2, 3, 4];
  const messageIndices = [0, 1, 2, 3, 4];
  return (
    <div className="flex h-[640px] gap-6">
      <GlassPanel className="hidden w-80 gap-4 p-4 md:flex">
        <ShimmerBox className="h-10 w-full rounded-xl" />
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          {contactIndices.map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2">
              <ShimmerBox className="h-11 w-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <ShimmerBox className="h-4 w-28" />
                <ShimmerBox className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
      <GlassPanel className="flex-1 gap-4 p-4">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <ShimmerBox className="h-4 w-32" />
              <ShimmerBox className="h-3 w-16" />
            </div>
          </div>
          <ShimmerBox className="h-8 w-20 rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden py-2">
          {messageIndices.map((i) => (
            <div
              key={i}
              className={cx(
                'flex max-w-sm flex-col gap-1',
                i % 2 === 0 ? 'self-start' : 'self-end',
              )}
            >
              <ShimmerBox
                className={cx(
                  'h-12 w-64 rounded-2xl',
                  i % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm',
                )}
              />
              <ShimmerBox className="h-2 w-12 self-end" />
            </div>
          ))}
        </div>
        <ShimmerBox className="h-12 w-full rounded-xl" />
      </GlassPanel>
    </div>
  );
}

function ProfileLayout(): ReactElement {
  const statIndices = [0, 1, 2];
  const historyIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-8">
      <GlassPanel className="gap-6 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ShimmerBox className="h-24 w-24 rounded-full" />
          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-3">
              <ShimmerBox className="h-8 w-44" />
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
            <ShimmerBox className="h-4 w-64" />
            <ShimmerBox className="h-3 w-full max-w-md rounded-full" />
          </div>
          <ShimmerBox className="h-10 w-32 rounded-xl" />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {statIndices.map((i) => (
          <GlassPanel key={i} className="gap-2">
            <ShimmerBox className="h-4 w-24" />
            <ShimmerBox className="h-8 w-20" />
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="gap-4">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <ShimmerBox className="h-6 w-36" />
          <ShimmerBox className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex flex-col gap-3">
          {historyIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-[var(--borderColor)]/10 p-3"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-10 w-10 rounded-xl" />
                <div className="flex flex-col gap-1">
                  <ShimmerBox className="h-4 w-28" />
                  <ShimmerBox className="h-3 w-16" />
                </div>
              </div>
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}

const layoutRenderers: Record<PageLoadingLayout, () => ReactElement> = {
  home: HomeLayout,
  grid: GridLayout,
  standard: StandardLayout,
  stats: StatsLayout,
  room: RoomLayout,
  auth: AuthLayout,
  cards: CardsLayout,
  table: TableLayout,
  chat: ChatLayout,
  profile: ProfileLayout,
};

export const PageLoading = memo(function PageLoading({
  layout = 'standard',
  className,
  'data-testid': dataTestId = 'page-loading',
}: PageLoadingProps) {
  const Renderer = layoutRenderers[layout] ?? layoutRenderers.standard;
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
        <Renderer />
      </div>
    </div>
  );
});
