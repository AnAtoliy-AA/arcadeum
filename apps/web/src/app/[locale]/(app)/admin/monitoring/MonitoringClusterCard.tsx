'use client';

import { useState } from 'react';
import { GlassCard, Button } from '@arcadeum/ui';
import { StatusDot } from './MonitoringCharts';

export interface ClusterWorker {
  pmId: number;
  name: string;
  pid: number;
  status: string;
  cpu: number;
  memoryMB: number;
  uptimeSeconds: number;
  restarts: number;
}

export interface ClusterStatus {
  isPm2: boolean;
  targetApp: string;
  instances: ClusterWorker[];
  timestamp: number;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export function MonitoringClusterCard({
  cluster,
  onReloadSuccess,
}: {
  cluster: ClusterStatus | null;
  onReloadSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReload = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/monitoring/cluster-reload', {
        method: 'POST',
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        setMessage('Cluster reload successful');
        setConfirmOpen(false);
        onReloadSuccess();
      } else {
        setMessage(data.message || 'Reload failed');
      }
    } catch {
      setMessage('Failed to trigger reload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Backend Cluster Workers ({cluster?.targetApp ?? 'arcadeum-be'})
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {cluster?.isPm2
              ? `Managed by PM2: ${cluster.instances.length} active worker(s)`
              : 'Standalone Node.js worker'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!confirmOpen ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              Reload Cluster
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300">Graceful reload?</span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReload}
                disabled={loading}
                className="bg-amber-500 text-black hover:bg-amber-400"
              >
                {loading ? 'Reloading...' : 'Confirm'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-3 rounded-lg bg-[var(--surface)] p-2 text-xs text-[var(--text-secondary)]">
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <th className="pb-2 font-medium">Worker ID</th>
              <th className="pb-2 font-medium">PID</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">CPU</th>
              <th className="pb-2 font-medium">RAM</th>
              <th className="pb-2 font-medium">Uptime</th>
              <th className="pb-2 font-medium">Restarts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {cluster?.instances.map((worker) => {
              const isHealthy = worker.status === 'online';
              const highCpu = worker.cpu > 70;
              return (
                <tr key={`${worker.pmId}-${worker.pid}`}>
                  <td className="py-2.5 font-mono font-medium text-[var(--text)]">
                    #{worker.pmId}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-secondary)]">
                    {worker.pid}
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusDot ok={isHealthy} />
                      <span
                        className={
                          isHealthy
                            ? 'text-[var(--success)]'
                            : 'text-[var(--error)]'
                        }
                      >
                        {worker.status}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`py-2.5 font-mono ${highCpu ? 'font-bold text-amber-400' : 'text-[var(--text)]'}`}
                  >
                    {worker.cpu.toFixed(1)}%
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text)]">
                    {worker.memoryMB} MB
                  </td>
                  <td className="py-2.5 text-[var(--text-secondary)]">
                    {formatUptime(worker.uptimeSeconds)}
                  </td>
                  <td className="py-2.5 font-mono text-[var(--text-secondary)]">
                    {worker.restarts}
                  </td>
                </tr>
              );
            })}
            {!cluster && (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-[var(--text-secondary)]"
                >
                  Loading cluster info...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
