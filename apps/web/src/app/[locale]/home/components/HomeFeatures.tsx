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
    icon: '🤖',
    titleKey: 'featureBotsTitle',
    descriptionKey: 'featureBotsDescription',
    defaultTitle: 'Play vs AI & Bots',
    defaultDescription:
      'Practice solo or challenge intelligent bots at easy, medium, or hard difficulties whenever friends are offline.',
  },
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
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-6 py-12 [content-visibility:auto] [contain-intrinsic-size:auto_700px] max-[640px]:px-5 max-[640px]:py-10"
    >
      <div
        className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-3 px-4"
        data-reveal
        data-reveal-delay="1"
      >
        <h2 className="m-0 text-center text-[32px] font-bold tracking-[-0.5px] text-color">
          {sectionTitle}
        </h2>
        <p className="m-0 mx-auto max-w-[600px] text-center text-[18px] text-color opacity-70">
          {sectionSubtitle}
        </p>
      </div>
      <div className="flex flex-row flex-wrap gap-6">
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
              className="group relative flex min-w-[280px] flex-1 flex-col gap-3 rounded-3xl border border-glass-border bg-glass-bg p-5 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:translate-y-[-10px] hover:scale-[1.02] hover:border-primary hover:bg-white/[0.05] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_20px_rgba(87,195,255,0.15)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-glass-border bg-white/[0.08] shadow-[0_4px_20px_rgba(87,195,255,0.12)] transition-transform duration-200 group-hover:scale-110">
                <span>{feature.icon}</span>
              </div>
              <h3 className="m-0 text-[20px] font-semibold text-color">
                {title}
              </h3>
              <p className="m-0 text-[16px] leading-[18px] text-color opacity-70">
                {description}
              </p>
              {feature.comingSoon && (
                <div className="absolute right-4 top-4 rounded-2xl bg-white/[0.1] px-2 py-1 text-[10px] font-bold uppercase tracking-[1px]">
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
