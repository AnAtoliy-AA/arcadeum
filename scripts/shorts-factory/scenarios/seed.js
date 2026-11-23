'use strict';

/** Deterministic helpers: same seed always gives the same sequence. */

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG returning floats in [0, 1). */
function createRng(seed) {
  let a = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

module.exports = { hashString, createRng, dateKey };
