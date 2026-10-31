import type { ReactElement } from 'react';
import type { PachisiClientState } from '../types';

interface PachisiCenterHomeProps {
  snapshot: PachisiClientState;
  finishedCounts: Map<string, number>;
  seatOf: (playerId: string) => number;
}

export function PachisiCenterHome({
  snapshot,
  finishedCounts,
  seatOf,
}: PachisiCenterHomeProps): ReactElement {
  return (
    <div className="pachisi-center-home pachisi-center-home-area relative z-10 m-[6%] flex items-center justify-center rounded-lg border shadow-inner">
      <div className="pachisi-center-home-content relative h-full w-full">
        {snapshot.playerOrder.map((pid) => {
          const seat = seatOf(pid);
          const finished = finishedCounts.get(pid) ?? 0;
          const posClass =
            seat === 0
              ? 'left-1 top-1/2 -translate-y-1/2'
              : seat === 1
                ? 'top-1 left-1/2 -translate-x-1/2'
                : seat === 2
                  ? 'right-1 top-1/2 -translate-y-1/2'
                  : 'bottom-1 left-1/2 -translate-x-1/2';
          return (
            <span
              key={`home-count-${pid}`}
              className={`pachisi-score-pill-seat-${seat} absolute ${posClass} flex items-center gap-0.5 rounded-full px-1 text-[9px] font-black text-white shadow-sm`}
            >
              ● {finished}
            </span>
          );
        })}
      </div>
    </div>
  );
}
