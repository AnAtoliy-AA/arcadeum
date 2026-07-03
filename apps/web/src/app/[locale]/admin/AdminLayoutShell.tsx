import { PageLayout } from '@arcadeum/ui';
import type { ReactNode } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { AdminSidebar } from './_components/AdminSidebar';
import styles from './AdminLayoutShell.module.scss';

interface AdminLayoutShellProps {
  username: string;
  children: ReactNode;
}

interface AdminNavTranslations {
  dashboard?: string;
  users?: string;
  payments?: string;
  announcements?: string;
  tournaments?: string;
  economy?: string;
  shop?: string;
  games?: string;
  gameRules?: string;
  blockedIps?: string;
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
      users: navT?.users,
      payments: navT?.payments,
      announcements: navT?.announcements,
      tournaments: navT?.tournaments,
      economy: navT?.economy,
      shop: navT?.shop,
      games: navT?.games,
      gameRules: navT?.gameRules,
      blockedIps: navT?.blockedIps,
    },
    comingSoon: navT?.comingSoon ?? 'Coming soon',
  };

  return (
    <PageLayout>
      <div className={styles.shell}>
        <div className={styles.caption}>
          <span className={styles.captionText}>{signedInAs}</span>
        </div>

        <div className={styles.row}>
          <div className={styles.sidebar}>
            <AdminSidebar labels={sidebarLabels} />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </PageLayout>
  );
}
