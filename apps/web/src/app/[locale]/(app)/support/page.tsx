import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildPersonJsonLd } from '@/shared/seo/personJsonLd';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import SupportClient from './client';
import { appConfig } from '@/shared/config/app-config';
import { JsonLd } from '@/shared/ui/JsonLd';
import type {
  SupportAction,
  SupportTeamMember,
} from '@/entities/support/model/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'support' }) : {};
}

const TEAM_MEMBERS: SupportTeamMember[] = [
  {
    key: 'producer',
    icon: '👥',
    name: 'Anatoliy Aliaksandrau',
    role: 'Product & realtime systems',
    bio: 'Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.',
    linkedin: appConfig.social.linkedinDeveloper,
  },
  {
    key: 'designer',
    icon: '🎨',
    name: 'Anatoliy Aliaksandrau',
    role: 'Game designer & UX',
    bio: 'Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.',
    linkedin: appConfig.social.linkedinDeveloper,
  },
  {
    key: 'engineer',
    icon: '🛠️',
    name: 'Anatoliy Aliaksandrau',
    role: 'Full-stack engineer',
    bio: 'Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.',
    linkedin: appConfig.social.linkedinDeveloper,
  },
];

function buildActions(): SupportAction[] {
  const actions: SupportAction[] = [
    {
      key: 'payment',
      icon: '💳',
      type: 'route',
      href: '/payment',
      title: 'Card payment',
      description:
        "Enter an amount and we'll open PayPal's secure checkout in your browser.",
      cta: 'Enter amount',
    },
    {
      key: 'sponsor',
      icon: '⭐️',
      type: 'route',
      href: '/payment?mode=subscription',
      title: 'Recurring sponsorship',
      description:
        'Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.',
      cta: 'Sponsor development',
    },
    {
      key: 'github',
      icon: '🐙',
      type: 'external',
      href: 'https://github.com/AnAtoliy-AA/arcadeum',
      title: 'Star on GitHub',
      description:
        'Support the project by starring the repository. It helps our visibility and community growth.',
      cta: 'View on GitHub',
    },
  ];

  return actions;
}

/**
 * Dedupe team members by name so we emit one Person schema per real
 * human, with combined `jobTitle` when they wear multiple hats. The
 * visible page still lists each role separately.
 */
function buildTeamPersonJsonLd(): Record<string, unknown>[] {
  const byName = new Map<string, SupportTeamMember[]>();
  for (const member of TEAM_MEMBERS) {
    const existing = byName.get(member.name) ?? [];
    existing.push(member);
    byName.set(member.name, existing);
  }
  return Array.from(byName.values()).map((members) =>
    buildPersonJsonLd({
      name: members[0].name,
      jobTitle:
        members.length === 1 ? members[0].role : members.map((m) => m.role),
      description: members[0].bio,
      url: members[0].linkedin,
      sameAs: members[0].linkedin ? [members[0].linkedin] : undefined,
    }),
  );
}

export default async function SupportRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getTranslations();
  const supportT = messages.support;
  const actions = buildActions();
  const teamJsonLd = buildTeamPersonJsonLd();

  return (
    <>
      <JsonLd data={teamJsonLd} />
      <PageBreadcrumb locale={locale} page="support" />
      <SupportClient
        appName={appConfig.appName}
        supportT={supportT}
        teamMembers={TEAM_MEMBERS}
        actions={actions}
      />
    </>
  );
}
