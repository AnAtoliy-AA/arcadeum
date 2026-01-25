'use client';

import styled from 'styled-components';
import { fadeInUp } from './Animations.styles';
import { SectionContainer } from './Common.styles';

export const HowItWorksSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

export const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;
  position: relative;

  @media (min-width: 1024px) {
    flex-direction: row;
    max-width: 1200px;
    gap: 3rem;
  }
`;

export const StepItem = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  animation: ${fadeInUp} 0.5s ease-out both;
  position: relative;
  flex: 1;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  /* Vertical line for mobile */
  &::after {
    content: '';
    position: absolute;
    left: 27px;
    top: 56px;
    bottom: -2rem;
    width: 2px;
    background: ${({ theme }) => theme.surfaces.card.border};
    z-index: 0;
  }

  &:last-child::after {
    display: none;
  }

  /* Desktop Styles */
  @media (min-width: 1024px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;

    /* Horizontal line for desktop */
    &::after {
      left: 50%;
      top: 28px;
      width: 100%;
      height: 2px;
      background: ${({ theme }) => theme.surfaces.card.border};
    }

    &:last-child::after {
      display: none;
    }
  }
`;

export const StepNumber = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart}40;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 15px ${({ theme }) => theme.buttons.primary.gradientStart}20;

  @media (max-width: 640px) {
    width: 48px;
    height: 48px;
    font-size: 1.1rem;
  }
`;

export const StepContent = styled.div`
  flex: 1;
  padding-top: 0.5rem;
`;

export const StepTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const StepDescription = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;
