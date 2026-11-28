'use strict';

/** Minimal FEN + UCI helpers for DISPLAY only (no legality checking). */

const GLYPHS = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

function parseFen(fen) {
  const [placement, turn = 'w'] = String(fen).trim().split(/\s+/);
  const rows = placement.split('/');
  if (rows.length !== 8) throw new Error(`Bad FEN: ${fen}`);
  const board = rows.map((row) => {
    const out = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push(ch);
    }
    if (out.length !== 8) throw new Error(`Bad FEN row: ${row}`);
    return out;
  });
  return { board, turn };
}

function sq(name) {
  const file = name.charCodeAt(0) - 97;
  const rank = 8 - Number(name[1]);
  if (file < 0 || file > 7 || rank < 0 || rank > 7)
    throw new Error(`Bad square: ${name}`);
  return { r: rank, c: file };
}

/** Apply a UCI move (e2e4, e7e8q). Handles castling, en passant, promotion. */
function applyUci(board, uci) {
  const next = board.map((row) => row.slice());
  const from = sq(uci.slice(0, 2));
  const to = sq(uci.slice(2, 4));
  const piece = next[from.r][from.c];
  if (!piece) throw new Error(`No piece on ${uci.slice(0, 2)} for ${uci}`);
  const lower = piece.toLowerCase();
  if (lower === 'p' && from.c !== to.c && !next[to.r][to.c])
    next[from.r][to.c] = null; // en passant
  if (lower === 'k' && Math.abs(to.c - from.c) === 2) {
    const rookFrom = to.c > from.c ? 7 : 0;
    const rookTo = to.c > from.c ? 5 : 3;
    next[from.r][rookTo] = next[from.r][rookFrom];
    next[from.r][rookFrom] = null;
  }
  const promo = uci[4];
  next[to.r][to.c] = promo
    ? piece === piece.toUpperCase()
      ? promo.toUpperCase()
      : promo
    : piece;
  next[from.r][from.c] = null;
  return next;
}

module.exports = { GLYPHS, parseFen, applyUci, sq };
