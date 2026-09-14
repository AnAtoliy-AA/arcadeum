'use client';

import { memo, useState, useMemo } from 'react';
import { Button } from '@arcadeum/ui';
import { MoveList } from './MoveList';
import {
  MoveAccuracySummary,
  computePlayerAccuracy,
} from './MoveAccuracySummary';
import { ChessSettingsPanel } from './ChessSettingsPanel';
import { CoachControls } from '@/features/coach/ui/CoachControls';
import { OpeningExplorer } from '@/features/analysis/ui/OpeningExplorer';
import { analyzeGame } from '@/features/analysis/lib/analyzeGame';
import { detectOpening } from '../lib/eco-openings';
import type { ChessPieceStyle } from '../lib/piece-style';
import type { UseChessCoachResult } from '../hooks/useChessCoach';
import type { ChessClientState } from '../types';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

type TranslateFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

interface ChessGameConsoleProps {
  snapshot: ChessClientState;
  myColor: 'white' | 'black' | null;
  isGameOver: boolean;
  isSpectator: boolean;
  currentUserId: string | null;
  coach: UseChessCoachResult;
  pieceStyle?: ChessPieceStyle;
  onSelectPieceStyle?: (style: ChessPieceStyle) => void;
  liveEval?: {
    cp: number | null;
    mate: number | null;
    pv: string[];
    depth: number;
    selDepth: number;
    nodes: number;
    nps: number;
    timeMs: number;
  } | null;
  liveEvalAnalyzing?: boolean;
  moveCandidates?: Array<{
    move: string;
    cp: number | null;
    mate: number | null;
    pv: string[];
  }> | null;
  confirmMoves?: boolean;
  t: TranslateFn;
  onMoveHover?: (idx: number | null) => void;
  onOfferDraw: () => void;
  onResign: () => void;
  onAcceptDraw: () => void;
  onOfferTakeback: () => void;
  onAcceptTakeback: () => void;
  onDeclineTakeback: () => void;
  onFlipBoard?: () => void;
  onExportPgn?: () => void;
  onToggleConfirmMoves?: () => void;
  isAdmin?: boolean;
  showBestMove?: boolean;
  showThreats?: boolean;
  onToggleBestMove?: () => void;
  onToggleThreats?: () => void;
}

function formatNodes(nodes: number | null | undefined): string {
  if (!nodes) return '—';
  if (nodes >= 1_000_000) return `${(nodes / 1_000_000).toFixed(1)}M`;
  if (nodes >= 1_000) return `${Math.round(nodes / 1_000)}k`;
  return String(nodes);
}

function formatNps(nps: number | null | undefined): string {
  if (!nps) return '—';
  if (nps >= 1_000_000) return `${(nps / 1_000_000).toFixed(1)}M n/s`;
  if (nps >= 1_000) return `${Math.round(nps / 1_000)}k n/s`;
  return `${nps} n/s`;
}

function ChessGameConsoleImpl({
  snapshot,
  myColor,
  isGameOver,
  isSpectator,
  currentUserId,
  coach,
  pieceStyle = 'neo',
  onSelectPieceStyle,
  liveEval,
  liveEvalAnalyzing: _liveEvalAnalyzing,
  moveCandidates,
  confirmMoves,
  t,
  onMoveHover,
  onOfferDraw,
  onResign,
  onAcceptDraw,
  onOfferTakeback,
  onAcceptTakeback,
  onDeclineTakeback,
  onFlipBoard,
  onExportPgn,
  onToggleConfirmMoves,
  isAdmin = false,
  showBestMove = false,
  showThreats = false,
  onToggleBestMove,
  onToggleThreats,
}: ChessGameConsoleProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'settings'>('game');
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(
    null,
  );

  const gameAnalysis = useMemo(() => {
    if (!isGameOver || snapshot.positionHistory.length < 2) return null;
    const notations = snapshot.moveHistory.map((m) => m.notation);
    return analyzeGame(snapshot.positionHistory, notations);
  }, [isGameOver, snapshot.positionHistory, snapshot.moveHistory]);

  const moveQualities = useMemo(
    () => gameAnalysis?.moves.map((m) => m.quality),
    [gameAnalysis],
  );

  const openingName = useMemo(
    () => detectOpening(snapshot.positionHistory),
    [snapshot.positionHistory],
  );

  const whiteAccuracy = useMemo(
    () =>
      gameAnalysis ? computePlayerAccuracy(gameAnalysis.moves, 'white') : null,
    [gameAnalysis],
  );

  const blackAccuracy = useMemo(
    () =>
      gameAnalysis ? computePlayerAccuracy(gameAnalysis.moves, 'black') : null,
    [gameAnalysis],
  );

  const hasDrawOffer = !!snapshot.drawOfferedBy;
  const isMyDrawOffer = snapshot.drawOfferedBy === currentUserId;
  const hasTakebackOffer = !!snapshot.takebackOfferedBy;
  const isMyTakebackOffer = snapshot.takebackOfferedBy === currentUserId;

  const currentFen =
    snapshot.positionHistory && snapshot.positionHistory.length > 0
      ? snapshot.positionHistory[snapshot.positionHistory.length - 1]
      : null;

  const evalLabel =
    liveEval?.mate != null
      ? `M${Math.abs(liveEval.mate)}`
      : liveEval?.cp != null
        ? `${liveEval.cp > 0 ? '+' : ''}${(liveEval.cp / 100).toFixed(1)}`
        : '0.0';

  const bestCandidate =
    moveCandidates?.[0] ??
    (liveEval?.pv?.[0] ? { move: liveEval.pv[0], cp: liveEval.cp } : null);

  const depthDisplay = liveEval?.depth
    ? `d${liveEval.depth}${liveEval.selDepth ? `/${liveEval.selDepth}` : ''}`
    : 'd18';

  const continuationLine =
    liveEval?.pv && liveEval.pv.length > 0
      ? liveEval.pv.slice(0, 5).join(' ')
      : null;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-xl shadow-xl overflow-hidden min-w-0">
      <div className="chess-console-header flex items-center gap-1.5 p-2 border-b border-[var(--glassBorder)] bg-black/25">
        <button
          type="button"
          onClick={() => setActiveTab('game')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'game'
              ? 'bg-white/15 text-white shadow-sm border border-white/10'
              : 'text-[var(--textSecondary)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Game & Engine
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'settings'
              ? 'bg-white/15 text-white shadow-sm border border-white/10'
              : 'text-[var(--textSecondary)] hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Tools & Settings
        </button>
      </div>

      <div className="chess-console-body">
        {activeTab === 'game' && (
          <div className="flex flex-col gap-2.5 shrink-0">
            <div className="chess-telemetry-card shrink-0 flex flex-col gap-1.5 p-2 rounded-xl bg-black/30 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black px-1.5 py-0.5 rounded ${
                      liveEval?.cp && liveEval.cp > 50
                        ? 'bg-emerald-500/25 text-emerald-300'
                        : liveEval?.cp && liveEval.cp < -50
                          ? 'bg-red-500/25 text-red-300'
                          : 'bg-white/10 text-zinc-200'
                    }`}
                  >
                    {evalLabel}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--textSecondary)] bg-white/5 px-1.5 py-0.5 rounded">
                    {depthDisplay}
                  </span>
                </div>

                {bestCandidate && (
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <span className="text-[9px] text-[var(--textSecondary)] opacity-85">
                      Best:
                    </span>
                    <span className="font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-400/30">
                      {bestCandidate.move}
                    </span>
                  </div>
                )}
              </div>

              <div className="chess-telemetry-metrics flex items-center justify-between text-[9px] font-mono text-[var(--textSecondary)] pt-1 border-t border-white/5">
                <span title="Nodes Evaluated">
                  Nodes: {formatNodes(liveEval?.nodes)}
                </span>
                <span title="Nodes per second">
                  Speed: {formatNps(liveEval?.nps)}
                </span>
                {liveEval?.timeMs ? <span>{liveEval.timeMs}ms</span> : null}
              </div>

              {continuationLine && (
                <div className="chess-telemetry-line text-[10px] font-mono text-[var(--textSecondary)] bg-black/40 px-2 py-1 rounded border border-white/5 truncate">
                  <span className="text-zinc-400 font-bold mr-1">Line:</span>
                  <span className="text-zinc-300">{continuationLine}</span>
                </div>
              )}
            </div>

            <MoveList
              state={snapshot}
              t={t}
              onMoveHover={onMoveHover}
              onSelectMove={setSelectedMoveIndex}
              selectedMoveIndex={selectedMoveIndex}
              openingName={openingName}
              moveQualities={moveQualities}
            />

            {whiteAccuracy && blackAccuracy && (
              <MoveAccuracySummary
                white={whiteAccuracy}
                black={blackAccuracy}
                myColor={myColor}
              />
            )}

            {moveCandidates && moveCandidates.length > 1 && (
              <div className="chess-candidate-lines shrink-0 p-2 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1 font-mono text-[11px]">
                <span className="text-[9px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
                  Top Candidate Lines
                </span>
                {moveCandidates.slice(0, 3).map((alt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-0.5 text-xs"
                  >
                    <span className="text-[var(--color)] font-bold">
                      {alt.move}
                    </span>
                    <span className="text-[var(--textSecondary)]">
                      {alt.mate !== null
                        ? `M${alt.mate}`
                        : alt.cp !== null
                          ? `${alt.cp > 0 ? '+' : ''}${(alt.cp / 100).toFixed(1)}`
                          : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {currentFen && (
              <div className="chess-opening-explorer shrink-0">
                <OpeningExplorer fen={currentFen} />
              </div>
            )}

            {coach.visible && (
              <div className="shrink-0">
                <CoachControls
                  enabled={coach.enabled}
                  hintAvailable={coach.hintAvailable}
                  hint={coach.hint}
                  onToggle={coach.toggleEnabled}
                  onHint={coach.requestHint}
                  t={t}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <ChessSettingsPanel
            pieceStyle={pieceStyle}
            onSelectPieceStyle={onSelectPieceStyle}
            isAdmin={isAdmin}
            showBestMove={showBestMove}
            showThreats={showThreats}
            onToggleBestMove={onToggleBestMove}
            onToggleThreats={onToggleThreats}
            onFlipBoard={onFlipBoard}
            onExportPgn={onExportPgn}
            onToggleConfirmMoves={onToggleConfirmMoves}
            confirmMoves={confirmMoves}
          />
        )}
      </div>

      {!isSpectator && !isGameOver && (
        <div className="p-2.5 border-t border-[var(--glassBorder)] bg-black/25 flex flex-col gap-2 shrink-0">
          {hasTakebackOffer && !isMyTakebackOffer && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={onAcceptTakeback}
              >
                Accept Takeback
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={onDeclineTakeback}
              >
                Decline
              </Button>
            </div>
          )}

          {hasDrawOffer && !isMyDrawOffer && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={onAcceptDraw}
            >
              Accept Draw
            </Button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={hasTakebackOffer}
              onClick={onOfferTakeback}
            >
              Takeback
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={hasDrawOffer}
              onClick={onOfferDraw}
            >
              Draw
            </Button>
            <Button variant="outline" size="sm" onClick={onResign}>
              Resign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ChessGameConsole = memo(ChessGameConsoleImpl);
