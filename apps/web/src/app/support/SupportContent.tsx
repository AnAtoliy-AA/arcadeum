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
    radial-gradient(circle at top left, rgba(87, 195, 255, 0.35), transparent 55%),
    radial-gradient(circle at bottom right, rgba(255, 106, 247, 0.35), transparent 55%),
    #06011b;
  color: #f5f7ff;
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
  background: rgba(6, 1, 27, 0.58);
  border-radius: 24px;
  border: 1px solid rgba(245, 247, 255, 0.08);
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: 0 32px 80px rgba(5, 0, 40, 0.35);
  backdrop-filter: blur(18px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  font-weight: 700;
  color: #f7f8ff;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.05rem, 3vw, 1.25rem);
  font-weight: 500;
  color: rgba(223, 230, 255, 0.9);
`;

const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(223, 230, 255, 0.78);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(9, 4, 38, 0.68);
  border-radius: 24px;
  border: 1px solid rgba(245, 247, 255, 0.08);
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: 0 22px 60px rgba(5, 0, 40, 0.32);
  backdrop-filter: blur(14px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #f7f8ff;
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
  background: rgba(14, 10, 48, 0.9);
  border-radius: 18px;
  border: 1px solid rgba(111, 127, 255, 0.25);
  padding: 1.5rem;
  color: rgba(223, 230, 255, 0.9);
`;

const TeamIcon = styled.span`
  font-size: 1.35rem;
`;

const TeamName = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #f7f8ff;
`;

const TeamRole = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(189, 201, 255, 0.8);
`;

const TeamBio = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(223, 230, 255, 0.75);
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
  border: 1px solid rgba(111, 127, 255, 0.25);
  background: rgba(14, 10, 48, 0.9);
  color: rgba(223, 230, 255, 0.85);
  box-shadow: 0 16px 40px rgba(5, 0, 40, 0.28);
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
  color: #f7f8ff;
`;

const ActionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(223, 230, 255, 0.75);
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
  border: 1px solid rgba(135, 152, 255, 0.45);
  background: rgba(15, 11, 46, 0.65);
  color: #9fb3ff;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(163, 176, 255, 0.65);
      background: rgba(24, 19, 70, 0.72);
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
    color: #81f1ff;
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
  color: rgba(223, 230, 255, 0.82);
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
