'use client';
import styled, { keyframes } from 'styled-components';

import { SectionContainer } from './Common.styles';

export const PresentationSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1.4); opacity: 0; }
`;

export const VideoContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: #000;

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

export const VideoPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
`;

export const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition:
    opacity 0.5s ease,
    transform 1.2s cubic-bezier(0.2, 0, 0, 1);

  ${VideoPlaceholder}:hover & {
    opacity: 0.65;
    transform: scale(1.08);
  }
`;

export const PlaceholderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }
`;

export const PlayButton = styled.button`
  position: absolute;
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  z-index: 2;

  svg {
    width: 38px;
    height: 38px;
    fill: white;
    margin-left: 6px;
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2.5px solid rgba(255, 255, 255, 0.5);
    animation: ${pulse} 3s infinite;
  }

  &:hover {
    transform: scale(1.15);
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      ${({ theme }) => theme.buttons.primary.gradientEnd}
    );
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow:
      0 12px 48px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(87, 195, 255, 0.3);

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;
