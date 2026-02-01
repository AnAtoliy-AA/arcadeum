'use client';

import styled from 'styled-components';
import { LinkButton } from '@/shared/ui';
import { fadeInUp } from './Animations.styles';
import { SectionContainer } from './Common.styles';

export const DownloadCtaSection = styled(SectionContainer)`
  display: flex;
  justify-content: center;
`;

export const DownloadCtaCard = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${({ theme }) => theme.surfaces.hero.background};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.buttons.primary.gradientStart} 50%,
      transparent 100%
    );
  }

  @media (max-width: 640px) {
    padding: 2rem 1.5rem;
  }
`;

export const DownloadTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const DownloadDescription = styled.p`
  margin: 0;
  max-width: 500px;
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const DownloadButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const DownloadButton = styled(LinkButton).attrs({
  variant: 'secondary',
  external: true,
})`
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

export const DownloadIcon = styled.span`
  font-size: 1.25rem;
`;
