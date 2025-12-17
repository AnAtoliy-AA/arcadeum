import styled from "styled-components";

export const PanelsSection = styled.section`
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

export const PanelCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.panel.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

export const PanelHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const PanelBadge = styled.span`
  align-self: flex-start;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const PanelSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;
