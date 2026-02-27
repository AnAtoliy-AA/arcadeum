import styled, { keyframes } from 'styled-components';
import { Spinner } from '../Spinner';

export interface ConnectionOverlayProps {
  visible: boolean;
  reconnecting?: boolean;
  onReconnect?: () => void;
  title?: string;
  message?: string;
  reconnectingText?: string;
  testId?: string;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
`;

const Backdrop = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 100;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.35s ease-out;
  cursor: pointer;
  user-select: none;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.surfaces.card.background}90;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}60;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  animation: ${pulse} 2.5s ease-in-out infinite;
`;

const WifiSvg = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const Title = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
  max-width: 280px;
  line-height: 1.4;
`;

export function ConnectionOverlay({
  visible,
  reconnecting = false,
  onReconnect,
  title = 'Connection Lost',
  message = 'Tap anywhere or move your mouse to reconnect',
  reconnectingText = 'Reconnecting...',
  testId = 'connection-overlay',
}: ConnectionOverlayProps) {
  return (
    <Backdrop
      $visible={visible}
      onClick={onReconnect}
      role="button"
      aria-label={reconnecting ? reconnectingText : title}
      data-testid={testId}
    >
      {reconnecting ? (
        <Spinner size="lg" />
      ) : (
        <IconWrapper>
          <WifiSvg />
        </IconWrapper>
      )}
      <Title>{reconnecting ? reconnectingText : title}</Title>
      {!reconnecting && <Message>{message}</Message>}
    </Backdrop>
  );
}
