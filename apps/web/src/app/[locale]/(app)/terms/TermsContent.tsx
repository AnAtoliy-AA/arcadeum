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
import type { TermsMessages, ContactMessages } from '@/shared/i18n/types';
import {
  TermsSectionGroup1,
  TermsSectionGroup2,
  TermsSectionGroup3,
} from './TermsSections';

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
  const [activeSection, setActiveSection] = useState<string>('agreement');

  const navItems = useMemo(() => {
    const raw = [
      { id: 'agreement', title: s?.agreement?.title ?? 'Agreement' },
      { id: 'companyInfo', title: s?.companyInfo?.title ?? 'Company Info' },
      { id: 'services', title: s?.services?.title ?? 'Services' },
      { id: 'accounts', title: s?.accounts?.title ?? 'Accounts' },
      { id: 'delivery', title: s?.delivery?.title ?? 'Delivery' },
      { id: 'payment', title: s?.payment?.title ?? 'Payment' },
      { id: 'refund', title: s?.refund?.title ?? 'Refund Policy' },
      {
        id: 'acceptableUse',
        title: s?.acceptableUse?.title ?? 'Acceptable Use',
      },
      {
        id: 'intellectualProperty',
        title: s?.intellectualProperty?.title ?? 'Intellectual Property',
      },
      { id: 'liability', title: s?.liability?.title ?? 'Liability' },
      ...(s?.crypto ? [{ id: 'crypto', title: s.crypto.title }] : []),
      ...(s?.taxes ? [{ id: 'taxes', title: s.taxes.title }] : []),
      { id: 'governingLaw', title: s?.governingLaw?.title ?? 'Governing Law' },
      { id: 'contact', title: s?.contact?.title ?? 'Contact' },
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
          data-testid="terms-page-wrapper"
        >
          {/* Hero Header */}
          <GlassCard
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.6) 80%)',
            }}
            className="items-center text-center p-9"
          >
            <div className="flex flex-col gap-3 items-center max-w-[720px]">
              <Badge accent="#818CF8">Legal & Governance</Badge>

              <h1 className="m-0">
                <Typography
                  variant="heading"
                  uiSize="xl"
                  gradient="primary"
                  className="text-4xl font-extrabold tracking-tight"
                >
                  {t?.title ?? 'Terms of Service'}
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
                Please review our terms governing your use of the {APP_NAME}{' '}
                platform, services, and digital assets.
              </Typography>

              {/* Quick links to sister legal pages */}
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Link
                  href={routes.privacy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:bg-white/10 text-xs font-semibold text-indigo-300 transition-all no-underline"
                >
                  <ShieldIcon size={14} />
                  Privacy Policy
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
                  {contactT?.title ?? 'Contact Us'}
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
                icon={<FileTextIcon size={16} />}
                accentColor="indigo"
              />
            </aside>

            {/* Legal Text Column */}
            <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              <TermsSectionGroup1
                id="group-1"
                t={t}
                contactT={contactT}
                LEGAL_NAME={LEGAL_NAME}
                ID_CODE={ID_CODE}
                SUPPORT_EMAIL={SUPPORT_EMAIL}
                WORKING_HOURS={WORKING_HOURS}
              />
              <TermsSectionGroup2
                id="group-2"
                t={t}
                contactT={contactT}
                LEGAL_NAME={LEGAL_NAME}
                ID_CODE={ID_CODE}
                SUPPORT_EMAIL={SUPPORT_EMAIL}
                WORKING_HOURS={WORKING_HOURS}
              />
              <TermsSectionGroup3
                id="group-3"
                t={t}
                contactT={contactT}
                LEGAL_NAME={LEGAL_NAME}
                ID_CODE={ID_CODE}
                SUPPORT_EMAIL={SUPPORT_EMAIL}
                WORKING_HOURS={WORKING_HOURS}
              />
            </main>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
