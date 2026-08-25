import { GlassCard } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import type { BracketMatchView, TournamentBracketView } from '../api';

export interface BracketViewProps {
  bracket: TournamentBracketView;
  /** Localized strings. Keys used: `round-{index}`, `tbd`, `winner`. */
  labels: Record<string, string>;
}

function shortId(id: string): string {
  return `${id.slice(0, 6)}…`;
}

export function BracketView({ bracket, labels }: BracketViewProps) {
  const tbd = labels.tbd ?? 'TBD';

  return (
    <div className="box-border overflow-x-auto pb-2" data-testid="bracket-view">
      <div className="flex flex-row items-stretch gap-6">
        {bracket.rounds.map((round, r) => (
          <div
            key={r}
            className="flex flex-col items-stretch gap-3 min-w-[180px] flex-1"
            data-testid={`bracket-round-${r}`}
          >
            <span className="text-[12px] font-bold uppercase tracking-wide opacity-[0.7]">
              {labels[`round-${r}`] ?? `Round ${r + 1}`}
            </span>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {round.map((match, m) => (
                <MatchCard
                  key={m}
                  match={match}
                  roundIndex={r}
                  matchIndex={m}
                  tbd={tbd}
                  winnerLabel={labels.winner}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: BracketMatchView;
  roundIndex: number;
  matchIndex: number;
  tbd: string;
  winnerLabel?: string;
}

const SLOT_BASE =
  'flex flex-row items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px]';
const SLOT_TBD = 'opacity-[0.5]';
const SLOT_WINNER =
  'bg-[var(--success)]/10 font-bold text-[var(--success)] border border-[var(--success)]/40';

function MatchCard({
  match,
  roundIndex,
  matchIndex,
  tbd,
  winnerLabel,
}: MatchCardProps) {
  const isDecided = match.winnerUserId !== null;

  return (
    <GlassCard
      animated={false}
      className={cx('gap-0 p-2', isDecided && 'border-[var(--success)]/50')}
      data-testid={`bracket-match-${roundIndex}-${matchIndex}`}
    >
      <Slot
        playerId={match.playerA}
        winnerUserId={match.winnerUserId}
        decided={isDecided}
        tbd={tbd}
      />
      <span aria-hidden className="mx-2 my-1 h-px bg-[var(--glassBorder)]" />
      <Slot
        playerId={match.playerB}
        winnerUserId={match.winnerUserId}
        decided={isDecided}
        tbd={tbd}
      />
      {isDecided && winnerLabel && match.winnerUserId && (
        <span className="mt-1 px-3 pb-1 text-[10px] uppercase tracking-wide opacity-[0.6]">
          ✓ {winnerLabel}: {shortId(match.winnerUserId)}
        </span>
      )}
    </GlassCard>
  );
}

function Slot({
  playerId,
  winnerUserId,
  decided,
  tbd,
}: {
  playerId: string | null;
  winnerUserId: string | null;
  decided: boolean;
  tbd: string;
}) {
  const isWinner = decided && playerId !== null && playerId === winnerUserId;
  return (
    <span
      className={cx(SLOT_BASE, !playerId && SLOT_TBD, isWinner && SLOT_WINNER)}
    >
      <span className="truncate">{playerId ? shortId(playerId) : tbd}</span>
      {isWinner && (
        <span aria-hidden className="text-[var(--success)]">
          ✓
        </span>
      )}
    </span>
  );
}
