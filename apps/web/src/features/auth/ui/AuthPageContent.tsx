'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import type { SessionDetailItem } from '../types';
import { formatDateTime } from '../lib/utils';
import { resolveProviderLabel } from '../lib/labels';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { useAuthForm } from '../hooks/useAuthForm';
import { Page, Wrapper, PanelsSection } from './styles';
import { HeroSection } from './HeroSection';
import { LocalAuthPanel } from './LocalAuthPanel';
import { OAuthPanel } from './OAuthPanel';
import { SessionStatusPanel } from './SessionStatusPanel';
import { DownloadSection } from './DownloadSection';

export function AuthPageContent() {
  const router = useRouter();
  const { primaryCta, supportCta, downloads } = appConfig;

  const form = useAuthForm();
  const labels = useAuthLabels(form.isRegisterMode);

  useEffect(() => {
    if (form.hasSession) {
      router.push(routes.games);
    }
  }, [form.hasSession, router]);

  const providerLabel = resolveProviderLabel(
    form.sessionSnapshot.provider,
    undefined,
    undefined,
  );

  const sessionDetails: SessionDetailItem[] = useMemo(
    () => [
      {
        key: 'provider',
        term: labels.sessionDetailLabels.provider,
        value: providerLabel,
      },
      {
        key: 'email',
        term: labels.emailLabel,
        value: form.sessionSnapshot.email,
      },
      {
        key: 'username',
        term: labels.usernameLabel,
        value: form.sessionSnapshot.username,
      },
      {
        key: 'displayName',
        term: labels.sessionDetailLabels.displayName,
        value: form.sessionSnapshot.displayName,
      },
      {
        key: 'userId',
        term: labels.sessionDetailLabels.userId,
        value: form.sessionSnapshot.userId,
      },
      {
        key: 'accessExpires',
        term: labels.sessionDetailLabels.accessExpires,
        value: formatDateTime(form.sessionSnapshot.accessTokenExpiresAt),
      },
      {
        key: 'refreshExpires',
        term: labels.sessionDetailLabels.refreshExpires,
        value: formatDateTime(form.sessionSnapshot.refreshTokenExpiresAt),
      },
      {
        key: 'updated',
        term: labels.sessionDetailLabels.updated,
        value: formatDateTime(form.sessionSnapshot.updatedAt),
      },
    ],
    [labels, form.sessionSnapshot, providerLabel],
  );

  const heroConfig = useMemo(
    () => ({
      primaryActionHref: supportCta.href,
      secondaryActionHref: primaryCta.href,
    }),
    [supportCta.href, primaryCta.href],
  );

  const downloadConfig = useMemo(
    () => ({
      iosHref: downloads.iosHref,
      androidHref: downloads.androidHref,
    }),
    [downloads.iosHref, downloads.androidHref],
  );

  return (
    <Page>
      <Wrapper>
        <HeroSection labels={labels} config={heroConfig} />
        <PanelsSection>
          <LocalAuthPanel labels={labels} form={form} />
          <OAuthPanel labels={labels} form={form} />
          <SessionStatusPanel
            labels={labels}
            form={form}
            sessionDetails={sessionDetails}
          />
        </PanelsSection>
        <DownloadSection labels={labels} config={downloadConfig} />
      </Wrapper>
    </Page>
  );
}
