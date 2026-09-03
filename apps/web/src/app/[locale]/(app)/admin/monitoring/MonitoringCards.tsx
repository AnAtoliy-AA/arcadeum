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
