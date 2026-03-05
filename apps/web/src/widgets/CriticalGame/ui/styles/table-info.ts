import styled from 'styled-components';
import { getVariantStyles } from './variants';

export const TableInfo = styled.div<{ $variant?: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 16px;
  background: ${({ $variant }) =>
    getVariantStyles($variant).tableInfo.getBackground()};
  backdrop-filter: blur(12px);
  border: ${({ $variant }) => getVariantStyles($variant).tableInfo.getBorder()};
  background-clip: padding-box;
  z-index: 5;
  box-shadow: ${({ $variant }) =>
    getVariantStyles($variant).tableInfo.getShadow()};
  overflow: hidden;

  /* VARIANT STYLES */
  ${({ $variant }) => getVariantStyles($variant).tableInfo.getStyles?.()}

  @keyframes deepPulse {
    0%,
    100% {
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.4),
        0 0 10px rgba(8, 51, 68, 0.5);
      border-color: rgba(34, 211, 238, 0.3);
    }
    50% {
      box-shadow:
        0 4px 25px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(34, 211, 238, 0.15);
      border-color: rgba(103, 232, 249, 0.5);
    }
  }

  @keyframes waterFlow {
    0% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.4rem;
    padding: 0.75rem;
    border-radius: 12px;
  }
`;

export const TableStat = styled.div<{ $variant?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  transition: all 0.25s ease;
  color: #fff;
  z-index: 2; /* Ensure stats interact above effects */

  ${({ $variant }) =>
    getVariantStyles($variant).tableInfo.getTableStatStyles?.()}

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.25),
      rgba(168, 85, 247, 0.15)
    );
    transform: translateX(-2px);
  }

  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.3),
      rgba(168, 85, 247, 0.2)
    );
    font-size: 0.9rem;
  }

  > div:last-child {
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    > div:first-child {
      width: 24px;
      height: 24px;
      font-size: 0.8rem;
    }
    > div:last-child {
      font-size: 0.8rem;
    }
  }
`;

export const StatIcon = styled.div`
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StatValue = styled.div<{
  $isWarning?: boolean;
  $variant?: string;
}>`
  font-size: 0.9rem;
  color: ${({ $isWarning, $variant }) =>
    getVariantStyles($variant).tableInfo.getStatValueColor($isWarning)};
`;

export const InfoCard = styled.div<{ $variant?: string }>`
  padding: 1.5rem;
  border-radius: 20px;
  background: ${({ $variant, theme }) =>
    getVariantStyles($variant).tableInfo.getInfoCardBackground(theme)};
  backdrop-filter: blur(20px);
  border: 2px solid
    ${({ $variant, theme }) =>
      getVariantStyles($variant).tableInfo.getInfoCardBorder(theme)};
  box-shadow: ${({ $variant }) =>
    getVariantStyles($variant).tableInfo.getInfoCardShadow()};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $variant }) =>
      getVariantStyles($variant).tableInfo.getInfoCardPattern()};
    pointer-events: none;
  }

  /* VARIANT STYLES */
  ${({ $variant }) =>
    getVariantStyles($variant).tableInfo.getInfoCardStyles?.()}

  @keyframes bubbleRise {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    20% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-30px) translateX(5px);
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }

  @media (max-height: 600px) {
    padding: 1rem;
  }

  @media (max-height: 500px) {
    padding: 0.75rem;
  }
`;

export * from './table-decorations';
