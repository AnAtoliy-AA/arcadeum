import styled from 'styled-components';
import Link from 'next/link';
import {
  Input as SharedInput,
  TextArea as SharedTextArea,
  Button,
  Card,
  FormGroup as SharedFormGroup,
} from './';

// Layout components
export const Page = styled.div`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background: radial-gradient(
      circle at top left,
      ${({ theme }) => theme.background.radialStart},
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      ${({ theme }) => theme.background.radialEnd},
      transparent 55%
    ),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
`;

export const Wrapper = styled.div<{ $maxWidth?: string }>`
  width: min(${({ $maxWidth }) => $maxWidth ?? '800px'}, 100%);
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

export const ContactCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 16px;
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

export const FormGroup = styled(SharedFormGroup)``;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Input = styled(SharedInput)`
  padding: 0.875rem 1rem;
`;

export const TextArea = styled(SharedTextArea)`
  min-height: 150px;
`;

export const SubmitButton = styled(Button).attrs({ variant: 'secondary' })`
  border-radius: 999px;
  padding: 0.875rem 1.5rem;
  align-self: flex-start;
`;

export const SuccessMessage = styled(Card).attrs({
  variant: 'outlined',
  padding: 'sm',
})`
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
  text-align: center;
  font-weight: 500;
`;
