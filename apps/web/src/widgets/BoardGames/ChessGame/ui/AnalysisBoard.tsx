'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChessEngine } from '@arcadeum/games-core/games/chess/chess.engine';
import type {
  ChessState,
  BoardPosition,
  File,
  Rank,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceType } from '@arcadeum/games-core/games/chess/chess.constants';
import {
  FILES,
  PIECE_SYMBOLS,
} from '@arcadeum/games-core/games/chess/chess.constants';
import { parseFen } from '@arcadeum/games-core/games/chess/chess.board';
import { getLegalMoves } from '@arcadeum/games-core/games/chess/chess.move-generator';
import { analyzePositionWithStockfish } from '@/features/analysis/lib/stockfish-api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { AnalysisBoardGrid } from './AnalysisBoardGrid';
import { AnalysisSidebar } from './AnalysisSidebar';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function parseFullFen(fen: string): ChessState | null {
  try {
    const parts = fen.split(' ');
    const board = parseFen(fen);
    const turn = (parts[1] ?? 'w') === 'w' ? 'white' : 'black';
    const castling = parts[2] ?? '-';
    return {
      variant: 'standard',
      timeControl: null,
      board,
      currentTurnColor: turn,
      castlingRights: {
        whiteKingSide: castling.includes('K'),
        whiteQueenSide: castling.includes('Q'),
        blackKingSide: castling.includes('k'),
        blackQueenSide: castling.includes('q'),
      },
      enPassantTarget:
        parts[3] && parts[3] !== '-'
          ? { file: parts[3][0] as File, rank: parseInt(parts[3][1]) as Rank }
          : null,
      halfMoveClock: parseInt(parts[4] ?? '0'),
      fullMoveNumber: parseInt(parts[5] ?? '1'),
      moveHistory: [],
      players: [
        { playerId: 'white', color: 'white', isBot: false },
        { playerId: 'black', color: 'black', isBot: false },
      ],
      winnerColor: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDrawByRepetition: false,
      isDrawByFiftyMoveRule: false,
      isInsufficientMaterial: false,
      isDrawByAgreement: false,
      drawOfferedBy: null,
      takebackOfferedBy: null,
      takebackMoveIndex: null,
      clocks: null,
      positionHistory: [fen],
      currentTurnIndex: 0,
      logs: [],
      legalMovesForCurrentPlayer: [],
    };
  } catch {
    return null;
  }
}

function boardToFen(state: ChessState): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    let row = '';
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece) {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        row +=
          piece.color === 'white'
            ? piece.type.charAt(0).toUpperCase()
            : piece.type.charAt(0);
      } else {
        empty++;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }
  const turn = state.currentTurnColor === 'white' ? 'w' : 'b';
  let castling = '';
  if (state.castlingRights.whiteKingSide) castling += 'K';
  if (state.castlingRights.whiteQueenSide) castling += 'Q';
  if (state.castlingRights.blackKingSide) castling += 'k';
  if (state.castlingRights.blackQueenSide) castling += 'q';
  if (!castling) castling = '-';
  const ep = state.enPassantTarget
    ? `${state.enPassantTarget.file}${state.enPassantTarget.rank}`
    : '-';
  return `${rows.join('/')} ${turn} ${castling} ${ep} ${state.halfMoveClock} ${state.fullMoveNumber}`;
}

export function AnalysisBoard() {
  const { t } = useTranslation();
  const engine = useMemo(() => new ChessEngine(), []);
  const [state, setState] = useState<ChessState | null>(() =>
    parseFullFen(INITIAL_FEN),
  );
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<BoardPosition | null>(
    null,
  );
  const [eval_, setEval] = useState<{
    cp: number | null;
    mate: number | null;
    pv: string[];
    depth: number;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fenInput, setFenInput] = useState(INITIAL_FEN);
  const [flipBoard, setFlipBoard] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: BoardPosition;
    to: BoardPosition;
  } | null>(null);

  const legalMoves = useMemo(
    () => (state ? getLegalMoves(state, state.currentTurnColor) : []),
    [state],
  );

  const analyzeCurrentPosition = useCallback(async (position: ChessState) => {
    setAnalyzing(true);
    try {
      const result = await analyzePositionWithStockfish(
        boardToFen(position),
        18,
        2000,
      );
      if (result)
        setEval({ cp: result.cp, mate: result.mate, pv: result.pv, depth: 18 });
    } catch {
      setEval(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const loadFen = useCallback(() => {
    const parsed = parseFullFen(fenInput);
    if (parsed) {
      setState(parsed);
      setMoveHistory([]);
      setSelectedSquare(null);
      setEval(null);
      setPendingPromotion(null);
      analyzeCurrentPosition(parsed);
    }
  }, [fenInput, analyzeCurrentPosition]);

  const makeMove = useCallback(
    (
      fromFile: File,
      fromRank: Rank,
      toFile: File,
      toRank: Rank,
      promotion?: PieceType,
    ) => {
      if (!state) return false;
      const move = legalMoves.find(
        (m) =>
          m.from.file === fromFile &&
          m.from.rank === fromRank &&
          m.to.file === toFile &&
          m.to.rank === toRank,
      );
      if (!move) return false;
      const result = engine.executeAction(
        state,
        'move',
        {
          userId: 'analysis',
          roomId: 'analysis',
          sessionId: 'analysis',
          timestamp: new Date(),
        },
        { fromFile, fromRank, toFile, toRank, promotion },
      );
      if (result.success && result.state) {
        setState(result.state);
        setMoveHistory((h) => [...h, move.notation]);
        analyzeCurrentPosition(result.state);
        return true;
      }
      return false;
    },
    [state, legalMoves, engine, analyzeCurrentPosition],
  );

  const handleSquareClick = useCallback(
    (file: File, rank: Rank) => {
      if (!state) return;
      if (selectedSquare) {
        if (
          legalMoves.some(
            (m) =>
              m.from.file === selectedSquare.file &&
              m.from.rank === selectedSquare.rank &&
              m.to.file === file &&
              m.to.rank === rank,
          )
        ) {
          const piece =
            state.board[8 - selectedSquare.rank]?.[
              FILES.indexOf(selectedSquare.file)
            ];
          const isPromotion =
            piece?.type === 'pawn' &&
            ((piece!.color === 'white' && selectedSquare.rank === 7) ||
              (piece!.color === 'black' && selectedSquare.rank === 2)) &&
            ((rank === 8 && piece!.color === 'white') ||
              (rank === 1 && piece!.color === 'black'));
          if (isPromotion) {
            setPendingPromotion({ from: selectedSquare, to: { file, rank } });
            setSelectedSquare(null);
            return;
          }
          makeMove(selectedSquare.file, selectedSquare.rank, file, rank);
          setSelectedSquare(null);
          return;
        }
        if (state.board[8 - rank]?.[FILES.indexOf(file)]) {
          setSelectedSquare({ file, rank });
          return;
        }
        setSelectedSquare(null);
        return;
      }
      if (state.board[8 - rank]?.[FILES.indexOf(file)])
        setSelectedSquare({ file, rank });
    },
    [state, selectedSquare, legalMoves, makeMove],
  );

  const handlePromotionSelect = useCallback(
    (pieceType: PieceType) => {
      if (!pendingPromotion || !state) return;
      makeMove(
        pendingPromotion.from.file,
        pendingPromotion.from.rank,
        pendingPromotion.to.file,
        pendingPromotion.to.rank,
        pieceType,
      );
      setPendingPromotion(null);
    },
    [pendingPromotion, state, makeMove],
  );

  const handleUndo = useCallback(() => {
    if (!state || state.positionHistory.length < 2) return;
    const parsed = parseFullFen(
      state.positionHistory[state.positionHistory.length - 2],
    );
    if (parsed) {
      setState(parsed);
      setMoveHistory((h) => h.slice(0, -1));
      setSelectedSquare(null);
      setPendingPromotion(null);
      analyzeCurrentPosition(parsed);
    }
  }, [state, analyzeCurrentPosition]);

  const resetBoard = useCallback(() => {
    const parsed = parseFullFen(INITIAL_FEN);
    if (parsed) {
      setState(parsed);
      setFenInput(INITIAL_FEN);
      setMoveHistory([]);
      setSelectedSquare(null);
      setEval(null);
      setPendingPromotion(null);
      analyzeCurrentPosition(parsed);
    }
  }, [analyzeCurrentPosition]);

  const initRef = useRef(true);
  useEffect(() => {
    if (initRef.current && state) {
      initRef.current = false;
      analyzeCurrentPosition(state);
    }
  }, [state, analyzeCurrentPosition]);

  const lastMove = useMemo(() => {
    const h = state?.moveHistory;
    return h?.length
      ? { from: h[h.length - 1].from, to: h[h.length - 1].to }
      : null;
  }, [state?.moveHistory]);

  const kingPosition = useMemo(() => {
    if (!state) return null;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p?.type === 'king' && p.color === state.currentTurnColor)
          return { file: FILES[c], rank: (8 - r) as Rank };
      }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.board, state?.currentTurnColor]);

  const isCheck = state?.isCheck ?? false;
  const evalCp =
    eval_?.cp ?? (eval_?.mate != null ? (eval_.mate > 0 ? 10000 : -10000) : 0);
  const evalPercent = useMemo(
    () => 50 + (Math.max(-1000, Math.min(1000, evalCp)) / 1000) * 50,
    [evalCp],
  );
  const evalLabel =
    eval_?.mate != null
      ? `M${Math.abs(eval_.mate)}`
      : eval_ != null
        ? `${(evalCp / 100).toFixed(1)}`
        : '—';

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1100px] mx-auto p-4">
      <div className="flex flex-col gap-3 flex-none lg:w-[min(60vmin,480px)]">
        <h2 className="text-lg font-bold text-[var(--text)]">
          {t('games.chess_v1.name')} Analysis
        </h2>
        <div
          className="flex gap-1 items-stretch"
          style={{ maxWidth: 'min(60vmin, 480px)' }}
        >
          <AnalysisBoardGrid
            board={state?.board ?? []}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            kingPosition={kingPosition}
            isCheck={isCheck}
            pendingPromotion={pendingPromotion}
            flipBoard={flipBoard}
            onSquareClick={handleSquareClick}
          />
          <div className="flex flex-col w-6 rounded-lg overflow-hidden ml-1">
            <div className="relative flex-1 bg-[#333] rounded-lg overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-[#f0f0f0] transition-all duration-300"
                style={{ height: `${evalPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white mix-blend-difference">
                  {evalLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--textSecondary)]">
          <span
            className={`w-2 h-2 rounded-full ${analyzing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}
          />
          {analyzing ? 'Analyzing...' : `Depth ${eval_?.depth ?? 0}`}
          {eval_?.pv?.[0] && (
            <span className="ml-2 font-mono opacity-70">
              Best: {eval_.pv[0]}
            </span>
          )}
        </div>
      </div>
      <AnalysisSidebar
        fenInput={fenInput}
        onFenInputChange={setFenInput}
        onLoadFen={loadFen}
        onFlipBoard={() => setFlipBoard((f) => !f)}
        onReset={resetBoard}
        onUndo={handleUndo}
        canUndo={(state?.positionHistory.length ?? 0) >= 2}
        eval_={eval_}
        analyzing={analyzing}
        moveHistory={moveHistory}
        currentTurnColor={state?.currentTurnColor ?? 'white'}
        onCopyFen={() => {
          if (state) navigator.clipboard.writeText(boardToFen(state));
        }}
        fenOutput={state ? boardToFen(state) : ''}
      />
      {pendingPromotion && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPendingPromotion(null)}
        >
          <div
            className="bg-[var(--background)] rounded-xl p-4 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(
              (pt) => (
                <button
                  key={pt}
                  onClick={() => handlePromotionSelect(pt)}
                  className="w-14 h-14 flex items-center justify-center rounded-lg hover:bg-[var(--backgroundHover)] text-3xl transition-colors"
                >
                  {
                    PIECE_SYMBOLS[pt as keyof typeof PIECE_SYMBOLS][
                      state?.currentTurnColor ?? 'white'
                    ]
                  }
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
