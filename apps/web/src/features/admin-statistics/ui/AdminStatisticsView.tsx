'use client';

import { useState, type ReactElement } from 'react';
import {
  GlassCard,
  PageTitle,
  Typography,
  Badge,
  BarChartIcon,
  Button,
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
import {
  StatsAnonymousOverview,
  type StatsAnonymousTranslations,
} from './StatsAnonymousOverview';
import { ExportPdfButton } from './ExportPdfButton';

export interface AdminStatisticsTranslations {
  title?: string;
  subtitle?: string;
  liveStatus?: string;
  lastUpdated?: string;
  exportPdf?: string;
  audienceAll?: string;
  audienceRegistered?: string;
  audienceAnonymous?: string;
  kpi?: StatsKpiTranslations;
  engagement?: StatsEngagementTranslations;
  charts?: StatsActivityChartsTranslations;
  games?: StatsGamesBreakdownTranslations;
  economy?: StatsEconomyOverviewTranslations;
  demographics?: StatsDemographicsOverviewTranslations;
  anonymous?: StatsAnonymousTranslations;
}

interface AdminStatisticsViewProps {
  data: AdminStatisticsData;
  t?: AdminStatisticsTranslations;
}

export function AdminStatisticsView({
  data,
  t,
}: AdminStatisticsViewProps): ReactElement {
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'registered' | 'anonymous'>('all');

  const formattedTime = new Date(data.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const activeUsers = {
    ...data.users,
    dau:
      audienceFilter === 'registered'
        ? data.users.registeredDau
        : audienceFilter === 'anonymous'
        ? data.users.anonymousDau
        : data.users.dau,
    wau:
      audienceFilter === 'registered'
        ? data.users.registeredWau
        : audienceFilter === 'anonymous'
        ? data.users.anonymousWau
        : data.users.wau,
    mau:
      audienceFilter === 'registered'
        ? data.users.registeredMau
        : audienceFilter === 'anonymous'
        ? data.users.anonymousMau
        : data.users.mau,
  };

  const filteredData: AdminStatisticsData = {
    ...data,
    users: activeUsers,
  };

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

        <div className="mt-4 pt-4 border-t border-[var(--borderColor)] flex flex-row items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)] font-semibold uppercase tracking-wider">
              Audience Filter:
            </span>
            <div className="flex flex-row items-center gap-1 bg-white/5 p-1 rounded-lg border border-[var(--borderColor)]">
              <Button
                variant={audienceFilter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAudienceFilter('all')}
                className="text-xs px-3 py-1"
                data-testid="filter-all-players"
              >
                {t?.audienceAll ?? 'All Players'}
              </Button>
              <Button
                variant={audienceFilter === 'registered' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAudienceFilter('registered')}
                className="text-xs px-3 py-1"
                data-testid="filter-registered-only"
              >
                {t?.audienceRegistered ?? 'Registered Only'}
              </Button>
              <Button
                variant={audienceFilter === 'anonymous' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAudienceFilter('anonymous')}
                className="text-xs px-3 py-1"
                data-testid="filter-anonymous-only"
              >
                {t?.audienceAnonymous ?? 'Anonymous & Guests'}
              </Button>
            </div>
          </div>

          <Badge variant="info" size="sm">
            {data.users.anonymous.guestTrafficSharePercentage}% Guest Traffic
          </Badge>
        </div>
      </GlassCard>

      <StatsKpiGrid data={filteredData} mode={audienceFilter} t={t?.kpi} />

      <StatsAnonymousOverview
        anonymous={data.users.anonymous}
        users={data.users}
        registered={data.registered}
        anonymousAudience={data.anonymous}
        t={t?.anonymous}
      />

      <StatsEngagementRetention
        users={filteredData.users}
        games={data.games}
        registered={data.registered}
        anonymous={data.anonymous}
        mode={audienceFilter}
        t={t?.engagement}
      />

      <StatsActivityCharts
        daily={data.trends.daily}
        hourlyActivity={data.trends.hourlyActivity}
        t={t?.charts}
      />

      <StatsGamesBreakdown games={data.games} mode={audienceFilter} t={t?.games} />

      <StatsEconomyOverview economy={data.economy} t={t?.economy} />

      <StatsDemographicsOverview
        users={data.users}
        tournaments={data.tournaments}
        t={t?.demographics}
      />
    </div>
  );
}
