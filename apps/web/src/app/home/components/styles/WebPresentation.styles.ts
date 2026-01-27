'use client';

import styled, { css } from 'styled-components';
import { Button } from '@/shared/ui';
import { fadeIn } from './Animations.styles';

export const PresentationContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  group: 'presentation-container';

  &:fullscreen {
    border-radius: 0;
    border: none;
    width: 100vw;
    height: 100vh;
  }
`;

export const SlideContent = styled.div<{ $isActive: boolean }>`
  flex: 1;
  display: ${({ $isActive }) => ($isActive ? 'block' : 'none')};
  width: 100%;
  height: 100%;
  padding: 0;
  animation: ${fadeIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1); // Smooth cubic-bezier
  position: relative;

  // Slight scale effect for premium feel
  & > img {
    animation: ${({ $isActive }) =>
      $isActive ? css`scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)` : 'none'};
  }

  @keyframes scaleIn {
    from {
      transform: scale(1.02);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

// --- New Modern Controls ---

export const ControlsOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none; // Let clicks pass through to drag areas
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
`;

export const TopBar = styled.div`
  padding: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6) 0%,
    transparent 100%
  );
  pointer-events: auto;
`;

export const ProgressBar = styled.div`
  display: flex;
  gap: 4px;
  width: 100%;
  max-width: 600px;
  height: 4px;
  align-items: center;
`;

export const ProgressSegment = styled.div<{
  $isActive: boolean;
  $isViewed: boolean;
}>`
  flex: 1;
  height: 100%;
  border-radius: 2px;
  background: ${({ theme, $isActive, $isViewed }) =>
    $isActive
      ? theme.text.accent
      : $isViewed
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 8px rgba(255, 255, 255, 0.4)' : 'none'};

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
`;

export const BottomBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  pointer-events: auto;
`;

export const SlideCounter = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-feature-settings: 'tnum'; // Tabular numbers prevent jumping
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

export const NavButton = styled(Button).attrs({
  variant: 'glass',
  size: 'md',
})<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $position }) => $position}: 1rem;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  padding: 0;
  min-width: auto;
  border-radius: 50%;
  opacity: 0;
  pointer-events: auto;

  ${PresentationContainer}:hover & {
    opacity: 1;
  }

  &:hover:not(:disabled) {
    transform: translateY(-50%) scale(1.1);
  }
`;

export const FullscreenButton = styled(Button).attrs({
  variant: 'glass',
  size: 'sm',
})`
  width: 32px;
  height: 32px;
  padding: 0;
  min-width: auto;
`;
