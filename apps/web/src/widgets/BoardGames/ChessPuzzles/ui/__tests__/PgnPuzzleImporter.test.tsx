import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PgnPuzzleImporter } from '../PgnPuzzleImporter';
import { loadCustomPuzzles } from '@/features/chess/lib/custom-puzzles';

describe('PgnPuzzleImporter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders PGN importer with preset buttons and form fields', () => {
    render(<PgnPuzzleImporter />);
    expect(screen.getByTestId('pgn-puzzle-importer')).toBeDefined();
    expect(screen.getByText("Morphy's Opera Game Mate")).toBeDefined();
    expect(screen.getByLabelText(/Puzzle Title/)).toBeDefined();
    expect(screen.getByTestId('import-pgn-submit-btn')).toBeDefined();
  });

  it('switches presets on button click', () => {
    render(<PgnPuzzleImporter />);
    const philidorBtn = screen.getByText('Smothered Philidor Defense');
    fireEvent.click(philidorBtn);
    const titleInput = screen.getByLabelText(
      /Puzzle Title/,
    ) as HTMLInputElement;
    expect(titleInput.value).toBe('Smothered Philidor Defense');
  });

  it('validates and imports custom puzzle from study', () => {
    const onImportSuccess = vi.fn();
    render(<PgnPuzzleImporter onImportSuccess={onImportSuccess} />);

    const submitBtn = screen.getByTestId('import-pgn-submit-btn');
    fireEvent.click(submitBtn);

    const status = screen.getByTestId('pgn-import-status');
    expect(status.textContent).toContain('Successfully imported');
    expect(onImportSuccess).toHaveBeenCalled();

    const saved = loadCustomPuzzles();
    expect(saved.length).toBeGreaterThan(0);
  });
});
