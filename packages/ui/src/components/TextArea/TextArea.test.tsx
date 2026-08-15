import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TextArea } from './TextArea';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
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
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});