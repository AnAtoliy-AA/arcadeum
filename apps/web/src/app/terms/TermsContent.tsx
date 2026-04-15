'use client';

import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { formatMessage } from '@/shared/i18n';
import Link from 'next/link';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  YStack,
} from '@/shared/ui';
import type { TermsMessages, ContactMessages } from '@/shared/i18n/types';

export interface TermsContentProps {
  t?: TermsMessages;
  contactT?: ContactMessages;
  LEGAL_NAME: string;
  ID_CODE: string;
  SUPPORT_EMAIL: string;
  WORKING_HOURS: string;
}

const APP_NAME = appConfig.appName;

export default function TermsContent({
  t,
  contactT,
  LEGAL_NAME,
  ID_CODE,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: TermsContentProps) {
  const s = t?.sections;

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

        <Section variant="legal" title={s?.agreement?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.agreement?.content, { appName: APP_NAME })}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.companyInfo?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            <strong>{s?.companyInfo?.companyName}</strong> {APP_NAME}
            <br />
            <strong>{s?.companyInfo?.legalName}</strong> {LEGAL_NAME}
            <br />
            <strong>{s?.companyInfo?.idCode}</strong> {ID_CODE}
            <br />
            <strong>{s?.companyInfo?.contactEmail}</strong> {SUPPORT_EMAIL}
            <br />
            <strong>{s?.companyInfo?.workingHours}</strong> {WORKING_HOURS}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.services?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.services?.intro, { appName: APP_NAME })}
          </Typography>
          <YStack paddingLeft="$5" gap="$2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              {s?.services?.items?.map((item, index) => (
                <li key={index}>
                  <Typography variant="body" uiSize="md" alpha="high">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </YStack>
        </Section>

        <Section variant="legal" title={s?.accounts?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.accounts?.intro, { appName: APP_NAME })}
          </Typography>
          <YStack paddingLeft="$5" gap="$2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              {s?.accounts?.items?.map((item, index) => (
                <li key={index}>
                  <Typography variant="body" uiSize="md" alpha="high">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </YStack>
        </Section>

        <Section variant="legal" title={s?.delivery?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.delivery?.content, { appName: APP_NAME })}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.payment?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.payment?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.refund?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.refund?.intro}
          </Typography>
          <YStack paddingLeft="$5" gap="$2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.refund?.items?.virtualCurrency}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.refund?.items?.subscriptions}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.refund?.items?.technicalIssues}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.refund?.items?.processingTime}</strong>
                </Typography>
              </li>
            </ul>
          </YStack>
          <Typography variant="body" uiSize="md" alpha="high" marginTop="$4">
            {s?.refund?.contact}{' '}
            <Link href={routes.contact}>
              <Typography color="$primary" textDecorationLine="underline">
                {contactT?.title}
              </Typography>
            </Link>
            .
          </Typography>
        </Section>

        <Section variant="legal" title={s?.acceptableUse?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.acceptableUse?.intro}
          </Typography>
          <YStack paddingLeft="$5" gap="$2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              {s?.acceptableUse?.items?.map((item, index) => (
                <li key={index}>
                  <Typography variant="body" uiSize="md" alpha="high">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </YStack>
        </Section>

        <Section variant="legal" title={s?.intellectualProperty?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.intellectualProperty?.content, {
              appName: APP_NAME,
            })}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.liability?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.liability?.content, { appName: APP_NAME })}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.governingLaw?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.governingLaw?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.contact?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.contact?.content, { email: SUPPORT_EMAIL })}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
