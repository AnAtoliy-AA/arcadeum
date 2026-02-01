'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import {
  SectionHeader,
  SectionTitle,
  SectionSubtitle,
} from './styles/Common.styles';
import {
  HowItWorksSection,
  StepsContainer,
  StepItem,
  StepNumber,
  StepContent,
  StepTitle,
  StepDescription,
} from './styles/HowItWorks.styles';

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

export function HomeHowItWorks() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const { appName } = appConfig;

  const sectionTitle =
    (homeCopy as Record<string, string>).howItWorksTitle ?? 'How It Works';
  const sectionSubtitle =
    (homeCopy as Record<string, string>).howItWorksSubtitle ??
    'Get started in three simple steps';

  return (
    <HowItWorksSection>
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <StepsContainer>
        {STEPS.map((step) => {
          const title =
            (homeCopy as Record<string, string>)[step.titleKey] ??
            step.defaultTitle;
          const rawDescription =
            (homeCopy as Record<string, string>)[step.descriptionKey] ??
            step.defaultDescription;
          const description =
            formatMessage(rawDescription, { appName }) ?? rawDescription;

          return (
            <StepItem key={step.number}>
              <StepNumber>{step.number}</StepNumber>
              <StepContent>
                <StepTitle>{title}</StepTitle>
                <StepDescription>{description}</StepDescription>
              </StepContent>
            </StepItem>
          );
        })}
      </StepsContainer>
    </HowItWorksSection>
  );
}
