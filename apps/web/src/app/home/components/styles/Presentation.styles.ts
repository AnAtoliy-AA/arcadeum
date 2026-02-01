'use client';
import styled from 'styled-components';

import { SectionContainer } from './Common.styles';

export const PresentationSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

export const VideoContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};

  &::before {
    content: '';
    display: block;
    padding-bottom: 56.25%; // 16:9 aspect ratio
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;
