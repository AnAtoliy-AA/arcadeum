'use client';

import { useState } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import {
  Page,
  Wrapper,
  Header,
  Title,
  Tagline,
  Section,
  SectionTitle,
  ContactGrid,
  ContactCard,
  ContactIcon,
  ContactLabel,
  ContactValue,
  ExternalLink,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  SubmitButton,
  SuccessMessage,
} from '@/shared/ui/legal-styles';

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
    <Page>
      <Wrapper $maxWidth="700px">
        <Header>
          <Title>{t?.title}</Title>
          <Tagline>{t?.tagline}</Tagline>
        </Header>

        <Section>
          <SectionTitle>{s?.getInTouch?.title}</SectionTitle>
          <ContactGrid>
            <ContactCard>
              <ContactIcon>📧</ContactIcon>
              <ContactLabel>{s?.getInTouch?.email}</ContactLabel>
              <ContactValue>
                <ExternalLink href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </ExternalLink>
              </ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>🕐</ContactIcon>
              <ContactLabel>{s?.getInTouch?.workingHours}</ContactLabel>
              <ContactValue>{WORKING_HOURS}</ContactValue>
            </ContactCard>

            <ContactCard>
              <ContactIcon>⏱️</ContactIcon>
              <ContactLabel>{s?.getInTouch?.responseTime}</ContactLabel>
              <ContactValue>{s?.getInTouch?.responseValue}</ContactValue>
            </ContactCard>
          </ContactGrid>
        </Section>

        <Section>
          <SectionTitle>{s?.form?.title}</SectionTitle>
          {submitted ? (
            <SuccessMessage>{s?.form?.success}</SuccessMessage>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">{s?.form?.nameLabel}</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={s?.form?.namePlaceholder}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">{s?.form?.emailLabel}</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={s?.form?.emailPlaceholder}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subject">{s?.form?.subjectLabel}</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder={s?.form?.subjectPlaceholder}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">{s?.form?.messageLabel}</Label>
                <TextArea
                  id="message"
                  name="message"
                  placeholder={s?.form?.messagePlaceholder}
                  required
                />
              </FormGroup>

              <SubmitButton type="submit">{s?.form?.submit}</SubmitButton>
            </Form>
          )}
        </Section>

        <Section>
          <SectionTitle>{s?.faq?.title}</SectionTitle>
          <ContactCard>
            <ContactLabel>{s?.faq?.refund?.question}</ContactLabel>
            <ContactValue>
              {formatMessage(s?.faq?.refund?.answer, { email: SUPPORT_EMAIL })}
            </ContactValue>
          </ContactCard>
          <ContactCard>
            <ContactLabel>{s?.faq?.password?.question}</ContactLabel>
            <ContactValue>{s?.faq?.password?.answer}</ContactValue>
          </ContactCard>
          <ContactCard>
            <ContactLabel>{s?.faq?.deleteAccount?.question}</ContactLabel>
            <ContactValue>
              {formatMessage(s?.faq?.deleteAccount?.answer, {
                email: SUPPORT_EMAIL,
              })}
            </ContactValue>
          </ContactCard>
        </Section>
      </Wrapper>
    </Page>
  );
}
