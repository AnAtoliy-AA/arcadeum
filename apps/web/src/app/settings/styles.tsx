import styled from 'styled-components';
import { Button, ButtonProps } from '@arcadeum/ui';

export const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

export const OptionList = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

export const OptionLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const OptionDescription = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const DownloadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`;

export const DownloadLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.interactive.download.hoverBorder};
    background: ${({ theme }) => theme.interactive.download.hoverBackground};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DownloadIcon = styled.span`
  font-size: 1.25rem;
`;

export const AccountStatus = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text.secondary};
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(12px);
`;

export const AccountActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 0.75rem;
`;

export const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: ${({ theme }) => theme.interactive.option.background};
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);

  &:hover {
    border-color: ${({ theme }) => theme.interactive.option.hoverBorder};
    background: ${({ theme }) => theme.interactive.option.activeBackground};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const ToggleLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const ToggleInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 3.5rem;
  height: 2rem;
  background: ${({ theme }) => theme.interactive.pill.inactiveBackground};
  border-radius: 999px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.interactive.pill.border};

  &:checked {
    background: ${({ theme }) => theme.text.accent};
    border-color: ${({ theme }) => theme.text.accent};
    box-shadow: 0 0 12px ${({ theme }) => theme.text.accent}40;
  }

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(2rem - 12px);
    height: calc(2rem - 12px);
    background: white;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::after {
    transform: translateX(1.5rem);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

export const BlockedUserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  gap: 1rem;
  backdrop-filter: blur(12px);
`;

export const BlockedUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
`;

export const UnblockButton = (props: ButtonProps) => (
  <Button
    variant="secondary"
    size="sm"
    borderRadius={12}
    whiteSpace="nowrap"
    hoverStyle={{
      borderColor: '#ef4444',
      color: '#ef4444',
      backgroundColor: '#ef444410',
    }}
    {...props}
  />
);

export const VersionText = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.secondary};
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  letter-spacing: 0.05em;
  opacity: 0.8;
`;
