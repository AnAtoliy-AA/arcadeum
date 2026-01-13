import styled, { css } from 'styled-components';
import { Card, CardEmoji } from './cards-base';

export * from './cards-base';

export const LastPlayedCard = styled(Card)<{ $isAnimating?: boolean }>`
  position: absolute;
  width: 75px;
  max-width: 75px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%)
    ${({ $isAnimating }) =>
      $isAnimating ? 'rotateY(180deg) scale(1.1)' : 'rotateY(0deg)'};
  z-index: 10;
  animation: ${({ $isAnimating }) =>
    $isAnimating
      ? 'cardFlip 0.6s ease-out'
      : 'cardFloat 3s ease-in-out infinite'};
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  cursor: default;

  @keyframes cardFlip {
    0% {
      transform: translate(-50%, -50%) rotateY(0deg) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) rotateY(90deg) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) rotateY(180deg) scale(1);
    }
  }

  @keyframes cardFloat {
    0%,
    100% {
      transform: translate(-50%, -50%) translateY(0px);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-8px);
    }
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  @media (max-width: 768px) {
    width: 55px;
    max-width: 55px;
    padding: 0.4rem 0.3rem;
    gap: 0.3rem;

    ${CardEmoji} {
      font-size: 1.25rem;
    }
    > div {
      font-size: 0.5rem;
    }
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
}>`
  padding: 1rem 1.75rem;
  border-radius: 16px;
  border: none;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.75px;

  ${({ variant, theme }) => {
    if (variant === 'danger') {
      return css`
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: white;
        box-shadow:
          0 6px 20px rgba(220, 38, 38, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      `;
    }
    if (variant === 'secondary') {
      return css`
        background: linear-gradient(
          135deg,
          ${theme.buttons.secondary.background},
          ${theme.buttons.secondary.background}dd
        );
        color: ${theme.buttons.secondary.text};
        border: 2px solid ${theme.buttons.secondary.border};
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      `;
    }
    return css`
      background: linear-gradient(
        135deg,
        ${theme.buttons.primary.gradientStart},
        ${theme.buttons.primary.gradientEnd ||
        theme.buttons.primary.gradientStart}
      );
      color: ${theme.buttons.primary.text};
      box-shadow:
        0 6px 20px rgba(59, 130, 246, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    `;
  }}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    &::before {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(60%);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.825rem;
    border-radius: 14px;
  }
`;
