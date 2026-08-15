'use client';

import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
} from '@arcadeum/ui';

interface RewardsTranslation {
  title?: string;
  subtitle?: string;
  description?: string;
  comingSoon?: string;
  features?: { title?: string; description?: string }[];
}

export interface RewardsPageContentProps {
  t?: RewardsTranslation; // Initial translations from server
}

export default function RewardsPageContent({
  t: initialT,
}: RewardsPageContentProps) {
  const { messages } = useLanguage();
  const t = (messages.pages?.rewards as RewardsTranslation) || initialT;

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
            <div className="box-border flex flex-row items-stretch flex-wrap gap-4">
              {(
                t.features as ({
                  title?: string;
                  description?: string;
                } | null)[]
              ).map((feature, index: number) => {
                if (!feature) return null;
                return (
                  <GlassCard
                    className="flex-1 min-w-[280px] p-4 border border-[var(--borderColor)]"
                    key={index}
                  >
                    <div className="box-border flex flex-col items-stretch gap-2">
                      <Typography
                        className="font-bold"
                        variant="label"
                        uiSize="md"
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body" uiSize="sm" alpha="medium">
                        {feature.description}
                      </Typography>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
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
