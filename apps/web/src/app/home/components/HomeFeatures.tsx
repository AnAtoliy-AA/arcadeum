'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';

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

export default function HomeFeatures() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const { appName } = appConfig;
  const sectionRef = useScrollReveal<HTMLElement>();

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
    <section
      id="features"
      data-testid="features-section"
      ref={sectionRef}
      className="features-section-main"
    >
      <div className="section-header-main" data-reveal data-reveal-delay="1">
        <h2 className="section-title-main">{sectionTitle}</h2>
        <p className="section-subtitle-main">{sectionSubtitle}</p>
      </div>
      <div className="features-grid-main">
        {FEATURES.map((feature, index) => {
          const title =
            (homeCopy as Record<string, string>)[feature.titleKey] ??
            feature.defaultTitle;
          const description =
            (homeCopy as Record<string, string>)[feature.descriptionKey] ??
            feature.defaultDescription;

          return (
            <div
              key={feature.titleKey}
              data-reveal
              data-reveal-delay={String(Math.min(index + 2, 6))}
              className="feature-card-main"
            >
              <div
                className="feature-icon-main"
                style={{ boxShadow: '0 4px 20px rgba(87,195,255,0.12)' }}
              >
                <span>{feature.icon}</span>
              </div>
              <h3 className="feature-title-main">{title}</h3>
              <p className="feature-description-main">{description}</p>
              {feature.comingSoon && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'var(--t-space-4)',
                    right: 'var(--t-space-4)',
                    padding: 'var(--t-space-1) var(--t-space-2)',
                    borderRadius: 'var(--t-radius-4)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {comingSoonLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
