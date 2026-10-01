'use client';

import { GlassCard } from '@arcadeum/ui';
import { StatusDot } from './MonitoringCharts';

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

export function ReadinessCard({ ready }: { ready: ReadyData | null }) {
  return (
    <GlassCard className="p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Readiness
      </h2>
      <div className="space-y-2">
        <Row label="Overall" ok={ready?.ready ?? false}>
          {ready?.ready ? 'Ready' : 'Not Ready'}
        </Row>
        <Row label="MongoDB" ok={ready?.mongo ?? false}>
          {ready?.mongo ? 'Connected' : 'Disconnected'}
        </Row>
        <Row label="Redis" ok={ready?.redis ?? false}>
          {ready?.redis ? 'Connected' : 'Disconnected'}
        </Row>
      </div>
    </GlassCard>
  );
}

export function DbHealthCard({ db }: { db: DbHealthData | null }) {
  return (
    <GlassCard className="p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Database
      </h2>
      <div className="space-y-2">
        <Row label="OCI MongoDB" ok={db?.mongo.oci === 'connected'}>
          {db?.mongo.oci ?? 'unknown'}
        </Row>
        <Row label="Atlas MongoDB" ok={db?.mongo.atlas === 'connected'}>
          {db?.mongo.atlas ?? 'unknown'}
        </Row>
        <Row label="DB Health" ok={db?.ok ?? false}>
          {db?.ok ? 'Healthy' : 'Degraded'}
        </Row>
      </div>
    </GlassCard>
  );
}

function Row({
  label,
  ok,
  children,
}: {
  label: string;
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-2">
        <StatusDot ok={ok} />
        <span className="text-sm text-[var(--text)]">{children}</span>
      </div>
    </div>
  );
}

export function StatCard({
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

export function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[var(--text-secondary)]">{label}</span>
      <p className="font-medium text-[var(--text)]">{value}</p>
    </div>
  );
}

export interface PrometheusMetrics {
  activeConnections: number;
  memoryRSS: number;
  memoryHeap: number;
  memoryHeapUsed: number;
  httpRequestsTotal: number;
  httpRequestDuration: number;
  mongodbOperations: number;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function parsePrometheusMetrics(text: string): PrometheusMetrics {
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
