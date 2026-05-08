import { render as rtlRender } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { describe, it, expect } from 'vitest';
import config from '../../tamagui.config';
import { FormPips } from './FormPips';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('FormPips', () => {
  it('clamps to max', () => {
    const { container } = render(
      <FormPips
        results={['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']}
        max={5}
      />,
    );
    expect(container.querySelectorAll('.is_FormPip').length).toBe(5);
  });

  it('renders empty without crashing', () => {
    const { container } = render(<FormPips results={[]} />);
    expect(container.querySelectorAll('.is_FormPip').length).toBe(0);
  });
});
