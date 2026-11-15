import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetRenameField } from './ArcadePetRenameField';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('ArcadePetRenameField', () => {
  it('renames through the inline form', () => {
    const onRename = vi.fn(() => ({ success: true }));
    render(<ArcadePetRenameField name="Bit" onRename={onRename} />);
    fireEvent.click(screen.getByTestId('pet-rename-btn'));
    fireEvent.change(screen.getByTestId('pet-rename-input'), {
      target: { value: 'Nova' },
    });
    fireEvent.click(screen.getByTestId('pet-rename-save'));
    expect(onRename).toHaveBeenCalledWith('Nova');
    expect(screen.queryByTestId('pet-rename-input')).toBeNull();
  });

  it('flags invalid names and keeps editing', () => {
    const onRename = vi.fn(() => ({ success: true }));
    render(<ArcadePetRenameField name="Bit" onRename={onRename} />);
    fireEvent.click(screen.getByTestId('pet-rename-btn'));
    fireEvent.change(screen.getByTestId('pet-rename-input'), {
      target: { value: 'x' },
    });
    fireEvent.click(screen.getByTestId('pet-rename-save'));
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('2 to 24');
    expect(screen.getByTestId('pet-rename-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('cancels with Escape', () => {
    render(<ArcadePetRenameField name="Bit" onRename={vi.fn()} />);
    fireEvent.click(screen.getByTestId('pet-rename-btn'));
    fireEvent.keyDown(screen.getByTestId('pet-rename-input'), {
      key: 'Escape',
    });
    expect(screen.queryByTestId('pet-rename-input')).toBeNull();
  });
});
