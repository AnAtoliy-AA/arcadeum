import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders search input with placeholder', () => {
    render(
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Search games..."
      />,
    );
    expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(
      <SearchInput
        value=""
        onChange={handleChange}
        placeholder="Search games..."
      />,
    );
    const input = screen.getByPlaceholderText('Search games...');
    fireEvent.change(input, { target: { value: 'Chess' } });
    expect(handleChange).toHaveBeenCalledWith('Chess');
  });

  it('renders clear button when value is present and clears on click', () => {
    const handleClear = vi.fn();
    render(
      <SearchInput
        value="Chess"
        onChange={() => {}}
        onClear={handleClear}
        placeholder="Search games..."
      />,
    );
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
