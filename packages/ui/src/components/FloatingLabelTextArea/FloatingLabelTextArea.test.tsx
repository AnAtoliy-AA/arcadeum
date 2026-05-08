import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { useState } from 'react';
import config from '../../tamagui.config';
import { FloatingLabelTextArea } from './FloatingLabelTextArea';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('FloatingLabelTextArea', () => {
  it('renders the label', () => {
    render(<FloatingLabelTextArea label="Message" />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('fires onChange callback when typed into', () => {
    const onChange = vi.fn();
    render(<FloatingLabelTextArea id="m" label="Message" onChange={onChange} />);
    const textarea = screen.getByLabelText('Message');
    fireEvent.change(textarea, { target: { value: 'hi there' } });
    expect(onChange).toHaveBeenCalledWith('hi there');
  });

  it('renders character counter when maxLength is provided', () => {
    function Wrapper() {
      const [v, setV] = useState('hello');
      return (
        <FloatingLabelTextArea
          id="m"
          label="Message"
          value={v}
          onChange={setV}
          maxLength={100}
        />
      );
    }
    render(<Wrapper />);
    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('omits counter when maxLength is not provided', () => {
    render(<FloatingLabelTextArea id="m" label="Message" defaultValue="hi" />);
    expect(screen.queryByText(/\/\s*\d+/)).not.toBeInTheDocument();
  });
});
