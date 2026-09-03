'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@arcadeum/ui';

interface HealthData {
  status: string;
  timestamp: string;
  pid: number;
  uptime: number;
}

interface MetricsData {
  activeConnections: number;
  requestRate: number;
  memoryRSS: number;
  memoryHeap: number;
}

interface MonitoringClientProps {
  t?: Record<string, string>;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function parsePrometheusMetrics(text: string): MetricsData {
  const lines = text.split('\n');
  const metrics: MetricsData = {
    activeConnections: 0,
    requestRate: 0,
    memoryRSS: 0,
    memoryHeap: 0,
  };

  for (const line of lines) {
    if (line.startsWith('http_server_active_connections')) {
      const match = line.match(/(\d+)$/);
      if (match) metrics.activeConnections = parseInt(match[1]);
    }
    if (line.startsWith('process_resident_memory_bytes')) {
      const match = line.match(/(\d+)$/);
      if (match) metrics.memoryRSS = parseInt(match[1]);
    }
    if (line.startsWith('nodejs_heap_size_total_bytes')) {
      const match = line.match(/(\d+)$/);
      if (match) metrics.memoryHeap = parseInt(match[1]);
    }
  }

  return metrics;
}

export function MonitoringView({ t }: MonitoringClientProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthRes = await fetch('/api/admin/monitoring/health');
        if (healthRes.ok) {
          setHealth(await healthRes.json());
        }

        const metricsRes = await fetch('/api/admin/monitoring/metrics');
        if (metricsRes.ok) {
          const text = await metricsRes.text();
          setMetrics(parsePrometheusMetrics(text));
        }
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
  }, []);

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

  if (error) {
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

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t?.title ?? 'Monitoring'}
        </h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t?.status ?? 'Status'}
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--success)]">
              {health?.status ?? 'unknown'}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t?.uptime ?? 'Uptime'}
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">
              {health ? formatUptime(health.uptime) : '-'}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t?.connections ?? 'Connections'}
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">
              {metrics?.activeConnections ?? 0}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t?.memory ?? 'Memory (RSS)'}
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]">
              {metrics ? formatBytes(metrics.memoryRSS) : '-'}
            </p>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">
            {t?.details ?? 'Server Details'}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">PID</span>
              <span className="text-[var(--text)]">{health?.pid ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                {t?.heap ?? 'Heap Total'}
              </span>
              <span className="text-[var(--text)]">
                {metrics ? formatBytes(metrics.memoryHeap) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                {t?.lastCheck ?? 'Last Check'}
              </span>
              <span className="text-[var(--text)]">
                {health?.timestamp
                  ? new Date(health.timestamp).toLocaleTimeString()
                  : '-'}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
