import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSection } from './CollapsibleSection';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('CollapsibleSection', () => {
  it('renders title and children when expanded', () => {
    renderWithTheme(
      <CollapsibleSection title="Test Section" defaultExpanded={true}>
        <div>Content</div>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Hide')).toBeInTheDocument();
  });

  it('toggles visibility when button is clicked', () => {
    renderWithTheme(
      <CollapsibleSection
        title="Test Section"
        defaultExpanded={false}
        showLabel="More"
        hideLabel="Less"
      >
        <div>Content</div>
      </CollapsibleSection>,
    );

    expect(screen.getByText('More')).toBeInTheDocument();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeVisible();
  });

  it('renders headerContent when provided', () => {
    renderWithTheme(
      <CollapsibleSection title="Title" headerContent={<span>Extra</span>}>
        <div>Content</div>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
