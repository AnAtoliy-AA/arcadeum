import styled, { keyframes } from 'styled-components';
import { GlassCard } from '@/shared/ui/GlassCard';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const PopupContainer = styled(GlassCard)<{
  $visible: boolean;
  $position: 'top' | 'bottom' | 'left' | 'right';
}>`
  position: absolute;
  z-index: 100;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  pointer-events: auto;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${(props) => (props.$visible ? fadeIn : 'none')} 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);

  ${(props) => {
    switch (props.$position) {
      case 'top':
        return 'bottom: calc(100% + 50px); left: 50%; transform: translateX(-50%);';
      case 'bottom':
        return 'top: calc(100% + 50px); left: 50%; transform: translateX(-50%);';
      case 'left':
        return 'right: calc(100% + 50px); top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'left: calc(100% + 50px); top: 50%; transform: translateY(-50%);';
    }
  }}
`;

export const ChallengeButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SeaBattleIcon = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
`;

export const PopupTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  opacity: 0.9;
`;
