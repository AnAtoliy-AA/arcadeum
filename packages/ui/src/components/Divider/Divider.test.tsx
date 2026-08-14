import { render as rtlRender, screen } from '@testing-library/react';
import { Divider } from './Divider';

import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('Divider', () => {
  it('renders correctly', () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('renders horizontal by default', () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId('divider').className).toContain('h-px');
  });

  it('renders vertical when requested', () => {
    render(<Divider vertical data-testid="divider" />);
    expect(screen.getByTestId('divider').className).toContain('w-px');
  });
});
