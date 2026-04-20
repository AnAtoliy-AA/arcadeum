'use client';

import { useState } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { PageTitle } from '@arcadeum/ui/components/PageTitle/PageTitle';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Card } from '@arcadeum/ui/components/Card/Card';
import { Input } from '@arcadeum/ui/components/Input/Input';
import { TextArea } from '@arcadeum/ui/components/TextArea/TextArea';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { FormGroup } from '@arcadeum/ui/components/FormGroup/FormGroup';
import { XStack, YStack } from 'tamagui';
import { formatMessage } from '@/shared/i18n';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

export interface ContactViewProps {
  t?: ContactMessages;
  SUPPORT_EMAIL: string;
  WORKING_HOURS: string;
}

export default function ContactView({
  t: initialT,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: ContactViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const { messages } = useLanguage();
  const t = (messages.legal?.contact as unknown as ContactMessages) || initialT;
  const s = t?.sections;
  const getInTouch = s?.getInTouch as Record<string, string> | undefined;
  const form = s?.form as Record<string, string> | undefined;
  const faq = s?.faq as Record<string, Record<string, string>> | undefined;

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

        <Section variant="legal" title={getInTouch?.title}>
          <XStack flexWrap="wrap" gap="$4">
            <Card flex={1} minWidth={200} p="$4" variant="glass">
              <Typography uiSize="2xl">📧</Typography>
              <Typography variant="label" uiSize="xs" marginTop="$2">
                {getInTouch?.email}
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
                {getInTouch?.workingHours}
              </Typography>
              <Typography fontWeight="700">{WORKING_HOURS}</Typography>
            </Card>

            <Card flex={1} minWidth={200} p="$4" variant="glass">
              <Typography uiSize="2xl">⏱️</Typography>
              <Typography variant="label" uiSize="xs" marginTop="$2">
                {getInTouch?.responseTime}
              </Typography>
              <Typography fontWeight="700">
                {getInTouch?.responseValue}
              </Typography>
            </Card>
          </XStack>
        </Section>

        <Section variant="legal" title={form?.title}>
          {submitted ? (
            <Card
              variant="glass"
              p="$6"
              alignItems="center"
              data-testid="contact-success-message"
            >
              <Typography fontWeight="500" textAlign="center">
                {form?.success}
              </Typography>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <YStack gap="$5">
                <FormGroup label={form?.nameLabel} htmlFor="name" required>
                  <Input
                    id="name"
                    name="name"
                    placeholder={form?.namePlaceholder}
                    required
                    data-testid="contact-name-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup label={form?.emailLabel} htmlFor="email" required>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={form?.emailPlaceholder}
                    required
                    data-testid="contact-email-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup
                  label={form?.subjectLabel}
                  htmlFor="subject"
                  required
                >
                  <Input
                    id="subject"
                    name="subject"
                    placeholder={form?.subjectPlaceholder}
                    required
                    data-testid="contact-subject-input"
                    fullWidth
                  />
                </FormGroup>

                <FormGroup
                  label={form?.messageLabel}
                  htmlFor="message"
                  required
                >
                  <TextArea
                    id="message"
                    name="message"
                    placeholder={form?.messagePlaceholder}
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
                    {form?.submit}
                  </Button>
                </YStack>
              </YStack>
            </form>
          )}
        </Section>

        <Section variant="legal" title={faq?.title as string | undefined}>
          <YStack gap="$4">
            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {faq?.refund?.question}
              </Typography>
              <Typography marginTop="$1">
                {formatMessage(faq?.refund?.answer, {
                  email: SUPPORT_EMAIL,
                })}
              </Typography>
            </Card>

            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {faq?.password?.question}
              </Typography>
              <Typography marginTop="$1">{faq?.password?.answer}</Typography>
            </Card>

            <Card variant="glass" p="$4">
              <Typography variant="label" uiSize="xs">
                {faq?.deleteAccount?.question}
              </Typography>
              <Typography marginTop="$1">
                {formatMessage(faq?.deleteAccount?.answer, {
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
