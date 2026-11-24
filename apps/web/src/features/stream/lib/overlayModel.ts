import { BOT_PERSONALITIES } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';

/**
 * Pure translation of a room + session snapshot into what the broadcast
 * overlay shows. Kept free of React and i18n so it can be unit tested for
 * every supported game: it returns data and stat keys, the component turns
 * them into text.
 *
 * Only public information is read (names, scores, captures, whose turn).
 * Private hands are never surfaced, only their size.
 */

export type StreamPhase = 'waiting' | 'active' | 'finished';

export type OverlayStatKey =
  'captured' | 'piecesLeft' | 'borneOff' | 'cards' | 'tokensHome' | 'bid';

export interface OverlayStat {
  key: OverlayStatKey;
  value: number | string;
}

export type OverlayPersonality =
  | { kind: 'chess'; name: string; rating: number; style: string }
  | { kind: 'difficulty'; level: string }
  | null;

export interface OverlayPlayer {
  id: string;
  name: string;
  isBot: boolean;
  personality: OverlayPersonality;
  active: boolean;
  isWinner: boolean;
  /** Headline score (points, stones captured...). Null when the game has none. */
  score: number | null;
  stats: OverlayStat[];
  /** Captured piece glyphs (chess), already ordered by value. */
  capturedGlyphs: string;
  /** Side colour or symbol hint, e.g. `white`, `X`. */
  side: string | null;
}

export interface OverlayModel {
  gameId: string;
  phase: StreamPhase;
  outcome: { kind: 'none' | 'win' | 'draw'; winnerNames: string[] };
  players: OverlayPlayer[];
  /** Best-effort move/turn counter, null when the game has none. */
  moveCount: number | null;
  /** Stable token that changes whenever the position changes. */
  progressToken: string;
}

type Rec = Record<string, unknown>;

function rec(value: unknown): Rec | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Rec) // narrowed by the typeof/null/array checks above
    : null;
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const CHESS_GLYPH: Record<string, { glyph: string; value: number }> = {
  queen: { glyph: '♛', value: 9 },
  rook: { glyph: '♜', value: 5 },
  bishop: { glyph: '♝', value: 3 },
  knight: { glyph: '♞', value: 3 },
  pawn: { glyph: '♟', value: 1 },
};

function chessCaptures(state: Rec): {
  byColor: Record<string, string>;
  material: Record<string, number>;
} {
  const byColor: Record<string, string[]> = { white: [], black: [] };
  const material: Record<string, number> = { white: 0, black: 0 };
  for (const entry of arr(state.moveHistory)) {
    const move = rec(entry);
    const piece = rec(move?.piece);
    const captured = rec(move?.captured);
    const mover = str(piece?.color);
    const type = str(captured?.type);
    if (!mover || !type || !byColor[mover]) continue;
    const info = CHESS_GLYPH[type];
    if (!info) continue;
    byColor[mover].push(type);
    material[mover] += info.value;
  }
  const sorted: Record<string, string> = {};
  for (const color of Object.keys(byColor)) {
    sorted[color] = byColor[color]
      .sort((a, b) => CHESS_GLYPH[b].value - CHESS_GLYPH[a].value)
      .map((t) => CHESS_GLYPH[t].glyph)
      .join('');
  }
  return { byColor: sorted, material };
}

function personalityFor(
  gameId: string,
  options: Rec | null,
  side: string | null,
): OverlayPersonality {
  if (gameId === 'chess_v1') {
    const id =
      side === 'black'
        ? str(options?.botPersonalityBlack)
        : str(options?.botPersonalityWhite);
    const found = id ? BOT_PERSONALITIES.find((p) => p.id === id) : undefined;
    if (found) {
      return {
        kind: 'chess',
        name: found.name,
        rating: found.rating,
        style: found.style,
      };
    }
  }
  const level = str(options?.botDifficulty) ?? str(options?.aiDifficulty);
  return level ? { kind: 'difficulty', level } : null;
}

function isFinishedState(
  room: GameRoomSummary | null,
  session: GameSessionSummary | null,
  state: Rec,
): boolean {
  if (session?.status === 'completed') return true;
  if (room?.status === 'completed') return true;
  if (state.gameOver === true) return true;
  const phase = str(state.phase)?.toLowerCase();
  if (phase && ['finished', 'ended', 'game_over', 'completed'].includes(phase))
    return true;
  return !!rec(state.gameResult);
}

function winnerIdsOf(state: Rec, players: Rec[]): string[] {
  const ids = new Set<string>();
  const result = rec(state.gameResult);
  for (const id of arr(result?.winnerIds)) {
    const s = str(id);
    if (s) ids.add(s);
  }
  const single = str(state.winnerId) ?? str(state.winner);
  if (single) ids.add(single);
  for (const id of arr(state.winnerIds)) {
    const s = str(id);
    if (s) ids.add(s);
  }
  const color = str(state.winnerColor);
  if (color) {
    for (const p of players) {
      if (p.color === color) {
        const id = str(p.playerId);
        if (id) ids.add(id);
      }
    }
  }
  return [...ids];
}

function currentPlayerId(state: Rec, players: Rec[]): string | null {
  const order = arr(state.playerOrder).map(str);
  const idx = num(state.currentTurnIndex) ?? num(state.currentPlayerIndex);
  if (idx !== null && order.length > 0) {
    // Team modes index teams, not players; only trust a player id.
    const id = order[idx % order.length];
    if (id && players.some((p) => p.playerId === id)) return id;
  }
  const color = str(state.currentTurnColor);
  if (color) {
    const p = players.find((pl) => pl.color === color);
    if (p) return str(p.playerId);
  }
  if (idx !== null && players[idx]) return str(players[idx].playerId);
  return str(state.currentPlayerId);
}

function moveCountOf(state: Rec): number | null {
  // Only games that keep a move list report a counter; a hand or turn number
  // would be mislabelled as "moves".
  const history = state.moveHistory;
  return Array.isArray(history) ? history.length : null;
}

function sideOf(p: Rec): string | null {
  return str(p.color) ?? str(p.symbol) ?? null;
}

function buildStats(
  gameId: string,
  state: Rec,
  p: Rec,
  id: string,
  chess: ReturnType<typeof chessCaptures> | null,
): { score: number | null; stats: OverlayStat[]; glyphs: string } {
  const stats: OverlayStat[] = [];
  let score: number | null = null;
  let glyphs = '';
  const scores = rec(state.scores);

  switch (gameId) {
    case 'chess_v1': {
      const color = str(p.color);
      if (chess && color) {
        glyphs = chess.byColor[color] ?? '';
        const other = color === 'white' ? 'black' : 'white';
        const lead =
          (chess.material[color] ?? 0) - (chess.material[other] ?? 0);
        score = lead > 0 ? lead : null;
      }
      break;
    }
    case 'checkers_v1': {
      const left = num(p.piecesRemaining);
      if (left !== null) stats.push({ key: 'piecesLeft', value: left });
      break;
    }
    case 'go_v1': {
      const color = str(p.color);
      const captures = rec(state.captures);
      const c = color ? num(captures?.[color]) : null;
      if (c !== null) {
        score = c;
        stats.push({ key: 'captured', value: c });
      }
      break;
    }
    case 'backgammon_v1': {
      const off = num(rec(state.borneOff)?.[id]) ?? num(p.borneOff);
      if (off !== null) stats.push({ key: 'borneOff', value: off });
      break;
    }
    case 'hearts_v1':
    case 'spades_v1': {
      score = num(scores?.[id]);
      const hand = arr(rec(state.hands)?.[id]).length;
      if (hand > 0) stats.push({ key: 'cards', value: hand });
      if (gameId === 'spades_v1') {
        const bid = rec(state.bids)?.[id];
        if (typeof bid === 'number') stats.push({ key: 'bid', value: bid });
      }
      break;
    }
    case 'pachisi_v1': {
      const tokens = arr(rec(state.tokens)?.[id]);
      const home = tokens.filter((t) => num(rec(t)?.progress) === 56).length;
      stats.push({ key: 'tokensHome', value: home });
      break;
    }
    case 'cascade_v1': {
      // Only the size of the hand, never the cards.
      const hand = arr(p.hand).length;
      if (hand > 0) stats.push({ key: 'cards', value: hand });
      break;
    }
    default:
      break;
  }
  return { score, stats, glyphs };
}

/** Compact token that changes whenever the position changes. */
function progressTokenOf(
  session: GameSessionSummary | null,
  state: Rec,
): string {
  const moves = moveCountOf(state);
  const logs = arr(state.logs).length;
  return `${session?.updatedAt ?? ''}|${moves ?? ''}|${logs}`;
}

export function buildOverlayModel(
  room: GameRoomSummary | null,
  session: GameSessionSummary | null,
): OverlayModel | null {
  const gameId = room?.gameId ?? session?.gameId;
  if (!gameId) return null;

  const state = rec(session?.state) ?? {};
  const options = rec(room?.gameOptions);
  const statePlayers = arr(state.players)
    .map(rec)
    .filter((p): p is Rec => p !== null);
  const members = room?.members ?? [];

  const finished = isFinishedState(room, session, state);
  const hasState = !!session && statePlayers.length > 0;
  const phase: StreamPhase = finished
    ? 'finished'
    : hasState || room?.status === 'in_progress'
      ? 'active'
      : 'waiting';

  const winners = finished ? winnerIdsOf(state, statePlayers) : [];
  const turnId =
    phase === 'active' ? currentPlayerId(state, statePlayers) : null;
  const chess = gameId === 'chess_v1' ? chessCaptures(state) : null;

  const rows: Array<{ id: string; p: Rec }> = hasState
    ? statePlayers.flatMap((p) => {
        const id = str(p.playerId);
        return id ? [{ id, p }] : [];
      })
    : members.map((m) => ({ id: m.id, p: {} as Rec }));

  const players: OverlayPlayer[] = rows.map(({ id, p }, index) => {
    const member = members.find((m) => m.id === id);
    const isBot = id.startsWith('bot-') || !member;
    const side = sideOf(p);
    const { score, stats, glyphs } = buildStats(gameId, state, p, id, chess);
    return {
      id,
      name: member?.displayName || `Bot ${index + 1}`,
      isBot,
      personality: isBot ? personalityFor(gameId, options, side) : null,
      active: id === turnId,
      isWinner: winners.includes(id),
      score,
      stats,
      capturedGlyphs: glyphs,
      side,
    };
  });

  const winnerNames = players.filter((pl) => pl.isWinner).map((pl) => pl.name);
  const isDraw =
    finished &&
    (state.isDraw === true || rec(state.gameResult)?.isDraw === true) &&
    winnerNames.length === 0;

  return {
    gameId,
    phase,
    outcome: isDraw
      ? { kind: 'draw', winnerNames: [] }
      : winnerNames.length > 0
        ? { kind: 'win', winnerNames }
        : { kind: 'none', winnerNames: [] },
    players,
    moveCount: moveCountOf(state),
    progressToken: progressTokenOf(session, state),
  };
}
