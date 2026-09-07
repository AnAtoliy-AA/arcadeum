'use client';

import { useCallback, useState } from 'react';
import type {
  File,
  Rank,
  Board,
} from '@arcadeum/games-core/games/chess/chess.types';
import type {
  PieceType,
  PieceColor,
} from '@arcadeum/games-core/games/chess/chess.constants';
import {
  FILES,
  PIECE_SYMBOLS,
} from '@arcadeum/games-core/games/chess/chess.constants';
import { parseFen } from '@arcadeum/games-core/games/chess/chess.board';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PRESET_POSITIONS = [
  { name: 'Starting Position', fen: INITIAL_FEN },
  {
    name: 'Sicilian Defense',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  },
  {
    name: "King's Gambit",
    fen: 'rnbqkbnr/pppp1ppp/8/4P3/5p2/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
  },
  {
    name: 'Ruy Lopez',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  },
  {
    name: "Queen's Gambit",
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
  },
  { name: 'King and Queen vs King', fen: '4k3/8/8/8/8/8/8/3QK3 w - - 0 1' },
  { name: 'Rook Endgame', fen: '4k3/8/8/8/8/8/4R3/4K3 w - - 0 1' },
  { name: 'Bishop vs Knight', fen: '4k3/8/8/4B3/8/8/8/4K3 w - - 0 1' },
];

function parseFullFen(fen: string): {
  board: Board;
  turn: PieceColor;
  castling: Record<string, boolean>;
  ep: string;
} | null {
  try {
    const parts = fen.split(' ');
    const board = parseFen(fen);
    const turn = (parts[1] ?? 'w') === 'w' ? 'white' : 'black';
    const castling = parts[2] ?? '-';
    return {
      board,
      turn,
      castling: {
        whiteKingSide: castling.includes('K'),
        whiteQueenSide: castling.includes('Q'),
        blackKingSide: castling.includes('k'),
        blackQueenSide: castling.includes('q'),
      },
      ep: parts[3] ?? '-',
    };
  } catch {
    return null;
  }
}

function boardToFen(
  board: Board,
  turn: PieceColor,
  castling: Record<string, boolean>,
  ep: string,
): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    let row = '';
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        const ch = piece.type.charAt(0);
        row += piece.color === 'white' ? ch.toUpperCase() : ch;
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  const placement = rows.join('/');
  const turnChar = turn === 'white' ? 'w' : 'b';
  let castlingStr = '';
  if (castling.whiteKingSide) castlingStr += 'K';
  if (castling.whiteQueenSide) castlingStr += 'Q';
  if (castling.blackKingSide) castlingStr += 'k';
  if (castling.blackQueenSide) castlingStr += 'q';
  if (!castlingStr) castlingStr = '-';
  return `${placement} ${turnChar} ${castlingStr} ${ep} 0 1`;
}

const PIECE_PALETTE: { type: PieceType; color: PieceColor }[] = [
  { type: 'king', color: 'white' },
  { type: 'queen', color: 'white' },
  { type: 'rook', color: 'white' },
  { type: 'bishop', color: 'white' },
  { type: 'knight', color: 'white' },
  { type: 'pawn', color: 'white' },
  { type: 'king', color: 'black' },
  { type: 'queen', color: 'black' },
  { type: 'rook', color: 'black' },
  { type: 'bishop', color: 'black' },
  { type: 'knight', color: 'black' },
  { type: 'pawn', color: 'black' },
];

export function BoardEditor() {
  const [board, setBoard] = useState<Board>(() => parseFen(INITIAL_FEN));
  const [turn, setTurn] = useState<PieceColor>('white');
  const [castling, setCastling] = useState<Record<string, boolean>>({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  });
  const [ep, setEp] = useState('-');
  const [selectedPalettePiece, setSelectedPalettePiece] = useState<{
    type: PieceType;
    color: PieceColor;
  } | null>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [fenOutput, setFenOutput] = useState(INITIAL_FEN);
  const [fenInput, setFenInput] = useState(INITIAL_FEN);
  const [flipBoard, setFlipBoard] = useState(false);

  const updateBoard = useCallback(
    (newBoard: Board) => {
      setBoard(newBoard);
      setFenOutput(boardToFen(newBoard, turn, castling, ep));
    },
    [turn, castling, ep],
  );

  const handleSquareClick = useCallback(
    (file: File, rank: Rank) => {
      const rowIdx = 8 - rank;
      const colIdx = FILES.indexOf(file);
      const newBoard = board.map((r) => r.map((p) => (p ? { ...p } : null)));

      if (eraseMode) {
        newBoard[rowIdx][colIdx] = null;
        updateBoard(newBoard);
        return;
      }

      if (selectedPalettePiece) {
        newBoard[rowIdx][colIdx] = { ...selectedPalettePiece };
        updateBoard(newBoard);
        return;
      }

      const piece = newBoard[rowIdx][colIdx];
      if (piece) {
        newBoard[rowIdx][colIdx] = null;
        updateBoard(newBoard);
      }
    },
    [board, selectedPalettePiece, eraseMode, updateBoard],
  );

  const loadPreset = useCallback((fen: string) => {
    const parsed = parseFullFen(fen);
    if (parsed) {
      setBoard(parsed.board);
      setTurn(parsed.turn);
      setCastling(parsed.castling);
      setEp(parsed.ep);
      setFenOutput(fen);
      setFenInput(fen);
      setSelectedPalettePiece(null);
      setEraseMode(false);
    }
  }, []);

  const loadFenInput = useCallback(() => {
    const parsed = parseFullFen(fenInput);
    if (parsed) {
      setBoard(parsed.board);
      setTurn(parsed.turn);
      setCastling(parsed.castling);
      setEp(parsed.ep);
      setFenOutput(fenInput);
      setSelectedPalettePiece(null);
      setEraseMode(false);
    }
  }, [fenInput]);

  const clearBoard = useCallback(() => {
    const empty: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
    setBoard(empty);
    setTurn('white');
    setCastling({
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false,
    });
    setEp('-');
    setFenOutput(
      boardToFen(
        empty,
        'white',
        {
          whiteKingSide: false,
          whiteQueenSide: false,
          blackKingSide: false,
          blackQueenSide: false,
        },
        '-',
      ),
    );
    setSelectedPalettePiece(null);
    setEraseMode(false);
  }, []);

  const ranks: Rank[] = flipBoard
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];
  const files: File[] = flipBoard
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto p-4">
      <div className="flex flex-col gap-3 flex-none lg:w-[min(60vmin,480px)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)]">Board Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFlipBoard((f) => !f)}
              className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
            >
              Flip
            </button>
            <button
              onClick={clearBoard}
              className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div
          className="flex gap-1 items-stretch"
          style={{ maxWidth: 'min(60vmin, 480px)' }}
        >
          <div className="flex flex-col justify-between py-1 text-[10px] text-[var(--textSecondary)] opacity-60 w-4 text-center">
            {ranks.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
          <div className="flex-1">
            <div
              className="w-full rounded-xl overflow-hidden border-2 border-[rgba(255,255,255,0.1)] shadow-2xl"
              style={{ aspectRatio: '1 / 1' }}
            >
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {ranks.map((rank) =>
                  files.map((file) => {
                    const rowIdx = 8 - rank;
                    const colIdx = FILES.indexOf(file);
                    const piece = board[rowIdx][colIdx];
                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    return (
                      <div
                        key={`${file}-${rank}`}
                        className="flex items-center justify-center cursor-pointer relative hover:brightness-110 transition-all"
                        style={{
                          backgroundColor: isLight ? '#e8d5b5' : '#a97d50',
                          aspectRatio: '1 / 1',
                        }}
                        onClick={() => handleSquareClick(file, rank)}
                      >
                        {piece && (
                          <span className="text-[min(7vmin,3.5rem)] leading-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                            {
                              PIECE_SYMBOLS[
                                piece.type as keyof typeof PIECE_SYMBOLS
                              ][piece.color as 'white' | 'black']
                            }
                          </span>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="text-[10px] font-semibold text-[var(--textSecondary)] mb-1.5">
            Piece Palette
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setSelectedPalettePiece(null);
                setEraseMode(!eraseMode);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all ${eraseMode ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'}`}
              title="Erase"
            >
              ✕
            </button>
            {PIECE_PALETTE.map(({ type, color }) => (
              <button
                key={`${color}-${type}`}
                onClick={() => {
                  setSelectedPalettePiece({ type, color });
                  setEraseMode(false);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${selectedPalettePiece?.type === type && selectedPalettePiece?.color === color ? 'bg-[var(--primary)]/30 ring-2 ring-[var(--primary)]' : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'}`}
                title={`${color} ${type}`}
              >
                {
                  PIECE_SYMBOLS[type as keyof typeof PIECE_SYMBOLS][
                    color as 'white' | 'black'
                  ]
                }
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div>
          <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1">
            FEN Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="Paste FEN here..."
            />
            <button
              onClick={loadFenInput}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
            >
              Load
            </button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="text-xs font-semibold text-[var(--textSecondary)] mb-2">
            Options
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--textSecondary)] w-20">
                Turn:
              </span>
              <button
                onClick={() => {
                  setTurn('white');
                  setFenOutput(boardToFen(board, 'white', castling, ep));
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${turn === 'white' ? 'bg-white text-black' : 'bg-[rgba(255,255,255,0.1)] text-[var(--textSecondary)]'}`}
              >
                White
              </button>
              <button
                onClick={() => {
                  setTurn('black');
                  setFenOutput(boardToFen(board, 'black', castling, ep));
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${turn === 'black' ? 'bg-gray-800 text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--textSecondary)]'}`}
              >
                Black
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--textSecondary)] w-20">
                Castling:
              </span>
              <div className="flex gap-1">
                {(['K', 'Q', 'k', 'q'] as const).map((k) => {
                  const labels: Record<string, string> = {
                    K: 'wK',
                    Q: 'wQ',
                    k: 'bK',
                    q: 'bQ',
                  };
                  const keys: Record<string, string> = {
                    K: 'whiteKingSide',
                    Q: 'whiteQueenSide',
                    k: 'blackKingSide',
                    q: 'blackQueenSide',
                  };
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        const newCastling = {
                          ...castling,
                          [keys[k]]: !castling[keys[k]],
                        };
                        setCastling(newCastling);
                        setFenOutput(boardToFen(board, turn, newCastling, ep));
                      }}
                      className={`px-2 py-1 text-[10px] rounded font-mono transition-colors ${castling[keys[k]] ? 'bg-[var(--primary)] text-white' : 'bg-[rgba(255,255,255,0.1)] text-[var(--textSecondary)]'}`}
                    >
                      {labels[k]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="text-xs font-semibold text-[var(--textSecondary)] mb-2">
            FEN Output
          </div>
          <input
            type="text"
            readOnly
            value={fenOutput}
            className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--glassBorder)] text-[var(--text)]"
          />
          <button
            onClick={() => navigator.clipboard.writeText(fenOutput)}
            className="mt-2 px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
          >
            Copy FEN
          </button>
        </div>

        <div className="p-3 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
          <div className="text-xs font-semibold text-[var(--textSecondary)] mb-2">
            Preset Positions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_POSITIONS.map((pos) => (
              <button
                key={pos.name}
                onClick={() => loadPreset(pos.fen)}
                className="px-3 py-1.5 text-[11px] rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] hover:bg-[var(--backgroundHover)] transition-colors"
              >
                {pos.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
