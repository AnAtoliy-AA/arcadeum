import { getTranslations } from '@/shared/i18n/server';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
} from '@arcadeum/ui';

export default async function CommunityPage() {
  const messages = await getTranslations();
  const t = messages.pages?.community;

  return (
    <PageLayout>
      <Container size="md">
        <GlassCard>
          <PageTitle size="xl" gradient>
            {t?.title}
          </PageTitle>
          <Typography variant="caption" alpha="medium">
            {t?.subtitle}
          </Typography>
        </GlassCard>

        <Section variant="legal">
          <Typography variant="body" uiSize="md" alpha="high">
            {t?.description}
          </Typography>
        </Section>

        <Section variant="legal">
          <Typography variant="body" uiSize="md" alpha="medium">
            {t?.comingSoon}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
