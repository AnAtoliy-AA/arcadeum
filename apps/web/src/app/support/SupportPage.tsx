'use client';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { PageLayout } from '@/shared/ui/PageLayout';
import { PageTitle } from '@/shared/ui/PageTitle';
import type {
  SupportAction,
  SupportTeamMember,
} from '@/entities/support/model/types';
import { DEFAULT_LOCALE, getMessages } from '@/shared/i18n';
import type {
  SupportTeamKey,
  SupportActionKey,
} from '@/shared/i18n/messages/support';
import { HomeFooter } from '@/app/home/components/HomeFooter';
import {
  ActionDescription,
  ActionHeader,
  ActionList,
  ActionTitle,
  AnimatedGlassCard,
  BackgroundBlob,
  ContentWrapper,
  CopyActionWrapper,
  CtaIcon,
  CtaLink,
  CtaRow,
  ExternalCta,
  Header,
  HeaderDescription,
  LinkedInButton,
  Page,
  SectionTitle,
  Tagline,
  TeamBio,
  TeamCardInner,
  TeamGrid,
  TeamHeader,
  TeamIcon,
  TeamName,
  TeamRole,
  Thanks,
} from './styles';

export type SupportPageProps = {
  appName: string;
  title: string;
  tagline: string;
  description: string;
  thanks: string;
  teamMembers: SupportTeamMember[];
  actions: SupportAction[];
};
const DEFAULT_TRANSLATIONS = getMessages(DEFAULT_LOCALE);
const DEFAULT_SUPPORT_COPY = DEFAULT_TRANSLATIONS.support ?? {};

export function SupportPage({
  appName,
  title,
  tagline,
  description,
  thanks,
  teamMembers,
  actions,
}: SupportPageProps) {
  const { messages } = useLanguage();
  const supportCopy = messages.support ?? {};
  const defaultSupport = DEFAULT_SUPPORT_COPY;
  const defaultTeam = defaultSupport.team ?? {};
  const defaultActions = defaultSupport.actions ?? {};

  const resolvedTitle = supportCopy.title ?? defaultSupport.title ?? title;
  const resolvedTagline =
    formatMessage(supportCopy.tagline, { appName }) ??
    formatMessage(defaultSupport.tagline, { appName }) ??
    tagline;
  const resolvedDescription =
    formatMessage(supportCopy.description, { appName }) ??
    formatMessage(defaultSupport.description, { appName }) ??
    description;
  const resolvedThanks =
    formatMessage(supportCopy.thanks, { appName }) ??
    formatMessage(defaultSupport.thanks, { appName }) ??
    thanks;

  const localizedTeamMembers = teamMembers.map((member) => {
    const teamKey = member.key as SupportTeamKey;
    const overrides = supportCopy.team?.[teamKey];
    const base = defaultTeam[teamKey];
    return {
      ...member,
      role: overrides?.role ?? base?.role ?? member.role,
      bio:
        formatMessage(overrides?.bio, { appName }) ??
        formatMessage(base?.bio, { appName }) ??
        member.bio,
    };
  });

  const localizedActions = actions.map((action) => {
    const actionKey = action.key as SupportActionKey;
    const overrides = supportCopy.actions?.[actionKey];
    const base = defaultActions[actionKey];
    const context = {
      appName,
      iban: action.type === 'copy' ? action.value : undefined,
    } satisfies Record<string, string | undefined>;

    const titleCopy = overrides?.title ?? base?.title ?? action.title;
    const descriptionCopy =
      formatMessage(overrides?.description, context) ??
      formatMessage(base?.description, context) ??
      action.description;
    const ctaCopy = overrides?.cta ?? base?.cta ?? action.cta;

    if (action.type === 'copy') {
      const ibanOverrides = overrides as
        | { successMessage?: string }
        | undefined;
      const ibanBase = base as { successMessage?: string } | undefined;
      return {
        ...action,
        title: titleCopy,
        description: descriptionCopy,
        cta: ctaCopy,
        successMessage:
          formatMessage(ibanOverrides?.successMessage, context) ??
          formatMessage(ibanBase?.successMessage, context) ??
          action.successMessage,
      };
    }

    return {
      ...action,
      title: titleCopy,
      description: descriptionCopy,
      cta: ctaCopy,
    };
  });

  const teamSectionTitle =
    supportCopy.teamSectionTitle ?? defaultSupport.teamSectionTitle ?? '';
  const actionsSectionTitle =
    supportCopy.actionsSectionTitle ?? defaultSupport.actionsSectionTitle ?? '';

  return (
    <>
      <PageLayout>
        <Page>
          <BackgroundBlob />
          <ContentWrapper>
            <Header>
              <PageTitle size="xl" gradient>
                {resolvedTitle}
              </PageTitle>
              <Tagline>{resolvedTagline}</Tagline>
              <HeaderDescription>{resolvedDescription}</HeaderDescription>
            </Header>

            <section aria-labelledby="support-team-heading">
              <SectionTitle id="support-team-heading">
                {teamSectionTitle}
              </SectionTitle>
              <TeamGrid>
                {localizedTeamMembers.map((member, index) => (
                  <AnimatedGlassCard
                    key={member.key}
                    $delay={`${index * 0.1 + 0.2}s`}
                  >
                    <TeamCardInner $hasLinkedin={!!member.linkedin}>
                      <TeamHeader>
                        <TeamIcon aria-hidden="true">{member.icon}</TeamIcon>
                        {member.linkedin && (
                          <LinkedInButton
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            as="a"
                            aria-label={`LinkedIn for ${member.name}`}
                          >
                            <span>in</span>
                          </LinkedInButton>
                        )}
                      </TeamHeader>
                      <div>
                        <TeamName>{member.name}</TeamName>
                        <TeamRole>{member.role}</TeamRole>
                      </div>
                      <TeamBio>{member.bio}</TeamBio>
                    </TeamCardInner>
                  </AnimatedGlassCard>
                ))}
              </TeamGrid>
            </section>

            <section aria-labelledby="support-actions-heading">
              <SectionTitle id="support-actions-heading">
                {actionsSectionTitle}
              </SectionTitle>
              <ActionList>
                {localizedActions.map((action, index) => (
                  <AnimatedGlassCard
                    key={action.key}
                    $delay={`${index * 0.1 + 0.5}s`}
                  >
                    <ActionHeader>
                      <TeamIcon aria-hidden="true">{action.icon}</TeamIcon>
                      <ActionTitle>{action.title}</ActionTitle>
                    </ActionHeader>
                    <ActionDescription>{action.description}</ActionDescription>
                    <CtaRow>
                      {action.type === 'route' ? (
                        <CtaLink href={action.href}>
                          <span>{action.cta}</span>
                          <CtaIcon aria-hidden="true">→</CtaIcon>
                        </CtaLink>
                      ) : action.type === 'external' ? (
                        <ExternalCta
                          href={action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>{action.cta}</span>
                          <CtaIcon aria-hidden="true">↗</CtaIcon>
                        </ExternalCta>
                      ) : (
                        <CopyActionWrapper
                          value={action.value}
                          label={action.cta}
                          successMessage={action.successMessage}
                        />
                      )}
                    </CtaRow>
                  </AnimatedGlassCard>
                ))}
              </ActionList>
            </section>

            <Thanks>{resolvedThanks}</Thanks>
          </ContentWrapper>
        </Page>
      </PageLayout>
      <HomeFooter />
    </>
  );
}

export default SupportPage;
