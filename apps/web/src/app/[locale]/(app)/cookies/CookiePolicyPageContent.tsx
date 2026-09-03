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
  FileTextIcon,
  ShieldIcon,
  MailIcon,
  LockIcon,
} from '@arcadeum/ui/components/Icons/index';

interface CookieSection {
  title?: string;
  content?: string;
  intro?: string;
  items?: string[];
}

export interface CookiePolicyPageContentProps {
  t?: {
    title?: string;
    lastUpdated?: string;
    sections?: Record<string, CookieSection>;
  };
}

const APP_NAME = appConfig.appName;

export default function CookiePolicyPageContent({
  t: initialT,
}: CookiePolicyPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const t = messages.pages?.cookies || initialT;
  const sections = t?.sections as Record<string, CookieSection> | undefined;
  const [activeSection, setActiveSection] = useState<string>('whatAreCookies');

  const navItems = useMemo(() => {
    if (!sections) return [];
    return Object.entries(sections).map(([key, sec]) => ({
      id: key,
      title: sec.title || key,
    }));
  }, [sections]);

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
          data-testid="cookies-page-wrapper"
        >
          {/* Hero Header */}
          <GlassCard className="items-center text-center p-9 border border-[var(--glassBorder)] bg-[var(--glassBg)]">
            <div className="flex flex-col gap-3 items-center max-w-[720px]">
              <Badge accent="#38BDF8">
                {(t as { badge?: string } | undefined)?.badge ||
                  'Trust & Transparency'}
              </Badge>

              <Typography
                variant="heading"
                level={1}
                uiSize="xl"
                gradient="primary"
                className="m-0 text-4xl font-extrabold tracking-tight"
              >
                {t?.title ?? 'Cookie Policy'}
              </Typography>

              {t?.lastUpdated && (
                <Typography
                  variant="caption"
                  alpha="medium"
                  className="text-xs uppercase tracking-wider text-[var(--textSecondary)] font-semibold"
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
                Learn how {APP_NAME} uses cookies and web storage to enhance
                your gaming experience, remember settings, and protect user
                data.
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
                  href={routes.privacy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] hover:border-[var(--glassBorderStrong)] text-xs font-semibold text-[var(--color)] transition-all no-underline"
                >
                  <ShieldIcon size={14} />
                  Privacy Policy
                </Link>
                <Link
                  href={routes.contact}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] hover:border-[var(--glassBorderStrong)] text-xs font-semibold text-[var(--color)] transition-all no-underline"
                >
                  <MailIcon size={14} />
                  Contact Support
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* Main Layout with Sidebar Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sticky Table of Contents Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 max-lg:hidden">
              <TableOfContents
                items={navItems}
                activeId={activeSection}
                onSelect={scrollToSection}
                icon={<LockIcon size={16} />}
                accentColor="sky"
                title="Cookie Navigation"
              />
            </aside>

            {/* Cookie Policy Content Cards */}
            <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              {sections &&
                Object.entries(sections).map(([key, sec]) => (
                  <GlassCard
                    key={key}
                    id={`section-${key}`}
                    className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
                        <LockIcon size={20} />
                      </div>
                      <Typography
                        variant="heading"
                        uiSize="md"
                        className="font-bold text-[var(--color)]"
                      >
                        {sec.title}
                      </Typography>
                    </div>

                    {sec.intro && (
                      <Typography
                        variant="body"
                        uiSize="md"
                        alpha="high"
                        className="text-[var(--textSecondary)] leading-relaxed"
                      >
                        {sec.intro}
                      </Typography>
                    )}

                    {sec.content && (
                      <Typography
                        variant="body"
                        uiSize="md"
                        alpha="high"
                        className="text-[var(--textSecondary)] leading-relaxed"
                      >
                        {sec.content}
                      </Typography>
                    )}

                    {sec.items && sec.items.length > 0 && (
                      <ul className="flex flex-col gap-2 pl-4 list-disc text-[var(--textSecondary)] text-sm mt-1">
                        {sec.items.map((item, index) => (
                          <li key={index} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </GlassCard>
                ))}
            </main>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
