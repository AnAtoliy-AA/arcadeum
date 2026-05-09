import {
  PageLayout,
  Container,
  GlassCard,
  Typography,
  XStack,
  YStack,
} from '@arcadeum/ui';
import type { ReactNode } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { AdminSidebar } from './_components/AdminSidebar';

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
    },
    comingSoon: navT?.comingSoon ?? 'Coming soon',
  };

  return (
    <PageLayout>
      <Container size="lg">
        <GlassCard p="$3" mb="$3">
          <Typography variant="caption" alpha="medium">
            {signedInAs}
          </Typography>
        </GlassCard>

        <XStack gap="$4" flexWrap="wrap">
          <AdminSidebar labels={sidebarLabels} />
          <YStack flex={1} minWidth={280}>
            {children}
          </YStack>
        </XStack>
      </Container>
    </PageLayout>
  );
}
