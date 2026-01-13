import styled from 'styled-components';

// Table Components
export const GameTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2.5rem;
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 420px;
  grid-area: table;
  // Previously overflow: hidden; Removed to allow bubbles to overflow

  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
    min-height: 360px;
  }
`;

export const TableBackground = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  overflow: hidden;
  z-index: 0;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);

  /* Subtle corner accents */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(
      circle at top left,
      rgba(99, 102, 241, 0.15),
      transparent 70%
    );
    border-radius: 20px 0 0 0;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(
      circle at bottom right,
      rgba(168, 85, 247, 0.12),
      transparent 70%
    );
    border-radius: 0 0 20px 0;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    border-radius: 14px;
    &::before,
    &::after {
      width: 100px;
      height: 100px;
    }
  }
`;

export const PlayersRing = styled.div<{ $playerCount: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 280px;
  }
`;

export const PlayerPositionWrapper = styled.div<{
  $position: number;
  $total: number;
}>`
  position: absolute;
  z-index: 5;
  ${({ $position, $total }) => {
    const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
    // Smaller radius to keep players inside the container
    const radiusX = 38;
    const radiusY = 36;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return `left: ${x}%; top: ${y}%; transform: translate(-50%, -50%);`;
  }}

  @media (max-width: 768px) {
    ${({ $position, $total }) => {
      const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
      const radiusX = 36;
      const radiusY = 34;
      const x = 50 + radiusX * Math.cos(angle);
      const y = 50 + radiusY * Math.sin(angle);
      return `left: ${x}%; top: ${y}%;`;
    }}
  }
`;

export const CenterTable = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 50%;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 2px solid rgba(99, 102, 241, 0.3);
  width: 180px;
  height: 180px;
  position: relative;
  z-index: 1;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.05),
    inset 0 -2px 8px rgba(0, 0, 0, 0.3);

  /* Rotating glow border */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(99, 102, 241, 0.6) 0deg,
      rgba(168, 85, 247, 0.5) 60deg,
      rgba(236, 72, 153, 0.4) 120deg,
      rgba(99, 102, 241, 0.3) 180deg,
      rgba(16, 185, 129, 0.4) 240deg,
      rgba(59, 130, 246, 0.5) 300deg,
      rgba(99, 102, 241, 0.6) 360deg
    );
    animation: rotate 20s linear infinite;
    z-index: -1;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    width: 130px;
    height: 130px;
    padding: 0.75rem;
    border-width: 2px;
    gap: 0.5rem;
  }
`;

export const InfoCard = styled.div`
  padding: 1.5rem;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.surfaces.panel.background}ee,
    ${({ theme }) => theme.surfaces.card.background}dd
  );
  backdrop-filter: blur(20px);
  border: 2px solid ${({ theme }) => theme.surfaces.panel.border};
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 20px
    );
    pointer-events: none;
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

export const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      transparent
    );
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const ActionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
  padding-bottom: 0.5rem;

  ${InfoTitle} {
    margin: 0;
    padding: 0;
    border: none;

    &::after {
      display: none;
    }
  }
`;

export const ActionsToggleButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s,
    transform 0.2s;

  &:hover {
    color: ${({ theme }) => theme.buttons.primary?.gradientStart || '#ffffff'};
    transform: scale(1.1);
  }
`;

export const TableInfo = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid transparent;
  background-clip: padding-box;
  z-index: 5;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;

  /* Animated gradient border */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.6),
      rgba(168, 85, 247, 0.4),
      rgba(236, 72, 153, 0.3),
      rgba(99, 102, 241, 0.6)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: shimmer 3s ease-in-out infinite;
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

export const TableStat = styled.div`
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
