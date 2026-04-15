import { getTranslations } from '@/shared/i18n/server';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  YStack,
} from '@arcadeum/ui';

export default async function CookiePolicyPage() {
  const messages = await getTranslations();
  const t = messages.pages?.cookies;
  const sections = t?.sections;

  return (
    <PageLayout>
      <Container size="md">
        <GlassCard>
          <PageTitle size="xl" gradient>
            {t?.title}
          </PageTitle>
          <Typography variant="caption" alpha="medium">
            {t?.lastUpdated}
          </Typography>
        </GlassCard>

        {sections &&
          Object.entries(sections).map(([key, sectionValue]) => {
            if (!sectionValue) return null;
            const section = sectionValue as {
              title?: string;
              content?: string;
              intro?: string;
              items?: string[];
            };
            return (
              <Section key={key} variant="legal" title={section.title ?? ''}>
                <YStack gap="$4">
                  <Typography variant="body" uiSize="md" alpha="high">
                    {section.content || section.intro}
                  </Typography>
                  {section.items && Array.isArray(section.items) && (
                    <YStack gap="$2" paddingLeft="$4">
                      {section.items.map((item, index: number) => {
                        if (!item) return null;
                        return (
                          <Typography
                            key={index}
                            variant="body"
                            uiSize="sm"
                            alpha="medium"
                          >
                            • {item}
                          </Typography>
                        );
                      })}
                    </YStack>
                  )}
                </YStack>
              </Section>
            );
          })}
      </Container>
    </PageLayout>
  );
}
