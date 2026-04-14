'use client';

import { useState } from 'react';
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
  FormGroup,
} from '@/shared/ui';
import { formatMessage } from '@/shared/i18n';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

export interface ContactViewProps {
  t?: ContactMessages;
  SUPPORT_EMAIL: string;
  WORKING_HOURS: string;
}

export function ContactView({
  t,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: ContactViewProps) {
  const [submitted, setSubmitted] = useState(false);
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
              <YStack gap="$5">
                <FormGroup label={s?.form?.nameLabel} htmlFor="name" required>
                  <Input
                    id="name"
                    name="name"
                    placeholder={s?.form?.namePlaceholder}
                    required
                    data-testid="contact-name-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup label={s?.form?.emailLabel} htmlFor="email" required>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={s?.form?.emailPlaceholder}
                    required
                    data-testid="contact-email-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup
                  label={s?.form?.subjectLabel}
                  htmlFor="subject"
                  required
                >
                  <Input
                    id="subject"
                    name="subject"
                    placeholder={s?.form?.subjectPlaceholder}
                    required
                    data-testid="contact-subject-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup
                  label={s?.form?.messageLabel}
                  htmlFor="message"
                  required
                >
                  <TextArea
                    id="message"
                    name="message"
                    placeholder={s?.form?.messagePlaceholder}
                    required
                    data-testid="contact-message-textarea"
                    fullWidth
                  />
                </FormGroup>

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
