import { render as rtlRender } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormPips } from './FormPips';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('FormPips', () => {
  it('clamps to max', () => {
    const { container } = render(
      <FormPips
        results={['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']}
        max={5}
      />,
    );
    expect(container.querySelectorAll('[data-testid="form-pip"]').length).toBe(
      5,
    );
  });

  it('renders empty without crashing', () => {
    const { container } = render(<FormPips results={[]} />);
    expect(container.querySelectorAll('[data-testid="form-pip"]').length).toBe(
      0,
    );
  });
});
