import { GlassCard, Typography } from '@arcadeum/ui';
import type { AdminServerMetrics } from '../types';
import type { AdminDashboardTranslations } from './AdminDashboardView';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function usageColor(percent: number): string {
  if (percent >= 85) return 'bg-red-500';
  if (percent >= 60) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function UsageBar({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--colorTextSecondary)]">{label}</span>
        <span className="font-semibold text-[var(--colorText)]">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${usageColor(percent)}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

interface ServerResourcesCardProps {
  metrics: AdminServerMetrics;
  t?: AdminDashboardTranslations;
}

export function ServerResourcesCard({ metrics, t }: ServerResourcesCardProps) {
  return (
    <GlassCard
      className="p-6 border border-[var(--borderColor)] flex flex-col gap-5"
      data-testid="admin-server-resources"
    >
      <div className="flex flex-col gap-1">
        <Typography
          variant="heading"
          uiSize="md"
          weight="800"
          className="text-[var(--colorText)]"
        >
          {t?.serverResources?.title ?? 'Server Resources'}
        </Typography>
        <Typography variant="body" uiSize="sm" alpha="medium">
          {t?.serverResources?.subtitle ??
            'Real-time CPU, memory, and system metrics'}
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <UsageBar
            percent={metrics.cpu.usagePercent}
            label={`${t?.serverResources?.cpu ?? 'CPU'} — ${metrics.cpu.model} (${metrics.cpu.cores} ${t?.serverResources?.cores ?? 'cores'})`}
          />
          {metrics.cpu.perCore.length > 1 && (
            <div className="flex flex-col gap-2 pl-3 border-l-2 border-[var(--borderColor)]">
              <Typography variant="body" uiSize="xs" alpha="medium">
                {t?.serverResources?.perCore ?? 'Per Core'}
              </Typography>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {metrics.cpu.perCore.map((usage, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--colorTextSecondary)]">
                      Core {i}
                    </span>
                    <span className="font-medium text-[var(--colorText)]">
                      {usage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <UsageBar
            percent={metrics.ram.usagePercent}
            label={`${t?.serverResources?.ram ?? 'RAM'} — ${metrics.ram.usedMB} / ${metrics.ram.totalMB} MB`}
          />
          <div className="flex flex-row gap-4 text-xs text-[var(--colorTextSecondary)]">
            <span>
              {t?.serverResources?.free ?? 'Free'}:{' '}
              <span className="text-[var(--colorText)]">
                {metrics.ram.freeMB} MB
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-[var(--borderColor)]">
        <div className="flex flex-col gap-0.5">
          <Typography variant="body" uiSize="xs" alpha="medium">
            {t?.serverResources?.processMemory ?? 'Process Memory'}
          </Typography>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.heapUsed ?? 'Heap Used'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.process.heapUsedMB} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.heapTotal ?? 'Heap Total'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.process.heapTotalMB} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.rss ?? 'RSS'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.process.rssMB} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.external ?? 'External'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.process.externalMB} MB
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <Typography variant="body" uiSize="xs" alpha="medium">
            {t?.serverResources?.systemInfo ?? 'System Info'}
          </Typography>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.uptime ?? 'Uptime'}
              </span>
              <span className="text-[var(--colorText)]">
                {formatUptime(metrics.system.uptimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.platform ?? 'Platform'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.system.platform}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--colorTextSecondary)]">
                {t?.serverResources?.nodeVersion ?? 'Node'}
              </span>
              <span className="text-[var(--colorText)]">
                {metrics.system.nodeVersion}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 md:col-span-2">
          <Typography variant="body" uiSize="xs" alpha="medium">
            {t?.serverResources?.loadAvg ?? 'Load Average (1m / 5m / 15m)'}
          </Typography>
          <div className="flex flex-row gap-4 text-xs">
            {(
              metrics.system.loadAvg as [number, number, number]
            ).map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-[var(--colorText)]">
                  {val.toFixed(2)}
                </span>
                <span className="text-[var(--colorTextSecondary)]">
                  {i === 0 ? '1m' : i === 1 ? '5m' : '15m'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
