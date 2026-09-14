'use client';

import { GlassCard } from '@arcadeum/ui';

export interface CapacityData {
  currentOnlineUsers: number;
  currentActiveRooms: number;
  peaks: {
    peakOnlineUsers: number;
    peakOnlineUsersAt: number;
    peakActiveRooms: number;
    peakActiveRoomsAt: number;
  };
}

export function CapacityCard({ capacity }: { capacity: CapacityData | null }) {
  return (
    <GlassCard className="p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Capacity
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <span className="text-xs text-[var(--text-secondary)]">
            Online Now
          </span>
          <p className="text-2xl font-bold text-[var(--text)]">
            {capacity?.currentOnlineUsers.toLocaleString() ?? '0'}
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--text-secondary)]">
            Peak Online
          </span>
          <p className="text-2xl font-bold text-[var(--success)]">
            {capacity?.peaks.peakOnlineUsers.toLocaleString() ?? '0'}
          </p>
          <span className="text-xs text-[var(--text-secondary)]">
            {capacity?.peaks.peakOnlineUsersAt
              ? new Date(capacity.peaks.peakOnlineUsersAt).toLocaleString()
              : '-'}
          </span>
        </div>
        <div>
          <span className="text-xs text-[var(--text-secondary)]">
            Active Rooms Now
          </span>
          <p className="text-2xl font-bold text-[var(--text)]">
            {capacity?.currentActiveRooms.toLocaleString() ?? '0'}
          </p>
        </div>
        <div>
          <span className="text-xs text-[var(--text-secondary)]">
            Peak Rooms
          </span>
          <p className="text-2xl font-bold text-[var(--success)]">
            {capacity?.peaks.peakActiveRooms.toLocaleString() ?? '0'}
          </p>
          <span className="text-xs text-[var(--text-secondary)]">
            {capacity?.peaks.peakActiveRoomsAt
              ? new Date(capacity.peaks.peakActiveRoomsAt).toLocaleString()
              : '-'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
