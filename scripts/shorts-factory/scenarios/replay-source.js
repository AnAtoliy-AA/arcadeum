'use strict';

// axios is loaded lazily so the pure logic (and its tests) need no dependencies.
const getHttp = () => require('axios');

/**
 * Pull real finished games from the backend replay API and pick the most
 * dramatic moment. Replay actions only carry log text (message, kind,
 * timestamp, userId), so detection is keyword/score based, not board based.
 */

const CAPTURE_RE =
  /(captur|took|taken|sunk|sink|hit|jump|eliminat|knock|steal|stole)/i;
const COMBO_RE = /(combo|chain|cascade|x\d|streak|double|triple|multi)/i;
const FINISH_RE = /(checkmate|wins|won|victory|game over|shoot the moon)/i;

function messageOf(action) {
  const p = action && action.payload;
  return String(
    (p && typeof p === 'object' && p.message) || action.action || '',
  );
}

function isPositive(action) {
  const m = messageOf(action);
  return CAPTURE_RE.test(m) || COMBO_RE.test(m) || FINISH_RE.test(m);
}

/** Returns the share of "good" events per player split into early/late halves. */
function momentum(replay) {
  const actions = replay.actions || [];
  const cut = Math.floor(actions.length * 0.6);
  const tally = (slice) => {
    const t = {};
    for (const a of slice)
      if (isPositive(a)) t[a.userId] = (t[a.userId] || 0) + 1;
    return t;
  };
  // The final action is excluded from `late` so a last move win is not mistaken for a long comeback.
  return {
    early: tally(actions.slice(0, cut)),
    late: tally(actions.slice(cut, -1)),
  };
}

function share(t, id) {
  const total = Object.values(t).reduce((a, b) => a + b, 0);
  return total === 0 ? 0.5 : (t[id] || 0) / total;
}

/**
 * Classify a replay and find the dramatic step.
 * Returns { kind, step, score, label } or null when nothing stands out.
 * kind: 'comeback' | 'last_second_win' | 'replay_highlight'
 */
function detectDramaticMoment(replay) {
  const actions = replay && replay.actions;
  if (!Array.isArray(actions) || actions.length < 6) return null;
  const result = replay.result;
  const winnerId =
    result && !result.isDraw && result.winnerIds && result.winnerIds[0];

  let bestStep = -1;
  let bestScore = 0;
  actions.forEach((a, i) => {
    let score = 0;
    const m = messageOf(a);
    if (CAPTURE_RE.test(m)) score += 2;
    if (COMBO_RE.test(m)) score += 3;
    if (FINISH_RE.test(m)) score += 4;
    if (winnerId && a.userId === winnerId) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestStep = i;
    }
  });
  if (bestStep < 0) return null;

  if (winnerId) {
    const { early, late } = momentum(replay);
    const earlyShare = share(early, winnerId);
    const lateShare = share(late, winnerId);
    const last = actions[actions.length - 1];
    if (earlyShare <= 0.4 && lateShare >= 0.6) {
      return {
        kind: 'comeback',
        step: bestStep,
        score: bestScore + 3,
        label: 'comeback',
      };
    }
    if (last.userId === winnerId && earlyShare < 0.5 && isPositive(last)) {
      return {
        kind: 'last_second_win',
        step: actions.length - 1,
        score: bestScore + 2,
        label: 'last move win',
      };
    }
  }
  return {
    kind: 'replay_highlight',
    step: bestStep,
    score: bestScore,
    label: 'big moment',
  };
}

async function fetchReplays({
  baseApiUrl,
  gameId,
  limit = 20,
  http,
  timeoutMs = 8000,
} = {}) {
  if (!baseApiUrl) return [];
  try {
    http = http || getHttp();
    const base = baseApiUrl.replace(/\/$/, '');
    const { data } = await http.get(`${base}/games/replays`, {
      params: { gameId, limit },
      timeout: timeoutMs,
    });
    const entries = (data && data.entries) || [];
    const detailed = [];
    for (const e of entries.slice(0, 8)) {
      if (!e.result || e.totalMoves < 6) continue;
      const { data: d } = await http.get(
        `${base}/games/replays/${encodeURIComponent(e.replayId)}`,
        { timeout: timeoutMs },
      );
      if (d && d.replay) detailed.push(d.replay);
    }
    return detailed;
  } catch {
    return [];
  }
}

/** Best replay for a wanted format, or null. */
async function findReplayFor({ format, gameId, baseApiUrl, http }) {
  const replays = await fetchReplays({ baseApiUrl, gameId, http });
  let best = null;
  for (const replay of replays) {
    const moment = detectDramaticMoment(replay);
    if (!moment) continue;
    if (format !== 'replay_highlight' && moment.kind !== format) continue;
    if (!best || moment.score > best.moment.score) best = { replay, moment };
  }
  return best;
}

/** Quick availability probe used by the picker (any replay at all?). */
async function replaysAvailable({ baseApiUrl, http }) {
  const replays = await fetchReplays({ baseApiUrl, limit: 5, http });
  return replays.some((r) => detectDramaticMoment(r));
}

module.exports = {
  detectDramaticMoment,
  fetchReplays,
  findReplayFor,
  replaysAvailable,
  messageOf,
};
