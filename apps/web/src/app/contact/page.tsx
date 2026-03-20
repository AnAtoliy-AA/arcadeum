'use client';

import { useState } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  Card,
  Input,
  TextArea,
  Button,
  XStack,
  YStack,
} from '@/shared/ui';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'arcadeum.care@gmail.com';
const WORKING_HOURS =
  process.env.NEXT_PUBLIC_WORKING_HOURS ?? 'Mon – Fri, 10:00 – 18:00 (GMT+4)';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { messages } = useLanguage();
  const t = messages.legal?.contact;
  const s = t?.sections;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <Container size="md">
        <GlassCard>
          <PageTitle size="xl" gradient>
            {t?.title}
          </PageTitle>
          <Typography variant="body" uiSize="lg" alpha="medium">
            {t?.tagline}
          </Typography>
        </GlassCard>

        <Section variant="legal" title={s?.getInTouch?.title}>
          <XStack flexWrap="wrap" gap="$4">
            <Card flex={1} minWidth={200} p="$4" variant="glass">
              <Typography uiSize="2xl">📧</Typography>
              <Typography variant="label" uiSize="xs" marginTop="$2">
                {s?.getInTouch?.email}
              </Typography>
              <Typography fontWeight="700">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {SUPPORT_EMAIL}
                </a>
              </Typography>
            </Card>

            <Card flex={1} minWidth={200} p="$4" variant="glass">
              <Typography uiSize="2xl">🕐</Typography>
              <Typography variant="label" uiSize="xs" marginTop="$2">
                {s?.getInTouch?.workingHours}
              </Typography>
              <Typography fontWeight="700">{WORKING_HOURS}</Typography>
            </Card>

            <Card flex={1} minWidth={200} p="$4" variant="glass">
              <Typography uiSize="2xl">⏱️</Typography>
              <Typography variant="label" uiSize="xs" marginTop="$2">
                {s?.getInTouch?.responseTime}
              </Typography>
              <Typography fontWeight="700">
                {s?.getInTouch?.responseValue}
              </Typography>
            </Card>
          </XStack>
        </Section>

        <Section variant="legal" title={s?.form?.title}>
          {submitted ? (
            <Card
              variant="glass"
              p="$6"
              alignItems="center"
              data-testid="contact-success-message"
            >
              <Typography fontWeight="500" textAlign="center">
                {s?.form?.success}
              </Typography>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <YStack gap="$4">
                <YStack gap="$2">
                  <Typography variant="label" uiSize="xs">
                    <label htmlFor="name">{s?.form?.nameLabel}</label>
                  </Typography>
                  <Input
                    id="name"
                    name="name"
                    placeholder={s?.form?.namePlaceholder}
                    required
                    data-testid="contact-name-input"
                  />
                </YStack>

                <YStack gap="$2">
                  <Typography variant="label" uiSize="xs">
                    <label htmlFor="email">{s?.form?.emailLabel}</label>
                  </Typography>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={s?.form?.emailPlaceholder}
                    required
                    data-testid="contact-email-input"
                  />
                </YStack>

                <YStack gap="$2">
                  <Typography variant="label" uiSize="xs">
                    <label htmlFor="subject">{s?.form?.subjectLabel}</label>
                  </Typography>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder={s?.form?.subjectPlaceholder}
                    required
                    data-testid="contact-subject-input"
                  />
                </YStack>

                <YStack gap="$2">
                  <Typography variant="label" uiSize="xs">
                    <label htmlFor="message">{s?.form?.messageLabel}</label>
                  </Typography>
                  <TextArea
                    id="message"
                    name="message"
                    placeholder={s?.form?.messagePlaceholder}
                    required
                    data-testid="contact-message-textarea"
                  />
                </YStack>

                <YStack mt="$2">
                  <Button
                    type="submit"
                    variant="primary"
                    data-testid="contact-submit-button"
                  >
                    {s?.form?.submit}
                  </Button>
                </YStack>
              </YStack>
            </form>
          )}
        </Section>

        <Section variant="legal" title={s?.faq?.title}>
          <YStack gap="$4">
            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {s?.faq?.refund?.question}
              </Typography>
              <Typography marginTop="$1">
                {formatMessage(s?.faq?.refund?.answer, {
                  email: SUPPORT_EMAIL,
                })}
              </Typography>
            </Card>

            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {s?.faq?.password?.question}
              </Typography>
              <Typography marginTop="$1">{s?.faq?.password?.answer}</Typography>
            </Card>

            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {s?.faq?.deleteAccount?.question}
              </Typography>
              <Typography marginTop="$1">
                {formatMessage(s?.faq?.deleteAccount?.answer, {
                  email: SUPPORT_EMAIL,
                })}
              </Typography>
            </Card>
          </YStack>
        </Section>
      </Container>
    </PageLayout>
  );
}
