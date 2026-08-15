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
  t: initialT,
  contactT: initialContactT,
  LEGAL_NAME,
  ID_CODE,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: TermsContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const t = (messages.legal?.terms as unknown as TermsMessages) || initialT;
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
          <div className="flex flex-col items-stretch pl-5 gap-2">
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
          </div>
        </Section>

        <Section variant="legal" title={s?.accounts?.title}>
          <Typography variant="body" uiSize="md" alpha="high">
            {formatMessage(s?.accounts?.intro, { appName: APP_NAME })}
          </Typography>
          <div className="flex flex-col items-stretch pl-5 gap-2">
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
          </div>
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
          </div>
          <Typography
            className={'-mt-4'}
            variant="body"
            uiSize="md"
            alpha="high"
          >
            {s?.refund?.contact}{' '}
            <Link href={routes.contact}>
              <Typography className={'text-[var(--primary)] underline'}>
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
          <div className="flex flex-col items-stretch pl-5 gap-2">
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
          </div>
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

        {s?.crypto && (
          <Section variant="legal" title={s?.crypto?.title}>
            <Typography variant="body" uiSize="md" alpha="high">
              {s?.crypto?.content}
            </Typography>
          </Section>
        )}

        {s?.arcPayments && (
          <Section variant="legal" title={s?.arcPayments?.title}>
            <Typography variant="body" uiSize="md" alpha="high">
              {s?.arcPayments?.content}
            </Typography>
            <div className="flex flex-col items-stretch pl-5 gap-2">
              <ul
                style={{
                  listStyleType: 'disc',
                  margin: 0,
                  paddingLeft: '1.25rem',
                }}
              >
                {s?.arcPayments?.items?.map((item, index) => (
                  <li key={index}>
                    <Typography variant="body" uiSize="md" alpha="high">
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {s?.noCashout && (
          <Section variant="legal" title={s?.noCashout?.title}>
            <Typography variant="body" uiSize="md" alpha="high">
              {s?.noCashout?.content}
            </Typography>
          </Section>
        )}

        {s?.notSecurity && (
          <Section variant="legal" title={s?.notSecurity?.title}>
            <Typography variant="body" uiSize="md" alpha="high">
              {s?.notSecurity?.content}
            </Typography>
          </Section>
        )}

        {s?.taxes && (
          <Section variant="legal" title={s?.taxes?.title}>
            <Typography variant="body" uiSize="md" alpha="high">
              {s?.taxes?.content}
            </Typography>
            <div className="flex flex-col items-stretch pl-5 gap-2">
              <ul
                style={{
                  listStyleType: 'disc',
                  margin: 0,
                  paddingLeft: '1.25rem',
                }}
              >
                {s?.taxes?.items?.map((item, index) => (
                  <li key={index}>
                    <Typography variant="body" uiSize="md" alpha="high">
                      {item}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
            {s?.taxes?.important && (
              <div className="flex flex-col items-stretch -mt-4 p-4 rounded-lg bg-[rgba(234,_179,_8,_0.15)] border-l-[4px] border-l-[#eab308]">
                <Typography
                  className={'font-bold'}
                  variant="body"
                  uiSize="md"
                  alpha="high"
                >
                  {s?.taxes?.important}
                </Typography>
              </div>
            )}
          </Section>
        )}

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
