import { getTranslations } from '@/shared/i18n/server';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  XStack,
  YStack,
} from '@arcadeum/ui';

export default async function TournamentsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.tournaments;

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

        {t?.features && (
          <Section variant="legal">
            <XStack flexWrap="wrap" gap="$4" marginHorizontal="$-2">
              {t.features.map((feature, index: number) => {
                if (!feature) return null;
                return (
                  <GlassCard
                    key={index}
                    flex={1}
                    minWidth={280}
                    p="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <YStack gap="$2">
                      <Typography variant="label" uiSize="md" fontWeight="700">
                        {feature.title}
                      </Typography>
                      <Typography variant="body" uiSize="sm" alpha="medium">
                        {feature.description}
                      </Typography>
                    </YStack>
                  </GlassCard>
                );
              })}
            </XStack>
          </Section>
        )}

        <Section variant="legal">
          <Typography variant="body" uiSize="md" alpha="medium">
            {t?.comingSoon}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
