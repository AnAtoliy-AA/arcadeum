import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
`;

export const PopupOverlay = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 200;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;

  @media (max-width: 768px) {
    position: fixed;
    top: 130px;
    right: 0.75rem;
    left: 0.75rem;
    align-items: center;
  }
`;

export const PopupCard = styled.div<{ $visible: boolean }>`
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  min-width: 240px;
  max-width: 360px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(99, 102, 241, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  animation: ${({ $visible }) => ($visible ? slideIn : slideOut)} 0.4s
    cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px) scale(1.01);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(99, 102, 241, 0.25);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      rgba(99, 102, 241, 0) 0%,
      rgba(99, 102, 241, 0.8) 50%,
      rgba(99, 102, 241, 0) 100%
    );
  }

  @media (max-width: 768px) {
    min-width: 280px;
    width: 100%;
    max-width: 400px;
    padding: 0.75rem 1rem;
  }
`;

export const SenderAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
    border-radius: 10px;
  }
`;

export const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
`;

export const SenderName = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  color: #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;

export const MessageText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #f8fafc;
  line-height: 1.4;
  word-break: break-word;
  opacity: 0.95;
`;

export const DismissButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  align-self: flex-start;
  margin-left: 0.25rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }
`;
