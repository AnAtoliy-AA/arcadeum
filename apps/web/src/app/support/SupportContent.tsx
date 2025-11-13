"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

import { CopyActionButton } from "./CopyActionButton";
import type { SupportAction, SupportTeamMember } from "./types";

export type SupportContentProps = {
  title: string;
  tagline: string;
  description: string;
  thanks: string;
  teamMembers: SupportTeamMember[];
  actions: SupportAction[];
};

const Page = styled.div`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.background.radialStart}, transparent 55%),
    radial-gradient(circle at bottom right, ${({ theme }) => theme.background.radialEnd}, transparent 55%),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
`;

const Wrapper = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.05rem, 3vw, 1.25rem);
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

const TeamCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1.5rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const TeamIcon = styled.span`
  font-size: 1.35rem;
`;

const TeamName = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const TeamRole = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.muted};
`;

const TeamBio = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const ActionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
`;

const ActionCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.secondary};
  box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
`;

const ActionHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const ActionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const CtaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ctaStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const CtaLink = styled(Link)`
  ${ctaStyles}
`;

const ExternalCta = styled.a`
  ${ctaStyles}
`;

const CopyActionWrapper = styled(CopyActionButton)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > button {
    ${ctaStyles}
    width: 100%;
    cursor: pointer;
  }

  & > span {
    display: block;
    margin-top: 0.35rem;
    min-height: 1.2rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.copyNotice};
    text-align: center;
  }
`;

const CtaIcon = styled.span`
  font-size: 1rem;
`;

const Thanks = styled.p`
  margin: 0;
  text-align: center;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

export default function SupportContent({
  title,
  tagline,
  description,
  thanks,
  teamMembers,
  actions,
}: SupportContentProps) {
  return (
    <Page>
      <Wrapper>
        <Header>
          <Title>{title}</Title>
          <Tagline>{tagline}</Tagline>
          <Description>{description}</Description>
        </Header>

        <Section aria-labelledby="support-team-heading">
          <SectionTitle id="support-team-heading">Meet the core team</SectionTitle>
          <TeamGrid>
            {teamMembers.map((member) => (
              <TeamCard key={member.key}>
                <TeamIcon aria-hidden="true">{member.icon}</TeamIcon>
                <div>
                  <TeamName>{member.name}</TeamName>
                  <TeamRole>{member.role}</TeamRole>
                </div>
                <TeamBio>{member.bio}</TeamBio>
              </TeamCard>
            ))}
          </TeamGrid>
        </Section>

        <Section aria-labelledby="support-actions-heading">
          <SectionTitle id="support-actions-heading">Ways to contribute</SectionTitle>
          <ActionList>
            {actions.map((action) => (
              <ActionCard key={action.key}>
                <ActionHeader>
                  <TeamIcon aria-hidden="true">{action.icon}</TeamIcon>
                  <ActionTitle>{action.title}</ActionTitle>
                </ActionHeader>
                <ActionDescription>{action.description}</ActionDescription>
                <CtaRow>
                  {action.type === "route" ? (
                    <CtaLink href={action.href}>
                      <span>{action.cta}</span>
                      <CtaIcon aria-hidden="true">→</CtaIcon>
                    </CtaLink>
                  ) : action.type === "external" ? (
                    <ExternalCta href={action.href} target="_blank" rel="noopener noreferrer">
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
              </ActionCard>
            ))}
          </ActionList>
        </Section>

        <Thanks>{thanks}</Thanks>
      </Wrapper>
    </Page>
  );
}
