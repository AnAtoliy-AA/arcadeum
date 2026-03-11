import { TamaguiProvider } from "tamagui";
import config from "../../tamagui.config";

import { render as rtlRender, screen } from '@testing-library/react';
import { LinkButton } from './LinkButton';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};


describe('LinkButton', () => {
  it('renders an internal link', () => {
    render(<LinkButton href="/home">Home</LinkButton>);
    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('renders an external link', () => {
    render(
      <LinkButton href="https://google.com" external>
        Search
      </LinkButton>,
    );
    const link = screen.getByRole('link', { name: /search/i });
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with variant and size', () => {
    render(
      <LinkButton href="/" variant="ghost" size="lg">
        Ghost
      </LinkButton>,
    );
    expect(screen.getByText('Ghost')).toBeInTheDocument();
  });
});
