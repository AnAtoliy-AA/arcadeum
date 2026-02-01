import Link from 'next/link';
import styled, { css, keyframes } from 'styled-components';
import { GlassCard } from '@/shared/ui/GlassCard';
import { CopyActionButton } from '@/features/support/copy-action/ui/CopyActionButton';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const BackgroundBlob = styled.div`
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 140vw;
  height: 800px;
  background: radial-gradient(
    circle at center,
    ${({ theme }) => theme.background.radialStart} 0%,
    transparent 70%
  );
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
  filter: blur(60px);
`;

export const ContentWrapper = styled.div`
  z-index: 1;
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vw, 4rem);
  animation: ${fadeIn} 0.8s ease-out forwards;
`;

export const AnimatedGlassCard = styled(GlassCard)<{ $delay?: string }>`
  animation: ${fadeIn} 0.8s ease-out forwards;
  opacity: 0;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  align-items: center;
  padding: 2rem 0;
`;

export const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.45rem);
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  max-width: 650px;
  line-height: 1.5;
  text-shadow: 0 0 40px ${({ theme }) => theme.background.radialStart};
`;

export const SectionTitle = styled.h2`
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 24px;
    border-radius: 4px;
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      ${({ theme }) => theme.buttons.primary.gradientEnd}
    );
  }
`;

export const HeaderDescription = styled.p`
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
  max-width: 700px;
`;

export const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
`;

export const TeamCardInner = styled.div<{ $hasLinkedin: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: ${({ $hasLinkedin }) => ($hasLinkedin ? '3.5rem' : '0')};
`;

export const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

export const TeamIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
`;

export const TeamName = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 0.25rem;
`;

export const TeamRole = styled.p`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.5rem;
`;

export const TeamBio = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const ActionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
`;

export const ActionHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ActionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const ActionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const CtaRow = styled.div`
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
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  transition: all 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

export const CtaLink = styled(Link)`
  ${ctaStyles}
`;

export const ExternalCta = styled.a`
  ${ctaStyles}
`;

export const LinkedInButton = styled(ExternalCta)`
  padding: 0.4rem;
  border-radius: 50%;
  min-width: auto;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  span {
    font-size: 1.2rem;
  }
`;

export const CopyActionWrapper = styled(CopyActionButton)`
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

export const CtaIcon = styled.span`
  font-size: 1rem;
`;

export const Thanks = styled.p`
  margin: 0;
  text-align: center;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

export const Page = styled.div`
  min-height: 100vh;
  padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 5vw, 2rem);
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;
