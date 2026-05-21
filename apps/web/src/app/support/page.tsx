import type { Metadata } from 'next';

import { getTranslations } from '@/shared/i18n/server';
import SupportClient from './client';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getSeoMessages } from '@/shared/seo/messages';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import type {
  SupportAction,
  SupportTeamMember,
} from '@/entities/support/model/types';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'support');
  return buildMetadata({
    ...seo,
    path: routes.support,
    keywords: [
      'support arcadeum',
      'sponsor',
      'donate',
      'open source board games',
    ],
    locale,
  });
}

const SUPPORT_JSON_LD = [
  webPage({
    name: `Support the developers — ${appConfig.appName}`,
    description: 'Sponsor development and keep the platform free.',
    path: routes.support,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Support', path: routes.support },
  ]),
];

const TEAM_MEMBERS: SupportTeamMember[] = [
  {
    key: 'producer',
    icon: '👥',
    name: 'Anatoliy Aliaksandrau',
    role: 'Product & realtime systems',
    bio: 'Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.',
    linkedin: appConfig.social.linkedin,
  },
  {
    key: 'designer',
    icon: '🎨',
    name: 'Anatoliy Aliaksandrau',
    role: 'Game designer & UX',
    bio: 'Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.',
    linkedin: appConfig.social.linkedin,
  },
  {
    key: 'engineer',
    icon: '🛠️',
    name: 'Anatoliy Aliaksandrau',
    role: 'Full-stack engineer',
    bio: 'Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.',
    linkedin: appConfig.social.linkedin,
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

export default async function SupportRoute() {
  const messages = await getTranslations();
  const supportT = messages.support;
  const actions = buildActions();

  return (
    <>
      <JsonLd data={SUPPORT_JSON_LD} />
      <SupportClient
        appName={appConfig.appName}
        supportT={supportT}
        teamMembers={TEAM_MEMBERS}
        actions={actions}
      />
    </>
  );
}
