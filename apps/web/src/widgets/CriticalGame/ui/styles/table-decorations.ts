import styled, { css, keyframes } from 'styled-components';

// --- SHARED KEYFRAMES ---

export const sonarSweep = keyframes`
  0% { transform: rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: rotate(360deg); opacity: 0; }
`;

export const floatBubble = keyframes`
  0% { transform: translateY(20px) scale(0.5); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.6; }
  100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
`;

export const swimFish = keyframes`
  0% { transform: translateX(-20px) translateY(0); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateX(120px) translateY(-10px); opacity: 0; }
`;

export const sonarSectorRotate = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

export const dotFloat = keyframes`
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(20px, -30px); opacity: 1; }
`;

export const fallingSnow = keyframes`
  0% {
    transform: translateY(-10vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(110vh) translateX(40px) rotate(360deg);
    opacity: 0;
  }
`;

// --- DECORATIVE COMPONENTS ---

export const SonarRadar = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(34, 211, 238, 0.1) 60deg,
    transparent 80deg
  );
  border-radius: 50%;
  animation: ${sonarSweep} 8s linear infinite;
  pointer-events: none;
  z-index: 1;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Bubble = styled.div<{ $delay: number; $left: number }>`
  position: absolute;
  bottom: 0;
  left: ${({ $left }) => $left}%;
  width: 6px;
  height: 6px;
  background: rgba(165, 243, 252, 0.4);
  border-radius: 50%;
  filter: blur(1px);
  animation: ${floatBubble} 4s ease-in infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  pointer-events: none;
  z-index: 0;
`;

export const FishSilhouette = styled.div<{ $delay: number; $top: number }>`
  position: absolute;
  top: ${({ $top }) => $top}%;
  left: 0;
  width: 12px;
  height: 6px;
  background: rgba(34, 211, 238, 0.3);
  clip-path: polygon(0 50%, 30% 0, 100% 50%, 30% 100%);
  animation: ${swimFish} 10s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  pointer-events: none;
  z-index: 0;
`;

export const SonarSweep = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150vmax;
  height: 150vmax;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  overflow: hidden;

  /* Rotating Sector Trail */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    transform-origin: center center;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg at 50% 50%,
      rgba(34, 211, 238, 0.4) 0deg,
      /* Top leading edge color */ rgba(34, 211, 238, 0.1) 45deg,
      /* Fading trail */ transparent 90deg,
      /* End of sector */ transparent 360deg
    );
    animation: ${sonarSectorRotate} 6s linear infinite;
  }

  /* Sharp leading edge line with glow */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    transform-origin: center center;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg at 50% 50%,
      rgba(103, 232, 249, 1) 0deg,
      /* Bright sharp line */ rgba(34, 211, 238, 0.4) 1deg,
      /* Subtle inner glow */ transparent 2deg,
      transparent 360deg
    );
    filter: blur(1px);
    animation: ${sonarSectorRotate} 6s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
    }
  }
`;

export const FloatingDots = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  /* Dot 1 - Cyan */
  &::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 20%;
    width: 4px;
    height: 4px;
    background: #22d3ee;
    border-radius: 50%;
    box-shadow: 0 0 10px #22d3ee;
    animation: ${dotFloat} 6s ease-in-out infinite;
  }

  /* Dot 2 - Pink */
  &::after {
    content: '';
    position: absolute;
    bottom: 25%;
    right: 15%;
    width: 4px;
    height: 4px;
    background: #ec4899;
    border-radius: 50%;
    box-shadow: 0 0 10px #ec4899;
    animation: ${dotFloat} 6s ease-in-out infinite 2s;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
    }
  }
`;

export const CircuitLines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 150px;
  }

  /* Top Left Corner Circuits */
  &::before {
    top: 20px;
    left: 20px;
    background:
      linear-gradient(90deg, #164e63 1px, transparent 1px) 0 0 / 20px 100%,
      linear-gradient(0deg, #164e63 1px, transparent 1px) 0 0 / 100% 20px;
    mask-image: radial-gradient(circle at top left, black, transparent 70%);
  }

  /* Bottom Right Corner Circuits */
  &::after {
    bottom: 20px;
    right: 20px;
    background:
      linear-gradient(90deg, #164e63 1px, transparent 1px) 0 0 / 20px 100%,
      linear-gradient(0deg, #164e63 1px, transparent 1px) 0 0 / 100% 20px;
    mask-image: radial-gradient(circle at bottom right, black, transparent 70%);
  }
`;

export const Snowflake = styled.div<{
  $delay: number;
  $left: number;
  $size: number;
  $duration: number;
}>`
  position: absolute;
  top: -10vh;
  left: ${({ $left }) => $left}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: white;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
  animation: ${fallingSnow} ${({ $duration }) => $duration}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;

  &::before {
    content: '*';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${({ $size }) => $size * 1.5}px;
    color: rgba(255, 255, 255, 0.4);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const IceCrystal = styled.div<{ $corner: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 5;
  opacity: 0.5;

  ${({ $corner }) => {
    switch ($corner) {
      case 'tl':
        return css`
          top: 10px;
          left: 10px;
          transform: rotate(0deg);
        `;
      case 'tr':
        return css`
          top: 10px;
          right: 10px;
          transform: rotate(90deg);
        `;
      case 'bl':
        return css`
          bottom: 10px;
          left: 10px;
          transform: rotate(-90deg);
        `;
      case 'br':
        return css`
          bottom: 10px;
          right: 10px;
          transform: rotate(180deg);
        `;
    }
  }}

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: linear-gradient(to bottom, #f8fafc, #7dd3fc);
    border-radius: 2px;
  }

  /* Main Spike */
  &::before {
    width: 2px;
    height: 100%;
    left: 0;
    top: 0;
  }

  /* Cross Spikes */
  &::after {
    width: 100%;
    height: 2px;
    left: 0;
    top: 0;
  }
`;
