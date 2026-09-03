'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { GlassCard } from '@arcadeum/ui';
import { Sparkline } from './MonitoringCharts';
import { ReadinessCard, DbHealthCard } from './MonitoringCards';

interface HealthData {
  status: string;
  timestamp: string;
  pid: number;
  uptime: number;
}

interface ReadyData {
  ready: boolean;
  mongo: boolean;
  redis: boolean;
}

interface DbHealthData {
  ok: boolean;
  mongo: {
    oci: 'connected' | 'disconnected';
    atlas: 'connected' | 'disconnected' | 'not_configured';
  };
}

interface ServerMetricsData {
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    perCore: number[];
  };
  ram: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    usagePercent: number;
  };
  process: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
  };
  system: {
    uptimeSeconds: number;
    platform: string;
    nodeVersion: string;
    loadAvg: [number, number, number];
  };
}

interface PrometheusMetrics {
  activeConnections: number;
  memoryRSS: number;
  memoryHeap: number;
  memoryHeapUsed: number;
  httpRequestsTotal: number;
  httpRequestDuration: number;
  mongodbOperations: number;
}

interface MetricsHistory {
  timestamp: number;
  cpu: number;
  memory: number;
  connections: number;
}

interface MonitoringClientProps {
  t?: Record<string, string>;
}

const MAX_HISTORY = 60;

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function parsePrometheusMetrics(text: string): PrometheusMetrics {
  const m: PrometheusMetrics = {
    activeConnections: 0,
    memoryRSS: 0,
    memoryHeap: 0,
    memoryHeapUsed: 0,
    httpRequestsTotal: 0,
    httpRequestDuration: 0,
    mongodbOperations: 0,
  };

  for (const line of text.split('\n')) {
    const val = line.match(/(\d+)$/)?.[1];
    if (!val) continue;
    if (line.startsWith('http_server_active_connections'))
      m.activeConnections = parseInt(val);
    if (line.startsWith('process_resident_memory_bytes'))
      m.memoryRSS = parseInt(val);
    if (line.startsWith('nodejs_heap_size_total_bytes'))
      m.memoryHeap = parseInt(val);
    if (line.startsWith('nodejs_heap_size_used_bytes'))
      m.memoryHeapUsed = parseInt(val);
    if (line.startsWith('http_server_request_duration_seconds_count'))
      m.httpRequestsTotal += parseInt(val);
    if (line.startsWith('mongodb_operation_duration_seconds_count'))
      m.mongodbOperations += parseInt(val);
  }
  return m;
}

export function MonitoringView({ t }: MonitoringClientProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [ready, setReady] = useState<ReadyData | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealthData | null>(null);
  const [server, setServer] = useState<ServerMetricsData | null>(null);
  const [prom, setProm] = useState<PrometheusMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MetricsHistory[]>([]);
  const historyRef = useRef<MetricsHistory[]>([]);
  const serverRef = useRef<ServerMetricsData | null>(null);
  const promRef = useRef<PrometheusMetrics | null>(null);

  const pushHistory = useCallback(
    (srv: ServerMetricsData, p: PrometheusMetrics) => {
      const next = [
        ...historyRef.current,
        {
          timestamp: Date.now(),
          cpu: srv.cpu.usagePercent,
          memory: srv.process.heapUsedMB,
          connections: p.activeConnections,
        },
      ];
      const trimmed =
        next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      historyRef.current = trimmed;
      setHistory(trimmed);
    },
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, r, d, s, m] = await Promise.allSettled([
          fetch('/api/admin/monitoring/health'),
          fetch('/api/admin/monitoring/ready'),
          fetch('/api/admin/monitoring/db-health'),
          fetch('/api/admin/monitoring/server-metrics'),
          fetch('/api/admin/monitoring/metrics'),
        ]);

        if (h.status === 'fulfilled' && h.value.ok)
          setHealth(await h.value.json());
        if (r.status === 'fulfilled' && r.value.ok)
          setReady(await r.value.json());
        if (d.status === 'fulfilled' && d.value.ok)
          setDbHealth(await d.value.json());
        if (s.status === 'fulfilled' && s.value.ok) {
          const srv = await s.value.json();
          serverRef.current = srv;
          setServer(srv);
          if (promRef.current) pushHistory(srv, promRef.current);
        }
        if (m.status === 'fulfilled' && m.value.ok) {
          const p = parsePrometheusMetrics(await m.value.text());
          promRef.current = p;
          setProm(p);
          if (serverRef.current) pushHistory(serverRef.current, p);
        }
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch metrics',
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [pushHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t?.title ?? 'Monitoring'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {t?.loading ?? 'Loading metrics...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t?.title ?? 'Monitoring'}
          </h1>
          <GlassCard className="p-6">
            <p className="text-red-400">{error}</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {t?.enableHint ??
                'Enable METRICS_ENABLED=true in .env to see metrics'}
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  const memPercent = server
    ? ((server.process.heapUsedMB / (server.ram.totalMB || 1)) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t?.title ?? 'Monitoring'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
            Live — 10s refresh
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <StatCard
            label="Status"
            value={health?.status ?? 'unknown'}
            color="text-[var(--success)]"
          />
          <StatCard
            label="Uptime"
            value={health ? formatUptime(health.uptime) : '-'}
          />
          <StatCard
            label="Connections"
            value={String(prom?.activeConnections ?? 0)}
          />
          <StatCard
            label="CPU"
            value={server ? `${server.cpu.usagePercent.toFixed(1)}%` : '-'}
          />
          <StatCard
            label="Heap Used"
            value={server ? `${server.process.heapUsedMB.toFixed(1)} MB` : '-'}
          />
          <StatCard label="Memory" value={`${memPercent}%`} />
        </div>

        {/* Readiness & DB */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReadinessCard ready={ready} />
          <DbHealthCard db={dbHealth} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GlassCard className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              CPU Usage
            </h2>
            <p className="mb-3 text-2xl font-bold text-[var(--text)]">
              {server ? `${server.cpu.usagePercent.toFixed(1)}%` : '-'}
            </p>
            <Sparkline
              data={history.map((h) => h.cpu)}
              color="#22c55e"
              max={100}
            />
            <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
              <span>{server?.cpu.cores ?? 0} cores</span>
              <span>Load {server?.system.loadAvg[0].toFixed(2) ?? '-'}</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Heap Memory
            </h2>
            <p className="mb-3 text-2xl font-bold text-[var(--text)]">
              {server ? `${server.process.heapUsedMB.toFixed(1)} MB` : '-'}
              <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">
                / {server ? `${server.process.heapTotalMB.toFixed(1)} MB` : '-'}
              </span>
            </p>
            <Sparkline data={history.map((h) => h.memory)} color="#3b82f6" />
            <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
              <span>
                RSS {server ? `${server.process.rssMB.toFixed(1)} MB` : '-'}
              </span>
              <span>
                External{' '}
                {server ? `${server.process.externalMB.toFixed(1)} MB` : '-'}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Connections
            </h2>
            <p className="mb-3 text-2xl font-bold text-[var(--text)]">
              {prom?.activeConnections ?? 0}
            </p>
            <Sparkline
              data={history.map((h) => h.connections)}
              color="#f59e0b"
            />
            <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
              <span>
                Requests {prom?.httpRequestsTotal.toLocaleString() ?? '0'}
              </span>
              <span>
                MongoDB ops {prom?.mongodbOperations.toLocaleString() ?? '0'}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* CPU Per Core */}
        {server && server.cpu.perCore.length > 0 && (
          <GlassCard className="p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              CPU Per Core
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {server.cpu.perCore.map((usage, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">
                      Core {i}
                    </span>
                    <span className="text-[var(--text)]">
                      {usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(usage, 100)}%`,
                        backgroundColor:
                          usage > 80
                            ? '#ef4444'
                            : usage > 50
                              ? '#f59e0b'
                              : '#22c55e',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* System Info */}
        <GlassCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            System Info
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-6">
            <InfoItem label="PID" value={String(health?.pid ?? '-')} />
            <InfoItem label="Platform" value={server?.system.platform ?? '-'} />
            <InfoItem label="Node" value={server?.system.nodeVersion ?? '-'} />
            <InfoItem
              label="RAM Total"
              value={server ? `${server.ram.totalMB} MB` : '-'}
            />
            <InfoItem
              label="RAM Free"
              value={server ? `${server.ram.freeMB} MB` : '-'}
            />
            <InfoItem
              label="Load Avg"
              value={
                server?.system.loadAvg.map((l) => l.toFixed(2)).join(' / ') ??
                '-'
              }
            />
          </div>
        </GlassCard>

        {/* Memory Breakdown */}
        <GlassCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Memory Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <InfoItem
              label="RSS"
              value={
                prom
                  ? formatBytes(prom.memoryRSS)
                  : server
                    ? `${server.process.rssMB.toFixed(1)} MB`
                    : '-'
              }
            />
            <InfoItem
              label="Heap Total"
              value={
                prom
                  ? formatBytes(prom.memoryHeap)
                  : server
                    ? `${server.process.heapTotalMB.toFixed(1)} MB`
                    : '-'
              }
            />
            <InfoItem
              label="Heap Used"
              value={
                server ? `${server.process.heapUsedMB.toFixed(1)} MB` : '-'
              }
            />
            <InfoItem
              label="External"
              value={
                server ? `${server.process.externalMB.toFixed(1)} MB` : '-'
              }
            />
          </div>
        </GlassCard>

        <div className="text-right text-xs text-[var(--text-secondary)]">
          Last check:{' '}
          {health?.timestamp
            ? new Date(health.timestamp).toLocaleString()
            : '-'}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color ?? 'text-[var(--text)]'}`}>
        {value}
      </p>
    </GlassCard>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[var(--text-secondary)]">{label}</span>
      <p className="font-medium text-[var(--text)]">{value}</p>
    </div>
  );
}
