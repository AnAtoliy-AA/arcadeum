import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { PageTitle } from './PageTitle';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('PageTitle', () => {
  it('renders children correctly', () => {
    render(<PageTitle>Headline</PageTitle>);
    expect(screen.getByText('Headline')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { unmount } = render(
        <PageTitle size={size}>Title {size}</PageTitle>,
      );
      expect(screen.getByText(`Title ${size}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with gradient', () => {
    render(
      <PageTitle gradient>
        Gradient Title
      </PageTitle>,
    );
    expect(screen.getByText('Gradient Title')).toBeInTheDocument();
  });
});
