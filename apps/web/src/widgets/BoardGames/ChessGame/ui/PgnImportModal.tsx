'use client';

import { useState, useCallback } from 'react';
import { parsePgn } from '../lib/pgn-import';

interface PgnImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (moves: Array<{
    fromFile: string;
    fromRank: number;
    toFile: string;
    toRank: number;
    promotion?: string;
  }>, variant: 'standard' | 'chess960') => void;
}

export function PgnImportModal({ isOpen, onClose, onImport }: PgnImportModalProps) {
  const [pgnText, setPgnText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(() => {
    if (!pgnText.trim()) {
      setError('Please paste a PGN');
      return;
    }
    const result = parsePgn(pgnText);
    if (!result) {
      setError('Invalid PGN format');
      return;
    }
    if (result.moves.length === 0) {
      setError('No moves found in PGN');
      return;
    }
    onImport(result.moves, result.variant);
    setPgnText('');
    setError(null);
    onClose();
  }, [pgnText, onImport, onClose]);

  const handleClose = useCallback(() => {
    setPgnText('');
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--color)]">Import PGN</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-[var(--textSecondary)] mb-3">
          Paste a PGN game to analyze or replay. Headers and move text are supported.
        </p>
        <textarea
          value={pgnText}
          onChange={(e) => {
            setPgnText(e.target.value);
            setError(null);
          }}
          placeholder={`[Event "Casual Game"]\n[White "Player1"]\n[Black "Player2"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 *`}
          className="w-full h-48 p-3 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] text-[var(--color)] text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--textSecondary)]/50"
          spellCheck={false}
        />
        {error && (
          <div className="mt-2 text-xs text-red-400 font-medium">{error}</div>
        )}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2 px-4 rounded-lg bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--textSecondary)] text-xs font-semibold cursor-pointer hover:text-[var(--color)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex-1 py-2 px-4 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--primary)]/25 transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
