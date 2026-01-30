import { appConfig } from '@/shared/config/app-config';
import { SupportPage as SupportPageView } from '@/app/support/SupportPage';
import type {
  SupportAction,
  SupportTeamMember,
} from '@/entities/support/model/types';

export const metadata = {
  title: 'Support the developers',
  description: `Keep ${appConfig.appName} iterating quickly and accessible to the tabletop community. Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes. Every contribution keeps ${appConfig.appName} evolving. Thank you for helping us build the future of remote tabletop play!`,
};

const SUPPORT_TITLE = 'Support the developers';
const SUPPORT_TAGLINE = `Keep ${appConfig.appName} iterating quickly and accessible to the tabletop community.`;
const SUPPORT_DESCRIPTION =
  'Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.';
const SUPPORT_THANKS = `Every contribution keeps ${appConfig.appName} evolving. Thank you for helping us build the future of remote tabletop play!`;

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
  ];

  actions.push({
    key: 'sponsor',
    icon: '⭐️',
    type: 'route',
    href: '/payment?mode=subscription',
    title: 'Recurring sponsorship',
    description:
      'Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.',
    cta: 'Sponsor development',
  });

  return actions;
}

export default function SupportRoute() {
  const actions = buildActions();

  return (
    <SupportPageView
      appName={appConfig.appName}
      title={SUPPORT_TITLE}
      tagline={SUPPORT_TAGLINE}
      description={SUPPORT_DESCRIPTION}
      thanks={SUPPORT_THANKS}
      teamMembers={TEAM_MEMBERS}
      actions={actions}
    />
  );
}
