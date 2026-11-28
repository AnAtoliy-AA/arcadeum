import { ARCADEUM_DECIMALS } from './arcadeum-token';

export type VerifyReason =
  | 'ok'
  | 'unconfigured'
  | 'treasury_mismatch'
  | 'not_found'
  | 'tx_failed'
  | 'too_old'
  | 'reference_missing'
  | 'no_transfer'
  | 'wrong_mint'
  | 'decimals_mismatch'
  | 'wrong_recipient'
  | 'amount_too_low'
  | 'wrong_sender'
  | 'rpc_error';

export interface VerifyResult {
  valid: boolean;
  reason: VerifyReason;
  /** Payer wallet taken from the transfer authority (set when valid). */
  sender?: string;
}

export interface VerifyOptions {
  /** Require this wallet to be the transfer authority. */
  senderAddress?: string;
  /** Require this Solana Pay reference key among the transaction accounts. */
  requiredReference?: string;
}

// Higher rank = the transfer got further through the checks, so it is the
// most useful reason to report when no transfer matches.
const REASON_RANK: Partial<Record<VerifyReason, number>> = {
  no_transfer: 0,
  wrong_mint: 1,
  decimals_mismatch: 2,
  amount_too_low: 3,
  wrong_recipient: 4,
  wrong_sender: 5,
};

interface ParsedTransferInfo {
  authority?: string;
  multisigAuthority?: string;
  destination?: string;
  destinationOwner?: string;
  mint?: string;
  tokenAmount?: { amount?: string; decimals?: number };
}

export interface MatchContext {
  mint: string;
  treasury: string;
  treasuryAtas: ReadonlySet<string>;
  expectedRaw: bigint;
  tolerancePercent: number;
  tokenProgramIds: readonly string[];
  senderAddress?: string;
}

interface ParsedTx {
  transaction: { message: { instructions?: unknown[] } };
  meta?: {
    innerInstructions?: Array<{ instructions: unknown[] }> | null;
  } | null;
}

/** Finds a qualifying ARC `transferChecked` into the treasury (pure). */
export function matchArcTransfer(
  transaction: ParsedTx,
  ctx: MatchContext,
): VerifyResult {
  const instructions = [
    ...(transaction.transaction.message.instructions ?? []),
    ...(transaction.meta?.innerInstructions?.flatMap((i) => i.instructions) ??
      []),
  ];
  // Optional slippage tolerance (default 0 = exact).
  const keepBps = BigInt(Math.round((100 - ctx.tolerancePercent) * 100));
  const minRaw = (ctx.expectedRaw * keepBps) / BigInt(10_000);

  let best: VerifyReason = 'no_transfer';
  const note = (reason: VerifyReason) => {
    if ((REASON_RANK[reason] ?? 0) > (REASON_RANK[best] ?? 0)) best = reason;
  };

  for (const ix of instructions) {
    const parsedIx = ix as {
      program?: string;
      programId?: { toBase58?: () => string };
      type?: string;
      parsed?: { type?: string; info?: ParsedTransferInfo };
    };

    const isTokenProgram =
      parsedIx.program === 'spl-token' ||
      parsedIx.program === 'spl-token-2022' ||
      (typeof parsedIx.programId?.toBase58 === 'function' &&
        ctx.tokenProgramIds.includes(parsedIx.programId.toBase58()));
    if (!isTokenProgram) continue;

    const info = parsedIx.parsed?.info;
    if (!info) continue;

    // Plain `transfer` cannot prove which token moved: rejected.
    if (
      parsedIx.parsed?.type !== 'transferChecked' &&
      parsedIx.type !== 'transferChecked'
    ) {
      continue;
    }

    if (info.mint !== ctx.mint) {
      note('wrong_mint');
      continue;
    }
    if (info.tokenAmount?.decimals !== ARCADEUM_DECIMALS) {
      note('decimals_mismatch');
      continue;
    }
    if (BigInt(info.tokenAmount?.amount ?? '0') < minRaw) {
      note('amount_too_low');
      continue;
    }
    const toTreasury =
      ctx.treasuryAtas.has(info.destination ?? '') ||
      info.destinationOwner === ctx.treasury;
    if (!toTreasury) {
      note('wrong_recipient');
      continue;
    }
    const authority = info.authority ?? info.multisigAuthority ?? '';
    if (ctx.senderAddress && authority !== ctx.senderAddress) {
      note('wrong_sender');
      continue;
    }
    return { valid: true, reason: 'ok', sender: authority };
  }
  return { valid: false, reason: best };
}
