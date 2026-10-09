'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  GlassCard,
  CountdownClock,
} from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { BracketView } from './BracketView';
import type {
  PublicTournamentItem,
  TournamentBracketView,
  SeaBattleBlitzCaptain,
} from '../api';
import type { SeaBattleBlitzBannerLabels } from './SeaBattleBlitzBanner';

export type BlitzModalTab = 'bracket' | 'roster' | 'intel';

export interface SeaBattleBlitzModalProps {
  open: boolean;
  onClose: () => void;
  tournament: PublicTournamentItem;
  bracket: TournamentBracketView | null;
  captains?: SeaBattleBlitzCaptain[];
  labels: SeaBattleBlitzBannerLabels;
  locale: string;
  isAuthenticated: boolean;
  canRegister: boolean;
  isPending: boolean;
  onRegister: () => void;
  onUnregister: () => void;
}

export function SeaBattleBlitzModal({
  open,
  onClose,
  tournament,
  bracket,
  captains = [],
  labels,
  locale,
  isAuthenticated,
  canRegister,
  isPending,
  onRegister,
  onUnregister,
}: SeaBattleBlitzModalProps) {
  const [activeTab, setActiveTab] = useState<BlitzModalTab>('bracket');

  const isLive = tournament.effectiveStatus === 'live';
  const isFull = tournament.registeredCount >= tournament.maxPlayers;
  const hasBracketRounds = Boolean(
    bracket?.rounds && bracket.rounds.length > 0,
  );

  const bracketLabels: Record<string, string> = {
    tbd: 'TBD',
    winner: 'Winner',
    'round-0': 'Quarterfinals',
    'round-1': 'Semifinals',
    'round-2': 'Grand Final',
    'round-3': 'Championship',
  };

  const rosterSubtitle = labels.rosterSubtitle
    .replace('{count}', String(tournament.registeredCount))
    .replace('{max}', String(tournament.maxPlayers));

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent
        maxWidth={780}
        data-testid="sea-battle-blitz-modal"
        className="border-cyan-500/30 bg-slate-950/95 text-slate-100 shadow-2xl shadow-cyan-950/50"
      >
        <ModalHeader
          onClose={onClose}
          className="border-cyan-500/20 bg-slate-900/60 pb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="trophy">
              🏆
            </span>
            <div>
              <ModalTitle className="text-lg md:text-xl font-black text-cyan-300">
                {tournament.name || labels.modalTitle}
              </ModalTitle>
              <div className="flex items-center gap-2 mt-1">
                {isLive ? (
                  <span
                    data-testid="blitz-modal-status-live"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {labels.statusLive}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest text-cyan-400/80 font-bold">
                    {labels.kicker}
                  </span>
                )}
                <span className="h-1 w-1 rounded-full bg-cyan-500" />
                <span className="text-xs text-slate-400">
                  {tournament.prizeDescription ?? '500 Coins + Admiral Trophy'}
                </span>
              </div>
            </div>
          </div>
        </ModalHeader>

        <div className="flex border-b border-cyan-500/20 bg-slate-900/40 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('bracket')}
            data-testid="blitz-tab-bracket"
            className={cx(
              'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px',
              activeTab === 'bracket'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            ⚔️ {labels.tabBracket}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            data-testid="blitz-tab-roster"
            className={cx(
              'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === 'roster'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            <span>⚓ {labels.tabRoster}</span>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-300 border border-cyan-500/30">
              {tournament.registeredCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('intel')}
            data-testid="blitz-tab-intel"
            className={cx(
              'px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px',
              activeTab === 'intel'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            📜 {labels.tabIntel}
          </button>
        </div>

        <ModalBody className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'bracket' && (
            <div data-testid="blitz-modal-bracket-section">
              {hasBracketRounds && bracket ? (
                <BracketView bracket={bracket} labels={bracketLabels} />
              ) : (
                <div
                  data-testid="blitz-bracket-pending"
                  className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-cyan-500/20 bg-slate-900/50"
                >
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-950/40">
                    <span className="text-2xl animate-spin">🧭</span>
                    <span className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
                  </div>
                  <h3 className="text-base font-black text-cyan-300 mb-2">
                    {labels.bracketPendingTitle}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                    {labels.bracketPendingDesc}
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-2 text-xs font-semibold text-cyan-300">
                    <span>⏱️ {labels.startsIn}:</span>
                    <CountdownClock
                      targetIso={tournament.scheduledAt}
                      variant="compact"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roster' && (
            <div data-testid="blitz-modal-roster-section" className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  {labels.rosterTitle}
                </span>
                <span className="text-xs text-slate-400">{rosterSubtitle}</span>
              </div>

              {captains.length === 0 ? (
                <div
                  data-testid="blitz-roster-empty"
                  className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-6 text-center text-xs text-slate-400"
                >
                  {labels.rosterEmpty}
                </div>
              ) : (
                <div
                  data-testid="blitz-roster-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {captains.map((cap) => (
                    <GlassCard
                      key={cap.userId}
                      animated={false}
                      className={cx(
                        'flex items-center justify-between p-3 rounded-xl border',
                        tournament.isRegistered && cap.userId === tournament.id
                          ? 'border-cyan-400/50 bg-cyan-950/40'
                          : 'border-cyan-500/20 bg-slate-900/50',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-300 text-xs font-black border border-cyan-500/30">
                          {cap.seed}
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-200">
                            {cap.displayName ||
                              labels.captainSeed.replace(
                                '{seed}',
                                String(cap.seed),
                              )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {cap.userId.slice(0, 8)}
                          </span>
                        </div>
                      </div>

                      {cap.waitlist ? (
                        <span className="rounded bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          {labels.rosterWaitlist}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold">
                          ✓
                        </span>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'intel' && (
            <div
              data-testid="blitz-modal-intel-section"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <span>🎯</span>
                  <span>{labels.intelFormat}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {labels.intelFormatDesc}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <span>🚢</span>
                  <span>{labels.intelFleet}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {labels.intelFleetDesc}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <span>⏱️</span>
                  <span>{labels.intelClock}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {labels.intelClockDesc}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <span>🏆</span>
                  <span>{labels.intelRewards}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {labels.intelRewardsDesc}
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="flex items-center justify-between border-t border-cyan-500/20 bg-slate-900/60 p-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-xs text-slate-400">
                {labels.signInNotice}
              </span>
            ) : tournament.isRegistered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onUnregister}
                disabled={isPending}
                data-testid="blitz-modal-unregister-btn"
              >
                {labels.leaveCup}
              </Button>
            ) : canRegister ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onRegister}
                disabled={isPending}
                data-testid="blitz-modal-register-btn"
              >
                {labels.registerCup}
              </Button>
            ) : isFull ? (
              <span className="text-xs text-amber-400 font-bold">
                {labels.tournamentFull}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/tournaments/${tournament.id}`}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              data-testid="blitz-modal-fullpage-link"
            >
              {labels.fullPageView}
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              data-testid="blitz-modal-close-btn"
            >
              {labels.closeModal}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
