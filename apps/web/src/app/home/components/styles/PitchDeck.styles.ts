'use client';
import styled from 'styled-components';
import { SectionContainer } from './Common.styles';

export const PitchDeckSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5rem;
  padding-top: 6rem;
  padding-bottom: 6rem;
`;

export const DeckAction = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
    ${({ theme }) => theme.buttons.primary.gradientEnd} 100%
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    filter: brightness(1.1);
  }

  svg {
    margin-left: 0.75rem;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;
