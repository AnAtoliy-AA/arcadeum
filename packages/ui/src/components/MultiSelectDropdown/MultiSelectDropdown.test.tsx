import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelectDropdown } from './MultiSelectDropdown';

describe('MultiSelectDropdown', () => {
  const options = [
    { id: 'opt1', label: 'Option 1' },
    { id: 'opt2', label: 'Option 2' },
    { id: 'opt3', label: 'Option 3' },
  ];

  it('renders trigger with label and opens menu on click', () => {
    render(
      <MultiSelectDropdown
        label="Filters"
        options={options}
        selectedValues={[]}
        onChange={() => {}}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Option 1' })).toBeInTheDocument();
  });

  it('toggles selection when clicking an option', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Filters"
        options={options}
        selectedValues={['opt1']}
        onChange={handleChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(trigger);

    const opt2 = screen.getByRole('checkbox', { name: 'Option 2' });
    fireEvent.click(opt2);
    expect(handleChange).toHaveBeenCalledWith(['opt1', 'opt2']);
  });

  it('clears selection when clicking All button in header', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Filters"
        options={options}
        selectedValues={['opt1', 'opt2']}
        onChange={handleChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: /Filters/i });
    fireEvent.click(trigger);

    const allBtn = screen.getByRole('checkbox', { name: 'All' });
    fireEvent.click(allBtn);
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
