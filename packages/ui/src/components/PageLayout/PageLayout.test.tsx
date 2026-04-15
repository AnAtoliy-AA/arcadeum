import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { PageLayout } from './PageLayout';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('PageLayout', () => {
  it('renders children correctly', () => {
    render(<PageLayout>Page Content</PageLayout>);
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
