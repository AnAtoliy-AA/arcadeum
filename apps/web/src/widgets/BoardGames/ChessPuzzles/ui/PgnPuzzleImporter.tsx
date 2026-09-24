'use client';

import { useState, useCallback, memo } from 'react';
import { Button } from '@arcadeum/ui';
import {
  CLASSIC_PGN_STUDIES,
  parsePgn,
} from '@/features/chess/lib/pgn-puzzle-extractor';
import {
  saveCustomPuzzle,
  validateCustomPuzzle,
} from '@/features/chess/lib/custom-puzzles';

interface PgnPuzzleImporterProps {
  onImportSuccess?: () => void;
}

function PgnPuzzleImporterImpl({ onImportSuccess }: PgnPuzzleImporterProps) {
  const [pgnText, setPgnText] = useState(CLASSIC_PGN_STUDIES[0]?.pgn || '');
  const [title, setTitle] = useState("Paul Morphy's Opera Game");
  const [movesUci, setMovesUci] = useState('b5d7 f6d7 b3b8 d7b8 d1d8');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSelectPreset = useCallback((index: number) => {
    const study = CLASSIC_PGN_STUDIES[index];
    if (!study) return;
    setPgnText(study.pgn);
    setTitle(study.title);
    if (index === 0) {
      setMovesUci('b5d7 f6d7 b3b8 d7b8 d1d8');
    } else if (index === 1) {
      setMovesUci('f7h6 g8h8 d8g8 g8g8 h6f7');
    } else {
      setMovesUci('b2b8 d8b8 c1d1');
    }
    setStatusMessage(null);
  }, []);

  const handleImport = useCallback(() => {
    try {
      const parsed = parsePgn(pgnText);
      const fen =
        parsed.headers.FEN ||
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const moves = movesUci
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((m) => m.toLowerCase());

      if (moves.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'Please specify at least one solution move in UCI format (e.g. e2e4).',
        });
        return;
      }

      const validation = validateCustomPuzzle(fen, moves);
      if (!validation.valid) {
        setStatusMessage({
          type: 'error',
          text: validation.error || 'Invalid FEN or move sequence.',
        });
        return;
      }

      const puzzleName =
        title.trim() || parsed.headers.Event || 'PGN Tactical Study';

      saveCustomPuzzle({
        title: puzzleName,
        description: parsed.headers.Site
          ? `Imported from ${parsed.headers.Site}`
          : 'Imported from PGN',
        fen,
        moves,
        rating: 1600,
        themes: ['pgn-study', 'tactics'],
        author: parsed.headers.White || 'Chess Master',
      });

      setStatusMessage({
        type: 'success',
        text: `Successfully imported "${puzzleName}" as a custom puzzle!`,
      });

      onImportSuccess?.();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to parse PGN study. Please check notation format.',
      });
    }
  }, [pgnText, title, movesUci, onImportSuccess]);

  return (
    <div
      data-testid="pgn-puzzle-importer"
      className="p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] flex flex-col gap-5 max-w-2xl mx-auto"
    >
      <div>
        <h3 className="text-lg font-bold text-[var(--color)]">
          PGN Study & Tactical Game Importer
        </h3>
        <p className="text-xs text-[var(--textSecondary)] mt-1">
          Paste any standard PGN game or tactical endgame study to convert it
          into an interactive playable puzzle.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
          Sample Classical Studies
        </label>
        <div className="flex flex-wrap gap-2">
          {CLASSIC_PGN_STUDIES.map((study, idx) => (
            <button
              key={study.title}
              type="button"
              onClick={() => handleSelectPreset(idx)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--background)] border border-[var(--glassBorder)] hover:border-[var(--primary)] text-[var(--textPrimary)] transition-colors text-left"
            >
              {study.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="pgn-title"
          className="text-xs font-semibold text-[var(--textSecondary)] uppercase tracking-wider"
        >
          Puzzle Title
        </label>
        <input
          id="pgn-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morphy Opera Game Mate"
          className="px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] text-sm text-[var(--textPrimary)] focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="pgn-textarea"
          className="text-xs font-semibold text-[var(--textSecondary)] uppercase tracking-wider"
        >
          PGN Text (with [FEN] header for custom positions)
        </label>
        <textarea
          id="pgn-textarea"
          rows={6}
          value={pgnText}
          onChange={(e) => setPgnText(e.target.value)}
          placeholder="Paste PGN text here..."
          className="p-3 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] font-mono text-xs text-[var(--textPrimary)] focus:outline-none focus:border-[var(--primary)] resize-y"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="pgn-moves"
          className="text-xs font-semibold text-[var(--textSecondary)] uppercase tracking-wider"
        >
          Solution Moves (UCI format separated by space, e.g. b5d7 f6d7)
        </label>
        <input
          id="pgn-moves"
          type="text"
          value={movesUci}
          onChange={(e) => setMovesUci(e.target.value)}
          placeholder="e.g. b5d7 f6d7 b3b8 d7b8 d1d8"
          className="px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] font-mono text-xs text-[var(--textPrimary)] focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      {statusMessage && (
        <div
          data-testid="pgn-import-status"
          className={`p-3 rounded-xl text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleImport}
          data-testid="import-pgn-submit-btn"
        >
          Validate & Import as Puzzle
        </Button>
      </div>
    </div>
  );
}

export const PgnPuzzleImporter = memo(PgnPuzzleImporterImpl);
