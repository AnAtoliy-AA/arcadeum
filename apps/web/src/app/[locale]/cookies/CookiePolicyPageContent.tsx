'use client';
import type { PageTranslations } from '@/shared/i18n/page-translations';

import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
} from '@arcadeum/ui';

interface CookiePolicyPageContentProps {
  t?: PageTranslations;
}

export default function CookiePolicyPageContent({
  t: initialT,
}: CookiePolicyPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.cookies as unknown as PageTranslations) || initialT;

  return (
    <PageLayout>
      <Container size="md">
        <GlassCard>
          <PageTitle size="xl" gradient>
            {t?.title}
          </PageTitle>
          <Typography variant="body" uiSize="md" alpha="high">
            {t?.description}
          </Typography>
        </GlassCard>

        {t?.sections &&
          (
            Object.values(t.sections) as { title: string; content?: string }[]
          ).map((section, index: number) => (
            <div
              key={index}
              style={{
                marginTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Typography variant="label" uiSize="lg" fontWeight="700">
                {section.title}
              </Typography>
              {section.content && (
                <Typography variant="body" uiSize="md" alpha="medium">
                  {section.content}
                </Typography>
              )}
            </div>
          ))}
      </Container>
    </PageLayout>
  );
}
