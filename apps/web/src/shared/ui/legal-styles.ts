import styled from "styled-components";
import Link from "next/link";

// Layout components
export const Page = styled.div`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.background.radialStart}, transparent 55%),
    radial-gradient(circle at bottom right, ${({ theme }) => theme.background.radialEnd}, transparent 55%),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
`;

export const Wrapper = styled.div<{ $maxWidth?: string }>`
  width: min(${({ $maxWidth }) => $maxWidth ?? "800px"}, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2rem);
`;

// Header components
export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  padding: clamp(2rem, 5vw, 3rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Tagline = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const LastUpdated = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.muted};
`;

// Section components
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  padding: clamp(1.5rem, 4vw, 2rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);

  @media (max-width: 700px) {
    border-radius: 18px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Paragraph = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

export const List = styled.ul`
  margin: 0;
  padding-left: 1.5rem;
  color: ${({ theme }) => theme.text.muted};
  line-height: 1.7;
`;

export const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

// Link components
export const ContactLink = styled(Link)`
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    text-decoration: none;
  }
`;

export const ExternalLink = styled.a`
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    text-decoration: none;
  }
`;

// Contact page specific components
export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

export const ContactCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

export const ContactIcon = styled.span`
  font-size: 1.5rem;
`;

export const ContactLabel = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const ContactValue = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.muted};
`;

// Form components
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Input = styled.input`
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.text.secondary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
  }
`;

export const TextArea = styled.textarea`
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 150px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.text.secondary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
  }
`;

export const SubmitButton = styled.button`
  padding: 0.875rem 1.5rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
    background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SuccessMessage = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  text-align: center;
  font-weight: 500;
`;
