import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '../../shared/config/tamagui.config';
import { ContactSidePanel } from './ContactSidePanel';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

describe('ContactSidePanel', () => {
  it('renders working hours from props', () => {
    render(
      <Wrapper>
        <ContactSidePanel side={undefined} workingHours="Mon–Fri 10–18" />
      </Wrapper>,
    );
    expect(screen.getByText('Mon–Fri 10–18')).toBeInTheDocument();
  });

  it('exposes the GitHub issue link with safe rel attributes', () => {
    render(
      <Wrapper>
        <ContactSidePanel side={undefined} workingHours="–" />
      </Wrapper>,
    );
    const link = screen.getByRole('link', { name: /Open an issue/i });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders press email as a mailto: anchor', () => {
    render(
      <Wrapper>
        <ContactSidePanel
          side={{ pressEmail: 'press@arc.games' }}
          workingHours="–"
        />
      </Wrapper>,
    );
    const link = screen.getByRole('link', { name: 'press@arc.games' });
    expect(link).toHaveAttribute('href', 'mailto:press@arc.games');
  });

  it('substitutes the on-call team count via i18n template', () => {
    render(
      <Wrapper>
        <ContactSidePanel
          side={{ onCallTeam: 'Team +{{extra}}' }}
          workingHours="–"
        />
      </Wrapper>,
    );
    expect(screen.getByText('Team +2')).toBeInTheDocument();
  });

  it('renders i18n-driven values when provided', () => {
    render(
      <Wrapper>
        <ContactSidePanel
          side={{
            medianFirstReplyValue: '12 min',
            coverageValue: 'GMT-8 → GMT+0',
          }}
          workingHours="–"
        />
      </Wrapper>,
    );
    expect(screen.getByText('12 min')).toBeInTheDocument();
    expect(screen.getByText('GMT-8 → GMT+0')).toBeInTheDocument();
  });
});
