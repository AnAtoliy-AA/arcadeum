import styled from 'styled-components';

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  padding: clamp(1.5rem, 4vw, 2rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

export const ToggleButton = styled.button<{ $expanded?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.text.primary};
  }

  span {
    transition: transform 0.2s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  }
`;

export const CollapsibleContent = styled.div<{ $visible?: boolean }>`
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`;
