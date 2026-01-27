import styled from 'styled-components';
import { Button as SharedButton } from '@/shared/ui';

export const Page = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  position: relative;
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen {
    max-width: 100%;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.background.base};
    padding: 1rem 2rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #dc2626;
`;

export const GameWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Card = styled.div`
  background: rgba(30, 30, 40, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem 2rem;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const Description = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1rem;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const InputGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

export const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) =>
      theme.buttons?.primary?.gradientStart || '#3b82f6'};
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button = styled(SharedButton).attrs({
  variant: 'primary',
  size: 'md',
})`
  padding: 0 1.5rem;
`;

export const LoginLink = styled.a`
  color: ${({ theme }) => theme.text.notice};
  text-decoration: underline;
  margin-top: 1rem;
  display: inline-block;

  &:hover {
    opacity: 0.8;
  }
`;

export const LockIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const NoticeMessage = styled(ErrorMessage)`
  background: ${({ theme }) => theme.interactive.pill.activeBackground};
  border-color: ${({ theme }) => theme.interactive.pill.activeBorder};
  color: ${({ theme }) => theme.text.notice};
`;
