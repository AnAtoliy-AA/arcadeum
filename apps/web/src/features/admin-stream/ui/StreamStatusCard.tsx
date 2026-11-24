'use client';

import { Button, GlassCard, Notice, Typography } from '@arcadeum/ui';
import { gameMetadata } from '@/features/games/registry';
import type { StreamStatusView } from '../server/stream.types';
import { formatUptime } from '../lib/streamSettings';
import type { StreamT } from './useStreamT';

type Phase =
  'live' | 'stopping' | 'stopped' | 'killed' | 'offline' | 'starting';

export function statusPhase(s: StreamStatusView | null): Phase {
  if (!s || !s.online) return 'offline';
  switch (s.state) {
    case 'live':
    case 'idle':
      return 'live';
    case 'starting':
    case 'starting-game':
      return 'starting';
    case 'stopping':
      return 'stopping';
    case 'killed':
      return 'killed';
    default:
      return 'stopped';
  }
}

const PHASE_STYLE: Record<Phase, string> = {
  live: 'bg-[var(--danger)] text-white',
  starting: 'bg-[var(--warning)] text-black',
  stopping: 'bg-[var(--warning)] text-black',
  stopped: 'bg-[var(--neutral)] text-black',
  killed: 'bg-[var(--neutral)] text-black',
  offline: 'bg-[var(--neutral)] text-black',
};

function gameName(id: string): string {
  return (
    (gameMetadata as Record<string, { name: string } | undefined>)[id]?.name ??
    id
  );
}

function Stat({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-[var(--neutral)]">{label}</dt>
      <dd
        data-testid={testId}
        className="m-0 truncate text-base font-bold text-[var(--colorText)]"
      >
        {value}
      </dd>
    </div>
  );
}

interface Props {
  status: StreamStatusView | null;
  refreshing: boolean;
  onRefresh: () => void;
  t: StreamT;
}

/** Live/stopped badge, current game, uptime, fps, last error and the version handshake. */
export function StreamStatusCard({ status, refreshing, onRefresh, t }: Props) {
  const phase = statusPhase(status);
  const applied = status?.appliedConfigVersion ?? null;
  const current = status?.currentConfigVersion ?? 0;
  const inSync = applied !== null && applied >= current;
  const lastError = status?.recentErrors.at(-1) ?? null;
  const reportTime = status?.lastReportAt
    ? new Date(status.lastReportAt).toLocaleTimeString()
    : null;

  return (
    <GlassCard
      className="flex flex-col gap-4 p-4"
      data-testid="stream-status-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Typography variant="heading" level={2} uiSize="lg">
            {t('status.title')}
          </Typography>
          <span
            role="status"
            data-testid="stream-phase"
            data-phase={phase}
            className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${PHASE_STYLE[phase]}`}
          >
            {t(`status.${phase}`)}
          </span>
          {status?.dryRun ? (
            <span className="text-xs font-semibold text-[var(--warning)]">
              {t('status.dryRun')}
            </span>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={refreshing}
          onClick={onRefresh}
          data-testid="stream-refresh"
        >
          {t('status.refresh')}
        </Button>
      </div>

      {!status?.lastReportAt ? (
        <Notice
          tone="warning"
          role="status"
          data-testid="stream-never-reported"
        >
          {t('status.neverReported')}
        </Notice>
      ) : null}

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat
          label={t('status.currentGame')}
          testId="stream-current-game"
          value={
            status?.currentGame
              ? `${gameName(status.currentGame.id)}${status.currentGame.theme ? ` (${status.currentGame.theme})` : ''}`
              : t('status.noGame')
          }
        />
        <Stat
          label={t('status.uptime')}
          testId="stream-uptime"
          value={formatUptime(status?.uptimeSec ?? null)}
        />
        <Stat
          label={t('status.fps')}
          testId="stream-fps"
          value={status?.ffmpegFps != null ? String(status.ffmpegFps) : '-'}
        />
        <Stat
          label={t('status.gamesPlayed')}
          testId="stream-games-played"
          value={status?.gamesPlayed != null ? String(status.gamesPlayed) : '-'}
        />
        <Stat
          label={t('status.restarts')}
          testId="stream-restarts"
          value={
            status?.ffmpegRestarts != null ? String(status.ffmpegRestarts) : '-'
          }
        />
      </dl>

      <div
        className="flex flex-col gap-2 text-sm"
        data-testid="stream-version-sync"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <span className="text-[var(--neutral)]">
              {t('status.appliedVersion')}:{' '}
            </span>
            <strong data-testid="stream-applied-version">
              {applied ?? '-'}
            </strong>
          </span>
          <span>
            <span className="text-[var(--neutral)]">
              {t('status.savedVersion')}:{' '}
            </span>
            <strong data-testid="stream-saved-version">{current}</strong>
          </span>
          <span
            data-testid="stream-sync-state"
            data-synced={inSync}
            className={
              inSync
                ? 'font-semibold text-[var(--success)]'
                : 'font-semibold text-[var(--warning)]'
            }
          >
            {inSync
              ? t('status.upToDate')
              : t('status.pending', { version: current })}
          </span>
        </div>
        {status && status.pendingCommands > 0 ? (
          <span className="text-[var(--neutral)]">
            {t('status.pendingCommands', { count: status.pendingCommands })}
          </span>
        ) : null}
        {reportTime ? (
          <span className="text-xs text-[var(--neutral)]">
            {t('status.lastReport', { time: reportTime })}
          </span>
        ) : null}
      </div>

      <div
        className="flex flex-col gap-1 text-sm"
        data-testid="stream-last-error"
      >
        <span className="font-semibold text-[var(--colorText)]">
          {t('status.lastError')}
        </span>
        {lastError ? (
          <code className="block overflow-x-auto rounded-lg border border-[var(--borderColor)] bg-[rgba(0,0,0,0.2)] p-2 text-xs">
            {lastError}
          </code>
        ) : (
          <span className="text-[var(--neutral)]">{t('status.noError')}</span>
        )}
        {status?.lastRestartReason ? (
          <span className="text-xs text-[var(--neutral)]">
            {t('status.lastRestart')}: {status.lastRestartReason}
          </span>
        ) : null}
      </div>
    </GlassCard>
  );
}
