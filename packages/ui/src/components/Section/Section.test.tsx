import { render as rtlRender, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Section } from './Section';

import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Section', () => {
  it('renders title, description and children', () => {
    render(
      <Section title="Section Title" description="Section description">
        <div>Content</div>
      </Section>,
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
