'use client';

import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';

interface Step {
  number: number;
  titleKey: string;
  descriptionKey: string;
  defaultTitle: string;
  defaultDescription: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    titleKey: 'stepCreateTitle',
    descriptionKey: 'stepCreateDescription',
    defaultTitle: 'Create or Join a Room',
    defaultDescription:
      'Start a new game room or enter an invite code to join an existing session.',
  },
  {
    number: 2,
    titleKey: 'stepInviteTitle',
    descriptionKey: 'stepInviteDescription',
    defaultTitle: 'Invite Your Friends',
    defaultDescription:
      'Share the room link or code with friends. They can join from any device instantly.',
  },
  {
    number: 3,
    titleKey: 'stepPlayTitle',
    descriptionKey: 'stepPlayDescription',
    defaultTitle: 'Play Together',
    defaultDescription: `Enjoy board games with ${appConfig.appName} handling rules, turns, and scoring automatically.`,
  },
];

export default function HomeHowItWorks() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const { appName } = appConfig;

  const sectionRef = useScrollReveal<HTMLElement>();

  const sectionTitle =
    (homeCopy as Record<string, string>).howItWorksTitle ?? 'How It Works';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).howItWorksSubtitle ??
    'Get started in three simple steps';

  return (
    <section
      id="how-it-works"
      data-testid="how-it-works-section"
      ref={sectionRef}
      className="how-it-works-section-main"
    >
      <div className="section-header-main" data-reveal data-reveal-delay="1">
        <h2 className="section-title-main">{sectionTitle}</h2>
        <p className="section-subtitle-main">{sectionSubtitle}</p>
      </div>
      <div className="steps-container-main">
        {STEPS.map((step, index) => {
          const title =
            (homeCopy as Record<string, string>)[step.titleKey] ??
            step.defaultTitle;
          const rawDescription =
            (homeCopy as Record<string, string>)[step.descriptionKey] ??
            step.defaultDescription;
          const description =
            formatMessage(rawDescription, { appName }) ?? rawDescription;

          return (
            <div
              key={step.number}
              data-reveal
              data-reveal-delay={String(Math.min(index + 2, 6))}
              className="step-item-main"
            >
              {index < STEPS.length - 1 && (
                <div className="step-connector-main" />
              )}
              <div className="step-number-main">
                <span
                  style={{
                    color: 'var(--primary)',
                    fontWeight: '700',
                    fontSize: 'var(--t-font-size-5)',
                  }}
                >
                  {step.number}
                </span>
              </div>
              <div className="step-content-main">
                <h3 className="step-title-main">{title}</h3>
                <p className="step-description-main">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
