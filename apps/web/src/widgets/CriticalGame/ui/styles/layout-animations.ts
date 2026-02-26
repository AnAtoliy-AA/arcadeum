import { keyframes } from 'styled-components';

export const icyShimmer = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
  20% { opacity: 0.5; }
  50% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
  100% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
`;

export const auroraWave = keyframes`
  0%, 100% { 
    transform: translateY(0) scaleY(1) skewX(5deg); 
    opacity: 0.3;
    filter: blur(40px) hue-rotate(0deg);
  }
  50% { 
    transform: translateY(-30px) scaleY(1.2) skewX(-5deg); 
    opacity: 0.6;
    filter: blur(50px) hue-rotate(20deg);
  }
`;

// Animation for the turn border glow
export const turnBorderPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.4),
      0 0 40px rgba(34, 197, 94, 0.2),
      inset 0 0 20px rgba(34, 197, 94, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(34, 197, 94, 0.6),
      0 0 60px rgba(34, 197, 94, 0.3),
      inset 0 0 30px rgba(34, 197, 94, 0.15);
  }
`;

// Cyberpunk-specific turn border pulse
export const cyberpunkTurnBorderPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 0 20px rgba(192, 38, 211, 0.5),
      0 0 40px rgba(6, 182, 212, 0.3),
      inset 0 0 20px rgba(192, 38, 211, 0.15);
  }
  50% {
    box-shadow:
      0 0 35px rgba(192, 38, 211, 0.7),
      0 0 70px rgba(6, 182, 212, 0.4),
      inset 0 0 35px rgba(192, 38, 211, 0.2);
  }
`;
