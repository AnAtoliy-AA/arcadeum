import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';

describe('TableOfContents', () => {
  const items = [
    { id: 'sec1', title: 'Section One' },
    { id: 'sec2', title: 'Section Two' },
  ];

  it('renders section items and triggers onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <TableOfContents
        items={items}
        activeId="sec1"
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByText('Section One')).toBeInTheDocument();
    expect(screen.getByText('Section Two')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Section Two'));
    expect(handleSelect).toHaveBeenCalledWith('sec2');
  });
});
