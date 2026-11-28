#!/usr/bin/env node
'use strict';

/**
 * node scripts/shorts-factory/analytics/report.js [--refresh] [--weekly] [--json]
 * --refresh runs a stats refresh first (needs POSTIZ_API_KEY).
 */

const { getConfig } = require('./config');
const { readHistory } = require('./store');
const { rankAll } = require('./score');
const { refreshStats } = require('./refresh');
const { weeklySummary } = require('./summary');
const { formatLengthSection, lengthStats } = require('./length');

function formatReport(records) {
  const analyzed = records.filter((r) => r.stats);
  const ranks = rankAll(analyzed);
  const lines = [`Posts: ${records.length} (analyzed: ${analyzed.length})`];
  for (const [dim, rows] of Object.entries(ranks)) {
    lines.push('', `== ${dim} ==`);
    if (!rows.length) lines.push('  not enough data');
    for (const r of rows) {
      const flag = r.flag ? `  <-- ${r.flag.toUpperCase()}` : '';
      lines.push(
        `  ${String(r.key).slice(0, 60).padEnd(60)} score ${r.avgScore}  views ${r.avgViews}  n=${r.samples}${flag}`,
      );
    }
  }
  lines.push(
    formatLengthSection(records, { minSamples: getConfig().minSamples }),
  );
  return lines.join('\n');
}

async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--refresh')) {
    const res = await refreshStats();
    console.log(
      `Refresh: ${res.refreshed} updated, ${res.errors.length} errors`,
    );
  }
  const records = readHistory(getConfig().historyPath);
  if (argv.includes('--json')) {
    const analyzed = records.filter((r) => r.stats);
    console.log(
      JSON.stringify(
        { ...rankAll(analyzed), byLengthClass: lengthStats(analyzed) },
        null,
        2,
      ),
    );
  } else if (argv.includes('--weekly')) {
    console.log(weeklySummary(records));
  } else {
    console.log(formatReport(records));
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { formatReport };
