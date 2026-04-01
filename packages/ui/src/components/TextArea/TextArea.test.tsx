import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { TextArea } from './TextArea';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('TextArea', () => {
  it('renders correctly with placeholder', () => {
    render(<TextArea placeholder="Write here" />);
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<TextArea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Text' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('Text');
  });

  it('renders in disabled state', () => {
    render(<TextArea disabled />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-disabled', 'true');
  });
});