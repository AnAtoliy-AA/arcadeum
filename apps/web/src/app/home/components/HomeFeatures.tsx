'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';
import {
  FeaturesSection,
  FeaturesGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  ComingSoonBadge,
} from './styles/Features.styles';

interface Feature {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  defaultTitle: string;
  defaultDescription: string;
  comingSoon?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: '🎮',
    titleKey: 'featureRoomsTitle',
    descriptionKey: 'featureRoomsDescription',
    defaultTitle: 'Real-time Rooms',
    defaultDescription:
      'Create game rooms instantly and start playing with friends in seconds. No downloads required.',
  },
  {
    icon: '⚡',
    titleKey: 'featureRulesTitle',
    descriptionKey: 'featureRulesDescription',
    defaultTitle: 'Automated Rules',
    defaultDescription:
      'Let the app handle rules, scoring, and turn management so you can focus on the fun.',
  },
  {
    icon: '📱',
    titleKey: 'featureCrossplatformTitle',
    descriptionKey: 'featureCrossplatformDescription',
    defaultTitle: 'Cross-platform',
    defaultDescription:
      'Play instantly in your browser on desktop and mobile. Native apps for iOS and Android coming soon.',
  },
  {
    icon: '🔒',
    titleKey: 'featureInviteTitle',
    descriptionKey: 'featureInviteDescription',
    defaultTitle: 'Private Rooms & Chat',
    defaultDescription:
      'Create secured rooms for your group with integrated chat to banter while you play.',
  },
  {
    icon: '🦜',
    titleKey: 'featureSpectatorTitle',
    descriptionKey: 'featureSpectatorDescription',
    defaultTitle: 'Spectator Mode',
    defaultDescription:
      'Watch friends play live on web. TV support coming soon.',
  },
  {
    icon: '📊',
    titleKey: 'featureStatsTitle',
    descriptionKey: 'featureStatsDescription',
    defaultTitle: 'Game Statistics',
    defaultDescription:
      'Track your win rates, history, and achievements across all games.',
  },
  {
    icon: '🏆',
    titleKey: 'featureTournamentsTitle',
    descriptionKey: 'featureTournamentsDescription',
    defaultTitle: 'Tournaments',
    defaultDescription:
      'Compete in ranked events and prove your skills against the best players.',
    comingSoon: true,
  },
];

export function HomeFeatures() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const { appName } = appConfig;

  const sectionTitle =
    formatMessage((homeCopy as Record<string, string>).featuresTitle, {
      appName,
    }) ?? `Why ${appName}?`;
  const sectionSubtitle =
    (homeCopy as Record<string, string>).featuresSubtitle ??
    'Everything you need to play board games online with friends';
  const comingSoonLabel =
    (homeCopy as Record<string, string>).comingSoon ?? 'Coming Soon';

  return (
    <FeaturesSection>
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <FeaturesGrid>
        {FEATURES.map((feature) => {
          const title =
            (homeCopy as Record<string, string>)[feature.titleKey] ??
            feature.defaultTitle;
          const description =
            (homeCopy as Record<string, string>)[feature.descriptionKey] ??
            feature.defaultDescription;

          return (
            <FeatureCard key={feature.titleKey}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{title}</FeatureTitle>
              <FeatureDescription>{description}</FeatureDescription>
              {feature.comingSoon && (
                <ComingSoonBadge>{comingSoonLabel}</ComingSoonBadge>
              )}
            </FeatureCard>
          );
        })}
      </FeaturesGrid>
    </FeaturesSection>
  );
}
