'use client';

import styled from 'styled-components';
import { fadeIn } from './Animations.styles';

export const PageWrapper = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(
      circle at top left,
      ${({ theme }) => theme.background.radialStart},
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      ${({ theme }) => theme.background.radialEnd},
      transparent 55%
    ),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
  overflow-x: hidden;
`;

export const SectionContainer = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.5rem;

  @media (max-width: 640px) {
    padding: 3rem 1.25rem;
  }
`;

export const SectionHeader = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text.muted};
  max-width: 600px;
  margin: 0 auto;
`;
