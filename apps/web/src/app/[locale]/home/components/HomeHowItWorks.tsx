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
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 overflow-hidden py-12 [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
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
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-8 min-[1151px]:max-w-[1100px] min-[1151px]:flex-row min-[1151px]:gap-12">
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
              className="relative flex min-h-[120px] flex-1 flex-row items-start gap-4 min-[1151px]:min-h-[180px] min-[1151px]:flex-col min-[1151px]:items-center"
            >
              {index < STEPS.length - 1 && (
                <div className="absolute bottom-[-32px] left-[27px] top-[56px] z-0 w-[2px] bg-step-connector-v min-[1151px]:bottom-auto min-[1151px]:left-1/2 min-[1151px]:top-[28px] min-[1151px]:h-[2px] min-[1151px]:w-[calc(100%+48px)] min-[1151px]:bg-step-connector-h" />
              )}
              <div className="relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary bg-glass-bg transition-[transform,box-shadow] duration-200 hover:scale-[1.08] hover:shadow-[0_0_28px_rgba(87,195,255,0.35)]">
                <span className="text-[20px] font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2 pt-2">
                <h3 className="m-0 text-center text-[20px] font-semibold tracking-[-0.3px] text-color">
                  {title}
                </h3>
                <p className="m-0 max-w-[300px] text-center text-[18px] leading-[20px] text-color opacity-70">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
