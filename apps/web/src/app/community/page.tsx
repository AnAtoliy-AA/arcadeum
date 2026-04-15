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
          {t?.subtitle && (
            <Typography variant="subheading" uiSize="md" alpha="medium">
              {t.subtitle}
            </Typography>
          )}
          <Typography variant="body" uiSize="lg" alpha="high">
            {t?.description}
          </Typography>
        </GlassCard>

        <Section title={t?.sections?.discord?.title ?? 'Discord'}>
          <Typography variant="body" uiSize="md">
            {t?.sections?.discord?.description}
          </Typography>
        </Section>

        <Section title={t?.sections?.twitter?.title ?? 'Twitter / X'}>
          <Typography variant="body" uiSize="md">
            {t?.sections?.twitter?.description}
          </Typography>
        </Section>

        <Section title={t?.sections?.github?.title ?? 'Github'}>
          <Typography variant="body" uiSize="md">
            {t?.sections?.github?.description}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
