import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { FloatingLabelInput } from './FloatingLabelInput';
import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('FloatingLabelInput', () => {
  it('renders the label', () => {
    render(<FloatingLabelInput label="Your name" />);
    expect(screen.getByText('Your name')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor / id', () => {
    render(<FloatingLabelInput id="name" label="Your name" />);
    const input = screen.getByLabelText('Your name');
    expect(input).toBeInTheDocument();
  });

  it('fires onChange callback when typed into', () => {
    const onChange = vi.fn();
    render(<FloatingLabelInput label="Email" onChange={onChange} />);
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'a@b.co' } });
    expect(onChange).toHaveBeenCalledWith('a@b.co');
  });

  it('supports controlled mode', () => {
    function Wrapper() {
      const [v, setV] = useState('hello');
      return <FloatingLabelInput label="Subject" value={v} onChange={setV} />;
    }
    render(<Wrapper />);
    const input = screen.getByLabelText('Subject') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });

  it('renders required indicator when required is set', () => {
    const { container } = render(
      <FloatingLabelInput label="Name" required />,
    );
    expect(container.textContent).toContain('*');
  });
});
