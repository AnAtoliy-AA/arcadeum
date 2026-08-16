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
  AccentPill,
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
          <GlassCard
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.6) 80%)',
            }}
            className="items-center text-center p-9"
          >
            <div className="flex flex-col gap-3 items-center max-w-[720px]">
              <AccentPill accent="#38BDF8">Data Protection & Trust</AccentPill>

              <h1 className="m-0">
                <Typography
                  variant="heading"
                  uiSize="xl"
                  gradient="primary"
                  className="text-4xl font-extrabold tracking-tight"
                >
                  {t?.title ?? 'Privacy Policy'}
                </Typography>
              </h1>

              {t?.lastUpdated && (
                <Typography
                  variant="caption"
                  alpha="medium"
                  className="text-xs uppercase tracking-wider"
                >
                  {t.lastUpdated}
                </Typography>
              )}

              <Typography
                variant="body"
                uiSize="lg"
                alpha="high"
                className="mt-2 text-slate-300"
              >
                Learn how {APP_NAME} collects, uses, and safeguards your
                personal data with transparency and security.
              </Typography>

              {/* Quick links to sister legal pages */}
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Link
                  href={routes.terms}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-white/10 text-xs font-semibold text-indigo-300 transition-all no-underline"
                >
                  <FileTextIcon size={14} />
                  Terms of Service
                </Link>
                <Link
                  href={routes.cookies}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400/40 hover:bg-white/10 text-xs font-semibold text-sky-300 transition-all no-underline"
                >
                  <FileTextIcon size={14} />
                  Cookie Policy
                </Link>
                <Link
                  href={routes.contact}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/40 hover:bg-white/10 text-xs font-semibold text-emerald-300 transition-all no-underline"
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
