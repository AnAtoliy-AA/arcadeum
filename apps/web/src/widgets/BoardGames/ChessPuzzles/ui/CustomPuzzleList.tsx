'use client';

import { useState, useCallback } from 'react';
import { Button } from '@arcadeum/ui';
import {
  deleteCustomPuzzle,
  encodePuzzleShare,
  exportCustomPuzzlesJson,
  importCustomPuzzlesJson,
} from '@/features/chess/lib/custom-puzzles';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';

interface CustomPuzzleListProps {
  puzzles: ChessPuzzle[];
  locale?: string;
  onPlay: (puzzle: ChessPuzzle) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export function CustomPuzzleList({
  puzzles,
  locale = 'en',
  onPlay,
  onCreateNew,
  onRefresh,
}: CustomPuzzleListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDelete = useCallback(
    (id: string) => {
      deleteCustomPuzzle(id);
      onRefresh();
    },
    [onRefresh],
  );

  const handleShare = useCallback(
    (puzzle: ChessPuzzle) => {
      const encoded = encodePuzzleShare(puzzle);
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/${locale}/games/chess/puzzles/custom?puzzle=${encoded}`
          : '';

      if (typeof navigator !== 'undefined' && navigator.clipboard && url) {
        navigator.clipboard.writeText(url).then(() => {
          setCopiedId(puzzle.puzzleId);
          setTimeout(() => setCopiedId(null), 2500);
        });
      }
    },
    [locale],
  );

  const handleExport = useCallback(() => {
    const json = exportCustomPuzzlesJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcadeum-custom-chess-puzzles-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportSubmit = useCallback(() => {
    if (!importText.trim()) return;
    const count = importCustomPuzzlesJson(importText);
    if (count > 0) {
      setImportStatus(
        `Successfully imported ${count} puzzle${count === 1 ? '' : 's'}!`,
      );
      setImportText('');
      onRefresh();
      setTimeout(() => {
        setImportOpen(false);
        setImportStatus(null);
      }, 1500);
    } else {
      setImportStatus('Invalid JSON puzzle format. Please check syntax.');
    }
  }, [importText, onRefresh]);

  return (
    <div
      data-testid="custom-puzzle-list"
      className="w-full flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-[var(--color)]">
            Community & Custom Puzzles
          </h2>
          <p className="text-xs text-[var(--textSecondary)]">
            Create, play, and share your own tactical positions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={puzzles.length === 0}
            data-testid="export-puzzles-btn"
          >
            Export JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setImportOpen(!importOpen)}
            data-testid="import-puzzles-btn"
          >
            Import JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            data-testid="create-puzzle-btn"
          >
            + Create Puzzle
          </Button>
        </div>
      </div>

      {importOpen && (
        <div
          data-testid="import-json-card"
          className="p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-3"
        >
          <div className="text-xs font-semibold text-[var(--textSecondary)]">
            Paste Custom Puzzles JSON
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={4}
            placeholder='[ { "fen": "...", "moves": ["e1e8"], "rating": 1500 } ]'
            className="w-full p-2.5 rounded-lg bg-[var(--background)] border border-[var(--glassBorder)] text-xs text-[var(--color)] font-mono resize-none focus:outline-none focus:border-[var(--primary)]"
            data-testid="import-json-textarea"
          />
          {importStatus && (
            <div className="text-xs font-medium text-[var(--accent)]">
              {importStatus}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setImportOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImportSubmit}
              data-testid="confirm-import-btn"
            >
              Import
            </Button>
          </div>
        </div>
      )}

      {puzzles.length === 0 ? (
        <div
          data-testid="empty-custom-puzzles"
          className="p-12 text-center rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col items-center justify-center gap-3"
        >
          <div className="text-4xl">♟️</div>
          <div className="text-base font-bold text-[var(--color)]">
            No Custom Puzzles Yet
          </div>
          <p className="text-xs text-[var(--textSecondary)] max-w-sm">
            Create your first tactical chess problem, test solve it, and share
            it with friends via direct link!
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={onCreateNew}
            data-testid="empty-create-btn"
          >
            Create Your First Puzzle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puzzles.map((puzzle) => (
            <div
              key={puzzle.puzzleId}
              data-testid={`custom-puzzle-card-${puzzle.puzzleId}`}
              className="p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col justify-between gap-3 hover:border-[var(--primary)]/50 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color)]">
                    {puzzle.openingTags?.[0] || 'Custom Puzzle'}
                  </h3>
                  <div className="text-[11px] text-[var(--textSecondary)] mt-0.5">
                    Rating:{' '}
                    <span className="font-semibold text-amber-400">
                      {puzzle.rating}
                    </span>{' '}
                    · {puzzle.moves.length} plies
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {puzzle.themes.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] bg-[var(--primary)]/15 text-[var(--primary)] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-[var(--textSecondary)] truncate bg-[var(--background)] px-2 py-1 rounded">
                FEN: {puzzle.fen}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--glassBorder)]/50">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onPlay(puzzle)}
                  data-testid={`play-custom-puzzle-${puzzle.puzzleId}`}
                >
                  Play Puzzle
                </Button>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShare(puzzle)}
                    data-testid={`share-custom-puzzle-${puzzle.puzzleId}`}
                  >
                    {copiedId === puzzle.puzzleId ? 'Copied! ✓' : 'Share 📋'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(puzzle.puzzleId)}
                    data-testid={`delete-custom-puzzle-${puzzle.puzzleId}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
