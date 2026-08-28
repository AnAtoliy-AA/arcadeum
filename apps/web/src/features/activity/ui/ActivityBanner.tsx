'use client';

import { useEffect, useState, useCallback } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { track } from '@/shared/lib/analytics';

interface ActivityStats {
  activeGames: number;
  onlinePlayers: number;
}

interface ActivityBannerProps {
  className?: string;
}

const REFRESH_INTERVAL_MS = 30_000;
const API_PATH = '/api/activity';

export function ActivityBanner({ className }: ActivityBannerProps) {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(API_PATH, { next: { revalidate: 30 } });
      if (!res.ok) return;
      const data: ActivityStats = await res.json();
      setStats(data);
      track('activity.viewed', {
        activeGames: data.activeGames,
        onlinePlayers: data.onlinePlayers,
      });
    } catch {
      // Network error — banner silently hides.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching in effect
    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading || !stats) return null;

  const items: Array<{ icon: string; label: string; value: number }> = [];

  if (stats.activeGames > 0) {
    items.push({
      icon: '🔴',
      label: 'games happening now',
      value: stats.activeGames,
    });
  }
  if (stats.onlinePlayers > 0) {
    items.push({
      icon: '🟢',
      label: 'players online',
      value: stats.onlinePlayers,
    });
  }

  if (items.length === 0) return null;

  return (
    <div
      className={cx(
        'flex items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-sm',
        className,
      )}
      data-testid="activity-banner"
      role="status"
      aria-live="polite"
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden>{item.icon}</span>
          <span className="tabular-nums">{item.value}</span>
          <span className="text-slate-400">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
