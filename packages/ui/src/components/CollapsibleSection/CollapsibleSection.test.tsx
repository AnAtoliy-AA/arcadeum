import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { CollapsibleSection } from './CollapsibleSection';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('CollapsibleSection', () => {
  it('renders title and children when expanded', () => {
    render(
      <CollapsibleSection title="Test Section" defaultExpanded={true}>
        <div>Content</div>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Hide')).toBeInTheDocument();
  });

  it('toggles visibility when button is clicked', () => {
    render(
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
    render(
      <CollapsibleSection title="Title" headerContent={<span>Extra</span>}>
        <div>Content</div>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
