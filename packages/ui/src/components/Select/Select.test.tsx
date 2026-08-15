import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import { Select } from './Select';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('Select', () => {
  it('renders options correctly', () => {
    render(
      <Select data-testid="select">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>,
    );
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('opens dropdown and shows options', () => {
    render(
      <Select data-testid="select">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>,
    );
    fireEvent.click(screen.getByTestId('select'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(
      <Select
        onValueChange={handleChange}
        data-testid="select"
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ]}
      />,
    );
    fireEvent.click(screen.getByTestId('select'));
    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('renders in disabled state', () => {
    render(
      <Select disabled data-testid="select">
        <option value="1">Option 1</option>
      </Select>,
    );
    expect(screen.getByTestId('select')).toBeDisabled();
  });
});
