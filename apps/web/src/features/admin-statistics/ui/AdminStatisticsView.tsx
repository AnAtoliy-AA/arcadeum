import type { ReactElement } from 'react';
import {
  GlassCard,
  PageTitle,
  Typography,
  Badge,
  BarChartIcon,
} from '@arcadeum/ui';
import type { AdminStatisticsData } from '../types';
import { StatsKpiGrid, type StatsKpiTranslations } from './StatsKpiGrid';
import {
  StatsEngagementRetention,
  type StatsEngagementTranslations,
} from './StatsEngagementRetention';
import {
  StatsActivityCharts,
  type StatsActivityChartsTranslations,
} from './StatsActivityCharts';
import {
  StatsGamesBreakdown,
  type StatsGamesBreakdownTranslations,
} from './StatsGamesBreakdown';
import {
  StatsEconomyOverview,
  type StatsEconomyOverviewTranslations,
} from './StatsEconomyOverview';
import {
  StatsDemographicsOverview,
  type StatsDemographicsOverviewTranslations,
} from './StatsDemographicsOverview';
import { ExportPdfButton } from './ExportPdfButton';

export interface AdminStatisticsTranslations {
  title?: string;
  subtitle?: string;
  liveStatus?: string;
  lastUpdated?: string;
  exportPdf?: string;
  kpi?: StatsKpiTranslations;
  engagement?: StatsEngagementTranslations;
  charts?: StatsActivityChartsTranslations;
  games?: StatsGamesBreakdownTranslations;
  economy?: StatsEconomyOverviewTranslations;
  demographics?: StatsDemographicsOverviewTranslations;
}

interface AdminStatisticsViewProps {
  data: AdminStatisticsData;
  t?: AdminStatisticsTranslations;
}

export function AdminStatisticsView({
  data,
  t,
}: AdminStatisticsViewProps): ReactElement {
  const formattedTime = new Date(data.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="flex flex-col gap-6 w-full print:p-0 print:gap-4"
      data-testid="admin-statistics-page"
    >
      <GlassCard className="p-6 border border-[var(--borderColor)] print:bg-transparent print:border-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-row items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(87,195,255,0.15)] text-[var(--primary)] print:hidden">
                <BarChartIcon size={20} />
              </div>
              <PageTitle size="lg" gradient>
                {t?.title ?? 'Platform Analytics & Statistics'}
              </PageTitle>
            </div>
            <Typography variant="body" uiSize="md" alpha="medium">
              {t?.subtitle ??
                'Real-time intelligence on MAU, DAU, engagement retention, playtime, and treasury flow'}
            </Typography>
          </div>

          <div className="flex flex-row items-center flex-wrap gap-3">
            <ExportPdfButton label={t?.exportPdf} />
            <Badge
              variant="success"
              size="md"
              dot
              className="px-3.5 py-1.5 print:hidden"
            >
              {t?.liveStatus ?? 'Live Telemetry'}
            </Badge>
            <Badge variant="neutral" size="md">
              {t?.lastUpdated ?? 'Updated'}: {formattedTime}
            </Badge>
          </div>
        </div>
      </GlassCard>

      <StatsKpiGrid data={data} t={t?.kpi} />

      <StatsEngagementRetention
        users={data.users}
        games={data.games}
        t={t?.engagement}
      />

      <StatsActivityCharts
        daily={data.trends.daily}
        hourlyActivity={data.trends.hourlyActivity}
        t={t?.charts}
      />

      <StatsGamesBreakdown games={data.games} t={t?.games} />

      <StatsEconomyOverview economy={data.economy} t={t?.economy} />

      <StatsDemographicsOverview
        users={data.users}
        tournaments={data.tournaments}
        t={t?.demographics}
      />
    </div>
  );
}
