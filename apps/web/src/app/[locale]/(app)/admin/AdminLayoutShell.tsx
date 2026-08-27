import { PageLayout, Badge, Typography, GlassCard } from '@arcadeum/ui';
import type { ReactNode } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { AdminSidebar } from './_components/AdminSidebar';

interface AdminLayoutShellProps {
  username: string;
  children: ReactNode;
}

interface AdminNavTranslations {
  dashboard?: string;
  statistics?: string;
  users?: string;
  payments?: string;
  announcements?: string;
  tournaments?: string;
  economy?: string;
  shop?: string;
  gemPackages?: string;
  games?: string;
  gameRules?: string;
  bulkRewards?: string;
  blockedIps?: string;
  geoBlock?: string;
  comingSoon?: string;
}

interface AdminTranslations {
  signedInAs?: string;
  nav?: AdminNavTranslations;
}

export default async function AdminLayoutShell({
  username,
  children,
}: AdminLayoutShellProps) {
  const messages = await getTranslations();
  const t = messages.pages?.admin as AdminTranslations | undefined;
  const navT = t?.nav;

  const signedInAs = (t?.signedInAs ?? 'Signed in as {username}').replace(
    '{username}',
    username,
  );

  const sidebarLabels = {
    items: {
      dashboard: navT?.dashboard,
      statistics: navT?.statistics,
      users: navT?.users,
      payments: navT?.payments,
      announcements: navT?.announcements,
      tournaments: navT?.tournaments,
      economy: navT?.economy,
      shop: navT?.shop,
      gemPackages: navT?.gemPackages,
      games: navT?.games,
      gameRules: navT?.gameRules,
      bulkRewards: navT?.bulkRewards,
      blockedIps: navT?.blockedIps,
      geoBlock: navT?.geoBlock,
    },
    comingSoon: navT?.comingSoon ?? 'Coming soon',
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1440px] mx-auto px-4 py-6 box-border flex flex-col gap-6 print:p-0 print:gap-4">
        <GlassCard className="p-4 flex flex-row items-center justify-between flex-wrap gap-4 border border-[var(--borderColor)] print:hidden">
          <div className="flex flex-row items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
            <Typography
              variant="body"
              uiSize="md"
              weight="700"
              className="text-[var(--colorText)]"
            >
              {signedInAs}
            </Typography>
            <Badge variant="info" size="sm">
              Admin
            </Badge>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Badge variant="neutral" size="sm">
              Console v2
            </Badge>
          </div>
        </GlassCard>

        <div className="flex flex-col md:flex-row items-stretch gap-6 w-full print:block">
          <aside className="w-full md:w-[240px] md:min-w-[220px] shrink-0 print:hidden">
            <AdminSidebar labels={sidebarLabels} />
          </aside>
          <main
            className="flex-1 min-w-0 w-full print:w-full print:p-0"
            id="admin-main-content"
          >
            {children}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
