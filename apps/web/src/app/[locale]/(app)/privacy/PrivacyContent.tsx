'use client';

import { appConfig } from '@/shared/config/app-config';
import { useRoutes } from '@/shared/config/useRoutes';
import { formatMessage } from '@/shared/i18n';
import { useLanguage } from '@/shared/i18n/context';
import Link from 'next/link';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
} from '@arcadeum/ui';
import type { PrivacyMessages, ContactMessages } from '@/shared/i18n/types';

export interface PrivacyContentProps {
  t?: PrivacyMessages;
  contactT?: ContactMessages;
  PRIVACY_EMAIL: string;
}

const APP_NAME = appConfig.appName;

export default function PrivacyContent({
  t: initialT,
  contactT: initialContactT,
  PRIVACY_EMAIL,
}: PrivacyContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const t = (messages.legal?.privacy as unknown as PrivacyMessages) || initialT;
  const contactT = messages.legal?.contact || initialContactT;
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

        <Section variant="legal" title={s?.introduction?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.introduction?.content, { appName: APP_NAME })}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.dataCollection?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.dataCollection?.intro}
          </Typography>
          <div className="flex flex-col items-stretch pl-5 gap-2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataCollection?.items?.account}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataCollection?.items?.payment}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataCollection?.items?.usage}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataCollection?.items?.device}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataCollection?.items?.communications}</strong>
                </Typography>
              </li>
            </ul>
          </div>
        </Section>

        <Section variant="legal" title={s?.dataUsage?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.dataUsage?.intro}
          </Typography>
          <div className="flex flex-col items-stretch pl-5 gap-2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              {s?.dataUsage?.items?.map((item, index) => (
                <li key={index}>
                  <Typography variant="body" uiSize="md" alpha="high">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section variant="legal" title={s?.dataSharing?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.dataSharing?.intro}
          </Typography>
          <div className="flex flex-col items-stretch pl-5 gap-2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataSharing?.items?.serviceProviders}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataSharing?.items?.legal}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.dataSharing?.items?.businessTransfers}</strong>
                </Typography>
              </li>
            </ul>
          </div>
        </Section>

        <Section variant="legal" title={s?.dataSecurity?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.dataSecurity?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.dataRetention?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.dataRetention?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.userRights?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.userRights?.intro}
          </Typography>
          <div className="flex flex-col items-stretch pl-5 gap-2">
            <ul
              style={{
                listStyleType: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
              }}
            >
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.userRights?.items?.access}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.userRights?.items?.correction}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.userRights?.items?.deletion}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.userRights?.items?.portability}</strong>
                </Typography>
              </li>
              <li>
                <Typography variant="body" uiSize="md" alpha="high">
                  <strong>{s?.userRights?.items?.objection}</strong>
                </Typography>
              </li>
            </ul>
          </div>
          <Typography
            className={'-mt-4'}
            variant="body"
            uiSize="md"
            alpha="high"
          >
            {s?.userRights?.contact}{' '}
            <Link href={routes.contact}>
              <Typography className={'text-[var(--primary)] underline'}>
                {contactT?.title}
              </Typography>
            </Link>
            .
          </Typography>
        </Section>

        <Section variant="legal" title={s?.cookies?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.cookies?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.children?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.children?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.internationalTransfers?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.internationalTransfers?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.policyChanges?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {s?.policyChanges?.content}
          </Typography>
        </Section>

        <Section variant="legal" title={s?.contact?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.contact?.content, { email: PRIVACY_EMAIL })}
          </Typography>
        </Section>
      </Container>
    </PageLayout>
  );
}
