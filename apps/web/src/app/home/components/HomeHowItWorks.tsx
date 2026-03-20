'use client';

import { Text } from 'tamagui';
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
  StepConnector,
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
    <HowItWorksSection data-testid="how-it-works-section">
      <SectionHeader>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionSubtitle>{sectionSubtitle}</SectionSubtitle>
      </SectionHeader>
      <StepsContainer>
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
            <StepItem key={step.number}>
              {index < STEPS.length - 1 && (
                <StepConnector
                  style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)',
                  }}
                />
              )}
              <StepNumber style={{ boxShadow: '0 0 20px rgba(87,195,255,0.15), 0 0 0 1px rgba(255,255,255,0.06)' }}>
                <Text color="$primary" fontWeight="700" fontSize="$5">
                  {step.number}
                </Text>
              </StepNumber>
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
