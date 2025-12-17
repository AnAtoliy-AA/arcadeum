import styled from "styled-components";

// Table Components
export const GameTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border-radius: 32px;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px),
    radial-gradient(ellipse at center,
      ${({ theme }) => theme.surfaces.panel.background}ee,
      ${({ theme }) => theme.background.base}dd
    );
  backdrop-filter: blur(20px);
  border: 3px solid ${({ theme }) => theme.surfaces.panel.border};
  position: relative;
  width: 100%;
  flex: 1;
  min-height: clamp(500px, 65vh, 900px);
  grid-area: table;
  overflow: visible;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 0 100px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0, 0, 0, 0.02) 1px, rgba(0, 0, 0, 0.02) 2px);
    border-radius: 32px;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 32px;
    padding: 2px;
    background: linear-gradient(135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}40,
      transparent 30%,
      transparent 70%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}40
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.6;
    animation: borderGlow 3s ease-in-out infinite;
  }

  @keyframes borderGlow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-height: 420px;
    border-radius: 24px;
    border-width: 2px;
    &::after { border-radius: 24px; }
  }
`;

export const PlayersRing = styled.div<{ $playerCount: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) { min-height: 400px; }
`;

export const PlayerPositionWrapper = styled.div<{ $position: number; $total: number }>`
  position: absolute;
  ${({ $position, $total }) => {
    const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
    const radiusX = 45;
    const radiusY = 42;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return `left: ${x}%; top: ${y}%; transform: translate(-50%, -50%);`;
  }}

  @media (max-width: 768px) {
    ${({ $position, $total }) => {
      const angle = ($position / $total) * 2 * Math.PI - Math.PI / 2;
      const radiusX = 44;
      const radiusY = 40;
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
  gap: 1.5rem;
  padding: 2.5rem;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(0, 0, 0, 0.02) 2px, rgba(0, 0, 0, 0.02) 4px),
    radial-gradient(circle at 30% 30%,
      ${({ theme }) => theme.surfaces.card.background}ff,
      ${({ theme }) => theme.surfaces.card.background}ee 50%,
      ${({ theme }) => theme.background.base}dd
    );
  backdrop-filter: blur(30px);
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  width: 280px;
  height: 280px;
  position: relative;
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.4),
    inset 0 0 80px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);

  &::before {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(from 0deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}60,
      transparent 90deg,
      transparent 270deg,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}60 360deg
    );
    animation: rotate 10s linear infinite;
    z-index: -1;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    width: 180px;
    height: 180px;
    padding: 1rem;
    border-width: 3px;
    &::before { inset: -3px; }
  }
`;

export const InfoCard = styled.div`
  padding: 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg,
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
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
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
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.buttons.primary.gradientStart}, transparent);
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const TableInfo = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  width: 90%;
  justify-content: space-around;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    gap: 0.4rem;
    bottom: 0.4rem;
  }
`;

export const TableStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    gap: 0.15rem;
    > div:first-child { font-size: 0.9rem !important; }
    > div:last-child { font-size: 0.75rem !important; }
  }
`;
