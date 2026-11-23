'use strict';

const { rankAll, scoreRecord, sumStats } = require('./score');

function line(label, rows) {
  if (!rows.length) return `${label}: not enough data`;
  const best = rows[0];
  const worst = rows.length > 1 ? rows[rows.length - 1] : null;
  return `${label}: best ${best.key} (${best.avgScore}, n=${best.samples})${
    worst ? `, worst ${worst.key} (${worst.avgScore}, n=${worst.samples})` : ''
  }`;
}

/** Plain-text weekly summary. Only generates text; sending is the caller's job. */
function weeklySummary(records, { now = Date.now(), days = 7 } = {}) {
  const since = now - days * 24 * 3600 * 1000;
  const recent = records.filter(
    (r) => new Date(r.date).getTime() >= since && r.stats,
  );
  if (!recent.length)
    return `Shorts weekly: no analyzed posts in the last ${days} days.`;
  const totals = recent.reduce(
    (a, r) => {
      const s = sumStats(r);
      a.views += s.views;
      a.likes += s.likes;
      a.clicks += s.linkClicks;
      return a;
    },
    { views: 0, likes: 0, clicks: 0 },
  );
  const top = [...recent].sort((a, b) => scoreRecord(b) - scoreRecord(a))[0];
  const ranks = rankAll(recent);
  return [
    `Shorts weekly (${recent.length} posts, last ${days}d)`,
    `Views ${totals.views}, likes ${totals.likes}, link clicks ${totals.clicks}`,
    `Top post: ${top.game} / ${top.format} (${top.date.slice(0, 10)})`,
    line('Formats', ranks.format),
    line('Games', ranks.game),
    line('Hooks', ranks.hook),
    line('Voices', ranks.voice),
    line('CTAs', ranks.cta),
  ].join('\n');
}

module.exports = { weeklySummary };
