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

interface HelpPageContentProps {
  t?: PageTranslations;
}

export default function HelpPageContent({ t: initialT }: HelpPageContentProps) {
  const { messages } = useLanguage();
  const t = (messages.pages?.help as unknown as PageTranslations) || initialT;

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
                    <div className="box-border flex flex-col items-stretch gap-2">
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

        {(() => {
          const faq = t?.faq as
            | {
                heading?: string;
                items?: ({ question: string; answer: string } | null)[];
              }
            | undefined;
          const items =
            faq?.items?.filter(
              (i): i is { question: string; answer: string } =>
                !!i && !!i.question && !!i.answer,
            ) ?? [];
          if (!items.length) return null;
          return (
            <Section variant="legal">
              {/*
               * `id="faq"` is the anchor the FAQPage JSON-LD's
               * SpeakableSpecification points at. Stable across builds
               * (hashed class names) so Google Assistant
               * can locate the block reliably.
               */}
              <div
                className="box-border flex flex-col items-stretch gap-3"
                id="faq"
              >
                <Typography className={'font-bold'} variant="label" uiSize="lg">
                  {faq?.heading}
                </Typography>
                <div className="box-border flex flex-col items-stretch gap-2">
                  {items.map((item, index) => (
                    <GlassCard
                      className={'p-4 border border-[var(--borderColor)]'}
                      key={index}
                    >
                      <div className="box-border flex flex-col items-stretch gap-1">
                        <Typography
                          className={'font-bold'}
                          variant="label"
                          uiSize="md"
                        >
                          {item.question}
                        </Typography>
                        <Typography variant="body" uiSize="sm" alpha="medium">
                          {item.answer}
                        </Typography>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </Section>
          );
        })()}

        <Section variant="legal">
          <Typography variant="body" uiSize="md" alpha="medium">
            {t?.comingSoon}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
