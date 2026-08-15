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

export interface BlogFeature {
  title?: string;
  description?: string;
}

export interface BlogTranslations {
  title?: string;
  subtitle?: string;
  description?: string;
  comingSoon?: string;
  features?: (BlogFeature | null)[];
}

export interface BlogPageContentProps {
  t?: BlogTranslations;
}

export default function BlogPageContent({ t: initialT }: BlogPageContentProps) {
  const { messages } = useLanguage();
  const t = (messages.pages?.blog as BlogTranslations) || initialT;

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
              {t.features.map((feature: BlogFeature | null, index: number) => {
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
