import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { FormGroup } from './FormGroup';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('FormGroup', () => {
  it('renders label and children', () => {
    render(
      <FormGroup label="Name">
        <input id="test" />
      </FormGroup>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders required asterisk', () => {
    render(
      <FormGroup label="Email" required>
        <input />
      </FormGroup>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(
      <FormGroup label="Zip" error="Invalid zip code">
        <input />
      </FormGroup>,
    );
    expect(screen.getByText(/Invalid zip code/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <FormGroup label="Pass" description="At least 8 chars">
        <input />
      </FormGroup>,
    );
    expect(screen.getByText('At least 8 chars')).toBeInTheDocument();
  });
});
