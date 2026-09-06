'use client';
import { useState, useEffect } from 'react';
import { GlassCard, Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';

interface TournamentTimerProps {
  tournamentId: string;
  status: 'scheduled' | 'registration_open' | 'live' | 'completed';
  scheduledAt: string;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function TournamentTimer({
  tournamentId,
  status,
  scheduledAt,
}: TournamentTimerProps) {
  const { messages } = useLanguage();
  const t = messages.games?.chess_v1?.tournament as
    | {
        timer?: {
          startsIn?: string;
          timeRemaining?: string;
          ended?: string;
        };
      }
    | undefined;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const targetTime = new Date(scheduledAt).getTime();
  const diff = targetTime - now;

  if (status === 'completed') {
    return (
      <GlassCard className="p-3 text-center">
        <Typography variant="body" alpha="medium">
          {t?.timer?.ended ?? 'Tournament ended'}
        </Typography>
      </GlassCard>
    );
  }

  if (status === 'live' && diff > 0) {
    return (
      <GlassCard className="p-3 text-center border border-emerald-500/30">
        <Typography variant="caption" alpha="medium" className="text-[11px]">
          {t?.timer?.timeRemaining ?? 'Time remaining'}
        </Typography>
        <div className="text-2xl font-mono font-bold text-emerald-400">
          {formatTimeRemaining(diff)}
        </div>
      </GlassCard>
    );
  }

  if (diff > 0) {
    return (
      <GlassCard className="p-3 text-center">
        <Typography variant="caption" alpha="medium" className="text-[11px]">
          {t?.timer?.startsIn ?? 'Starts in'}
        </Typography>
        <div className="text-2xl font-mono font-bold text-[var(--primary)]">
          {formatTimeRemaining(diff)}
        </div>
      </GlassCard>
    );
  }

  return null;
}
