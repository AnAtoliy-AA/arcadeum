'use client';

import styled from 'styled-components';
import { fadeInUp } from './Animations.styles';
import { SectionContainer } from './Common.styles';

export const FeaturesSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background: ${({ theme }) => theme.surfaces.card.background}20;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const FeatureCard = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background}80;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.5s ease-out both;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      800px circle at var(--mouse-x, 0) var(--mouse-y, 0),
      rgba(255, 255, 255, 0.06),
      transparent 40%
    );
    opacity: 0;
    transition: opacity 0.5s;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart}50;
    background: ${({ theme }) => theme.surfaces.card.background}95;

    &::before {
      opacity: 1;
    }
  }

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
`;

export const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart}15,
    ${({ theme }) => theme.buttons.primary.gradientEnd}15
  );
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart}30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  ${FeatureCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}25,
      ${({ theme }) => theme.buttons.primary.gradientEnd}25
    );
  }
`;

export const FeatureTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const FeatureDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const ComingSoonBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.primary.gradientStart}15;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart}40;
  border-radius: 999px;
  margin-top: 0.5rem;
`;
