import styled, { css } from 'styled-components';

// Card Components
export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
    gap: 0.75rem;
  }
`;

export const Card = styled.div<{ $cardType?: string; $index?: number }>`
  aspect-ratio: 2/3;
  border-radius: 16px;
  background: ${({ $cardType }) => {
    if ($cardType === 'critical_event')
      return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    if ($cardType === 'neutralizer')
      return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if ($cardType === 'strike')
      return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    if ($cardType === 'evade')
      return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    if ($cardType === 'trade')
      return 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
    if ($cardType === 'reorder')
      return 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)';
    if ($cardType === 'insight')
      return 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)';
    return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
  }};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: ${({ $index }) =>
    `cardSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${($index || 0) * 0.08}s both`};

  @keyframes cardSlideIn {
    from {
      opacity: 0;
      transform: translateY(40px) rotateZ(-8deg) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateZ(0deg) scale(1);
    }
  }

  &:hover {
    transform: translateY(-12px) rotateZ(3deg) scale(1.08);
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.15);
    z-index: 10;
  }

  &:active {
    transform: translateY(-4px) scale(1.02);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.5) 0%,
        transparent 50%
      ),
      linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    pointer-events: none;
    border-radius: 16px;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    );
    pointer-events: none;
  }
`;

export const CardInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.35rem;
`;

export const CardFrame = styled.div`
  position: absolute;
  inset: 4px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 2;

  &::before,
  &::after {
    content: '◆';
    position: absolute;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.6rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &::before {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    inset: 3px;
    border-width: 1.5px;
    &::before,
    &::after {
      font-size: 0.5rem;
    }
  }
`;

export const CardCorner = styled.div<{ $position: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
  z-index: 2;

  ${({ $position }) => {
    switch ($position) {
      case 'tl':
        return `top: 6px; left: 6px; border-right: none; border-bottom: none; border-top-left-radius: 4px;`;
      case 'tr':
        return `top: 6px; right: 6px; border-left: none; border-bottom: none; border-top-right-radius: 4px;`;
      case 'bl':
        return `bottom: 6px; left: 6px; border-right: none; border-top: none; border-bottom-left-radius: 4px;`;
      case 'br':
        return `bottom: 6px; right: 6px; border-left: none; border-top: none; border-bottom-right-radius: 4px;`;
    }
  }}

  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
    border-width: 1.5px;
    ${({ $position }) => {
      switch ($position) {
        case 'tl':
          return `top: 4px; left: 4px;`;
        case 'tr':
          return `top: 4px; right: 4px;`;
        case 'bl':
          return `bottom: 4px; left: 4px;`;
        case 'br':
          return `bottom: 4px; right: 4px;`;
      }
    }}
  }
`;

export const CardEmoji = styled.div`
  font-size: 2.5rem;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5));
  transform: scale(1);
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const CardName = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.3px;
    min-height: 1.4rem;
  }
`;

export const CardDescription = styled.div`
  font-size: 0.5rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  line-height: 1.15;
  opacity: 0.85;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.9);
  margin-top: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding: 0 0.15rem;
  min-height: 1.15rem;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    -webkit-line-clamp: 2;
    min-height: 1rem;
  }
`;

export const CardCountBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 900;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    top: 0.35rem;
    right: 0.35rem;
  }
`;

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
