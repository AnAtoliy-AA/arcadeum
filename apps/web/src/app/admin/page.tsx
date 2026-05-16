import { GlassCard, PageTitle, Typography } from '@arcadeum/ui';
import { getTranslations } from '@/shared/i18n/server';

interface AdminTranslations {
  welcome?: string;
  welcomeBody?: string;
}

export default async function AdminPage() {
  const messages = await getTranslations();
  const t = messages.pages?.admin as AdminTranslations | undefined;

  return (
    <GlassCard p="$4" data-testid="admin-dashboard">
      <PageTitle size="lg" gradient>
        {t?.welcome ?? 'Welcome to the admin area'}
      </PageTitle>
      <Typography variant="body" uiSize="md" alpha="medium">
        {t?.welcomeBody ??
          'Feature panels will appear here as they ship. Use the sidebar to navigate.'}
      </Typography>
    </GlassCard>
  );
}
