'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
} from '@arcadeum/ui';

interface DevelopersPageContentProps {
  t?: PageTranslations;
}

export default function DevelopersPageContent({
  t: initialT,
}: DevelopersPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.developers as unknown as PageTranslations) || initialT;

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
            <div className="flex flex-row items-stretch flex-wrap gap-4">
              {(
                t.features as ({ title: string; description: string } | null)[]
              ).map((feature, index: number) => {
                if (!feature) return null;
                return (
                  <GlassCard
                    className={
                      'flex-1 min-w-[280px] p-4 border border-[var(--borderColor)]'
                    }
                    key={index}
                  >
                    <div className="flex flex-col items-stretch gap-2">
                      <Typography
                        className={'font-bold'}
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
