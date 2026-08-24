import type { ReactElement } from 'react';
import { GlassCard, Typography, Badge, BarChartIcon } from '@arcadeum/ui';
import type { AdminStatsDailyTrend, AdminStatsHourlyBucket } from '../types';

export interface StatsActivityChartsTranslations {
  dailyTrendTitle?: string;
  dailyTrendSubtitle?: string;
  hourlyTitle?: string;
  hourlySubtitle?: string;
  dauLabel?: string;
  gamesLabel?: string;
  peakHourLabel?: string;
  noData?: string;
}

interface StatsActivityChartsProps {
  daily: AdminStatsDailyTrend[];
  hourlyActivity: AdminStatsHourlyBucket[];
  t?: StatsActivityChartsTranslations;
}

export function StatsActivityCharts({
  daily,
  hourlyActivity,
  t,
}: StatsActivityChartsProps): ReactElement {
  const maxDau = Math.max(...daily.map((d) => d.dau), 1);
  const maxGames = Math.max(...daily.map((d) => d.games), 1);
  const maxCombined = Math.max(maxDau, maxGames, 1);
  const maxHourly = Math.max(...hourlyActivity.map((h) => h.count), 1);

  const chartHeight = 120;
  const dailyChartWidth = 400;
  const hourlyChartWidth = 480;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
      data-testid="stats-activity-charts"
    >
      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-5">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2">
              <BarChartIcon size={18} />
              <Typography variant="subheading" uiSize="sm" weight="700">
                {t?.dailyTrendTitle ?? 'Daily Active Users & Games (14 Days)'}
              </Typography>
            </div>
            <Typography variant="body" uiSize="xs" alpha="medium">
              {t?.dailyTrendSubtitle ??
                'Recent daily player logins and completed matches'}
            </Typography>
          </div>

          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-row items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[var(--primary)]" />
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {t?.dauLabel ?? 'DAU'}
              </Typography>
            </div>
            <div className="flex flex-row items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {t?.gamesLabel ?? 'Games'}
              </Typography>
            </div>
          </div>
        </div>

        {daily.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-[var(--colorTextSecondary,#a1a1aa)] text-sm">
            {t?.noData ?? 'No activity recorded'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="w-full h-44 flex items-center justify-center">
              <svg
                viewBox={`0 0 ${dailyChartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                aria-label="Daily trend chart"
              >
                {daily.map((day, idx) => {
                  const slotWidth = dailyChartWidth / daily.length;
                  const barWidth = Math.max((slotWidth - 8) / 2, 4);
                  const xBase = idx * slotWidth + 4;

                  const dauBarH = Math.max(
                    (day.dau / maxCombined) * (chartHeight - 10),
                    4,
                  );
                  const gamesBarH = Math.max(
                    (day.games / maxCombined) * (chartHeight - 10),
                    4,
                  );

                  return (
                    <g key={day.date} className="cursor-pointer">
                      <title>{`${day.date}: ${day.dau} DAU, ${day.games} games`}</title>
                      <rect
                        x={xBase}
                        y={chartHeight - dauBarH}
                        width={barWidth}
                        height={dauBarH}
                        rx={2}
                        className="fill-[var(--primary)] hover:brightness-125 transition-all"
                      />
                      <rect
                        x={xBase + barWidth + 2}
                        y={chartHeight - gamesBarH}
                        width={barWidth}
                        height={gamesBarH}
                        rx={2}
                        className="fill-emerald-400 hover:brightness-125 transition-all"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-row justify-between text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] px-1 border-t border-[var(--borderColor)] pt-2">
              <span>{daily[0]?.date}</span>
              <span>{daily[Math.floor(daily.length / 2)]?.date}</span>
              <span>{daily[daily.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-5">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.hourlyTitle ?? '24-Hour Peak Activity Distribution'}
            </Typography>
            <Typography variant="body" uiSize="xs" alpha="medium">
              {t?.hourlySubtitle ??
                'Match activity grouped by time of day (UTC)'}
            </Typography>
          </div>
          <Badge variant="neutral" size="sm">
            24h Clock
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-full h-44 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${hourlyChartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              aria-label="Hourly activity chart"
            >
              {hourlyActivity.map((slot, idx) => {
                const slotWidth = hourlyChartWidth / 24;
                const barWidth = Math.max(slotWidth - 4, 3);
                const xPos = idx * slotWidth + 2;
                const barH = Math.max(
                  (slot.count / maxHourly) * (chartHeight - 10),
                  4,
                );
                const isPeak = slot.count === maxHourly && slot.count > 0;

                return (
                  <g key={slot.hour} className="cursor-pointer">
                    <title>{`${slot.hour}:00 — ${slot.count} matches`}</title>
                    <rect
                      x={xPos}
                      y={chartHeight - barH}
                      width={barWidth}
                      height={barH}
                      rx={2}
                      className={
                        isPeak
                          ? 'fill-amber-400 hover:brightness-125 transition-all'
                          : 'fill-[var(--primary)] opacity-80 hover:opacity-100 hover:brightness-125 transition-all'
                      }
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-row justify-between text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] px-1 border-t border-[var(--borderColor)] pt-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
