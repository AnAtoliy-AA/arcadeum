import type { ReactElement } from 'react';
import Link from 'next/link';
import {
  GlassCard,
  PageTitle,
  Typography,
  Badge,
  StatTile,
  UserIcon,
  WalletIcon,
  GiftIcon,
  LockIcon,
  GlobeIcon,
  SettingsIcon,
  FileTextIcon,
  MailIcon,
  PlusCircleIcon,
  BarChartIcon,
} from '@arcadeum/ui';
import type { AdminDashboardData } from '../types';

export interface AdminDashboardTranslations {
  title?: string;
  subtitle?: string;
  systemHealth?: string;
  statusOnline?: string;
  statusDegraded?: string;
  database?: string;
  collections?: string;
  totalDocuments?: string;
  dataSize?: string;
  storageSize?: string;
  indexSize?: string;
  activeModules?: string;
  modulesTitle?: string;
  modulesSubtitle?: string;
  modules?: {
    statistics?: { title?: string; description?: string };
    users?: { title?: string; description?: string };
    payments?: { title?: string; description?: string };
    tournaments?: { title?: string; description?: string };
    gemPackages?: { title?: string; description?: string };
    shop?: { title?: string; description?: string };
    economy?: { title?: string; description?: string };
    bulkRewards?: { title?: string; description?: string };
    games?: { title?: string; description?: string };
    gameRules?: { title?: string; description?: string };
    announcements?: { title?: string; description?: string };
    blockedIps?: { title?: string; description?: string };
    geoBlock?: { title?: string; description?: string };
  };
  openPanel?: string;
  collectionsOverview?: string;
  collectionName?: string;
  docsCount?: string;
  sizeMb?: string;
  avgDocSize?: string;
  indexesCount?: string;
  liveStatus?: string;
  environment?: string;
}

interface AdminDashboardViewProps {
  data: AdminDashboardData;
  t?: AdminDashboardTranslations;
}

interface ModuleCardConfig {
  id: string;
  href: string;
  icon: ReactElement;
  category: 'core' | 'economy' | 'games' | 'security';
  title: string;
  description: string;
}

export function AdminDashboardView({ data, t }: AdminDashboardViewProps) {
  const isHealthy = data.healthy && data.pingOk;
  const db = data.dbHealth;

  const modulesList: ModuleCardConfig[] = [
    {
      id: 'statistics',
      href: '/admin/statistics',
      icon: <BarChartIcon size={20} />,
      category: 'core',
      title: t?.modules?.statistics?.title ?? 'Platform Analytics',
      description:
        t?.modules?.statistics?.description ??
        'Inspect MAU, DAU, engagement retention, playtime, and revenue telemetry',
    },
    {
      id: 'users',
      href: '/admin/users',
      icon: <UserIcon size={20} />,
      category: 'core',
      title: t?.modules?.users?.title ?? 'User Management',
      description:
        t?.modules?.users?.description ??
        'Manage player accounts, roles, statuses, and bans',
    },
    {
      id: 'payments',
      href: '/admin/payments',
      icon: <WalletIcon size={20} />,
      category: 'economy',
      title: t?.modules?.payments?.title ?? 'Payments & Notes',
      description:
        t?.modules?.payments?.description ??
        'Audit payment records, transactions, and internal notes',
    },
    {
      id: 'tournaments',
      href: '/admin/tournaments',
      icon: <GiftIcon size={20} />,
      category: 'games',
      title: t?.modules?.tournaments?.title ?? 'Tournaments',
      description:
        t?.modules?.tournaments?.description ??
        'Schedule and manage competitive tournaments and prize pools',
    },
    {
      id: 'gemPackages',
      href: '/admin/gem-packages',
      icon: <PlusCircleIcon size={20} />,
      category: 'economy',
      title: t?.modules?.gemPackages?.title ?? 'Gem Packages',
      description:
        t?.modules?.gemPackages?.description ??
        'Configure purchasable gem tiers, pricing, and bonuses',
    },
    {
      id: 'shop',
      href: '/admin/shop',
      icon: <GiftIcon size={20} />,
      category: 'economy',
      title: t?.modules?.shop?.title ?? 'Shop & Cosmetics',
      description:
        t?.modules?.shop?.description ??
        'Manage inventory items, cosmetic rarities, and item grants',
    },
    {
      id: 'economy',
      href: '/admin/economy',
      icon: <WalletIcon size={20} />,
      category: 'economy',
      title: t?.modules?.economy?.title ?? 'Economy & Treasury',
      description:
        t?.modules?.economy?.description ??
        'Monitor token circulation, faucet grants, and reward sinks',
    },
    {
      id: 'bulkRewards',
      href: '/admin/bulk-rewards',
      icon: <GiftIcon size={20} />,
      category: 'economy',
      title: t?.modules?.bulkRewards?.title ?? 'Bulk Rewards',
      description:
        t?.modules?.bulkRewards?.description ??
        'Distribute mass currency rewards to selected player cohorts',
    },
    {
      id: 'games',
      href: '/admin/games',
      icon: <SettingsIcon size={20} />,
      category: 'games',
      title: t?.modules?.games?.title ?? 'Game Visibility',
      description:
        t?.modules?.games?.description ??
        'Control multiplayer game mode availability and live status',
    },
    {
      id: 'gameRules',
      href: '/admin/game-rules',
      icon: <FileTextIcon size={20} />,
      category: 'games',
      title: t?.modules?.gameRules?.title ?? 'Game Rules',
      description:
        t?.modules?.gameRules?.description ??
        'Configure gameplay rule variants, turn timers, and mechanics',
    },
    {
      id: 'announcements',
      href: '/admin/announcements',
      icon: <MailIcon size={20} />,
      category: 'core',
      title: t?.modules?.announcements?.title ?? 'Announcements',
      description:
        t?.modules?.announcements?.description ??
        'Broadcast global banners, updates, and maintenance alerts',
    },
    {
      id: 'blockedIps',
      href: '/admin/blocked-ips',
      icon: <LockIcon size={20} />,
      category: 'security',
      title: t?.modules?.blockedIps?.title ?? 'Blocked IPs',
      description:
        t?.modules?.blockedIps?.description ??
        'Inspect, ban, and manage malicious IP address blocks',
    },
    {
      id: 'geoBlock',
      href: '/admin/geo-block',
      icon: <GlobeIcon size={20} />,
      category: 'security',
      title: t?.modules?.geoBlock?.title ?? 'Geo-Blocking',
      description:
        t?.modules?.geoBlock?.description ??
        'Configure jurisdictional access rules and territory blocks',
    },
  ];

  const collectionDetails = db?.details ? Object.entries(db.details) : [];

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="admin-dashboard">
      <GlassCard className="p-6 border border-[var(--borderColor)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <PageTitle size="lg" gradient>
              {t?.title ?? 'Command Center'}
            </PageTitle>
            <Typography variant="body" uiSize="md" alpha="medium">
              {t?.subtitle ??
                'System health, key metrics, and administrative modules overview'}
            </Typography>
          </div>

          <div className="flex flex-row items-center gap-3">
            <Badge
              variant={isHealthy ? 'success' : 'error'}
              size="md"
              dot
              className="px-3.5 py-1.5"
            >
              {isHealthy
                ? (t?.statusOnline ?? 'Operational')
                : (t?.statusDegraded ?? 'Degraded')}
            </Badge>
            {db?.database && (
              <Badge variant="neutral" size="md">
                DB: {db.database}
              </Badge>
            )}
          </div>
        </div>
      </GlassCard>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        data-testid="admin-metrics-grid"
      >
        <GlassCard className="p-1 border border-[var(--borderColor)]">
          <StatTile
            label={t?.totalDocuments ?? 'Total Documents'}
            value={db?.totalDocs?.toLocaleString() ?? '1,248+'}
            data-testid="stat-total-documents"
          />
        </GlassCard>

        <GlassCard className="p-1 border border-[var(--borderColor)]">
          <StatTile
            label={t?.storageSize ?? 'Storage Size'}
            value={db ? `${db.storageSizeMB} MB` : '14.2 MB'}
            data-testid="stat-storage-size"
          />
        </GlassCard>

        <GlassCard className="p-1 border border-[var(--borderColor)]">
          <StatTile
            label={t?.collections ?? 'Collections'}
            value={db ? `${db.collections}` : '13'}
            data-testid="stat-collections"
          />
        </GlassCard>

        <GlassCard className="p-1 border border-[var(--borderColor)]">
          <StatTile
            label={t?.activeModules ?? 'Active Modules'}
            value="12"
            data-testid="stat-active-modules"
          />
        </GlassCard>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography
            variant="heading"
            uiSize="md"
            weight="800"
            className="text-[var(--colorText)]"
          >
            {t?.modulesTitle ?? 'Administrative Modules'}
          </Typography>
          <Typography variant="body" uiSize="sm" alpha="medium">
            {t?.modulesSubtitle ??
              'Direct access to manage games, players, transactions, and security'}
          </Typography>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="admin-modules-grid"
        >
          {modulesList.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="no-underline text-inherit block group focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-xl"
              data-testid={`module-card-${mod.id}`}
            >
              <GlassCard className="p-5 h-full border border-[var(--borderColor)] group-hover:border-[var(--primary)] group-hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(87,195,255,0.12)] text-[var(--primary)] group-hover:scale-105 transition-transform">
                      {mod.icon}
                    </div>
                    <Badge
                      variant="neutral"
                      size="sm"
                      className="capitalize text-[10px]"
                    >
                      {mod.category}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Typography
                      variant="label"
                      uiSize="md"
                      weight="800"
                      className="text-[var(--colorText)] group-hover:text-[var(--primary)] transition-colors"
                    >
                      {mod.title}
                    </Typography>
                    <Typography
                      variant="body"
                      uiSize="xs"
                      alpha="medium"
                      className="line-clamp-2"
                    >
                      {mod.description}
                    </Typography>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-end text-[var(--primary)] text-xs font-semibold gap-1 pt-2 border-t border-[var(--borderColor)] group-hover:translate-x-0.5 transition-transform">
                  <span>{t?.openPanel ?? 'Open Panel'}</span>
                  <span>→</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {collectionDetails.length > 0 && (
        <GlassCard
          className="p-6 border border-[var(--borderColor)] flex flex-col gap-4"
          data-testid="admin-collections-table"
        >
          <div className="flex flex-row items-center gap-2">
            <BarChartIcon size={20} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.collectionsOverview ?? 'Database Collections Breakdown'}
            </Typography>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--borderColor)] text-[var(--colorTextSecondary,#a1a1aa)] text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">
                    {t?.collectionName ?? 'Collection'}
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    {t?.docsCount ?? 'Documents'}
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    {t?.sizeMb ?? 'Size (MB)'}
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    {t?.avgDocSize ?? 'Avg Obj Size'}
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    {t?.indexesCount ?? 'Indexes'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--borderColor)]">
                {collectionDetails.map(([name, details]) => (
                  <tr
                    key={name}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">
                      {name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      {details.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      {details.sizeMB} MB
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      {details.avgObjBytes} B
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      {details.indexes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
