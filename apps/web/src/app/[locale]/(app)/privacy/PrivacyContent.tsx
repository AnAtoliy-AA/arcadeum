'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { appConfig } from '@/shared/config/app-config';
import { useRoutes } from '@/shared/config/useRoutes';
import { useLanguage } from '@/shared/i18n/context';
import {
  PageLayout,
  Container,
  GlassCard,
  Typography,
  Badge,
  TableOfContents,
} from '@arcadeum/ui';
import {
  ShieldIcon,
  FileTextIcon,
  MailIcon,
} from '@arcadeum/ui/components/Icons/index';
import type { PrivacyMessages, ContactMessages } from '@/shared/i18n/types';
import { PrivacySectionGroup1, PrivacySectionGroup2 } from './PrivacySections';

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
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const navItems = useMemo(() => {
    const raw = [
      { id: 'introduction', title: s?.introduction?.title ?? 'Introduction' },
      {
        id: 'dataCollection',
        title: s?.dataCollection?.title ?? 'Data We Collect',
      },
      { id: 'dataUsage', title: s?.dataUsage?.title ?? 'How We Use Data' },
      { id: 'dataSharing', title: s?.dataSharing?.title ?? 'Data Sharing' },
      { id: 'dataSecurity', title: s?.dataSecurity?.title ?? 'Data Security' },
      {
        id: 'dataRetention',
        title: s?.dataRetention?.title ?? 'Data Retention',
      },
      { id: 'userRights', title: s?.userRights?.title ?? 'Your Rights' },
      { id: 'cookies', title: s?.cookies?.title ?? 'Cookies' },
      { id: 'children', title: s?.children?.title ?? 'Children Privacy' },
      {
        id: 'internationalTransfers',
        title: s?.internationalTransfers?.title ?? 'International Transfers',
      },
      {
        id: 'policyChanges',
        title: s?.policyChanges?.title ?? 'Policy Changes',
      },
      { id: 'contact', title: s?.contact?.title ?? 'Contact Us' },
    ];
    return raw.filter((item): item is { id: string; title: string } =>
      Boolean(item.title),
    );
  }, [s]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageLayout>
      <Container size="xl">
        <div
          className="flex flex-col gap-8 py-6"
          data-testid="privacy-page-wrapper"
        >
          {/* Hero Header */}
          <GlassCard className="items-center text-center p-9 border border-[var(--glassBorder)] bg-[var(--glassBg)]">
            <div className="flex flex-col gap-3 items-center max-w-[720px]">
              <Badge accent="#38BDF8">Data Protection & Trust</Badge>

              <Typography
                variant="heading"
                level={1}
                uiSize="xl"
                gradient="primary"
                className="m-0 text-4xl font-extrabold tracking-tight"
              >
                {t?.title ?? 'Privacy Policy'}
              </Typography>

              {t?.lastUpdated && (
                <Typography
                  variant="caption"
                  alpha="medium"
                  className="text-xs uppercase tracking-wider text-[var(--textSecondary)]"
                >
                  {t.lastUpdated}
                </Typography>
              )}

              <Typography
                variant="body"
                uiSize="lg"
                alpha="high"
                className="mt-2 text-[var(--textSecondary)]"
              >
                Learn how {APP_NAME} collects, uses, and safeguards your
                personal data with transparency and security.
              </Typography>

              {/* Quick links to sister legal pages */}
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Link
                  href={routes.terms}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] hover:border-[var(--glassBorderStrong)] text-xs font-semibold text-[var(--color)] transition-all no-underline"
                >
                  <FileTextIcon size={14} />
                  Terms of Service
                </Link>
                <Link
                  href={routes.cookies}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] hover:border-[var(--glassBorderStrong)] text-xs font-semibold text-[var(--color)] transition-all no-underline"
                >
                  <FileTextIcon size={14} />
                  Cookie Policy
                </Link>
                <Link
                  href={routes.contact}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] hover:border-[var(--glassBorderStrong)] text-xs font-semibold text-[var(--color)] transition-all no-underline"
                >
                  <MailIcon size={14} />
                  {contactT?.title ?? 'Contact Privacy Team'}
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Main Content Layout with Sidebar Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sticky Table of Contents Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 max-lg:hidden">
              <TableOfContents
                items={navItems}
                activeId={activeSection}
                onSelect={scrollToSection}
                icon={<ShieldIcon size={16} />}
                accentColor="sky"
              />
            </aside>

            {/* Privacy Text Column */}
            <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              <PrivacySectionGroup1
                t={t}
                contactT={contactT}
                PRIVACY_EMAIL={PRIVACY_EMAIL}
              />
              <PrivacySectionGroup2
                t={t}
                contactT={contactT}
                PRIVACY_EMAIL={PRIVACY_EMAIL}
              />
            </main>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
