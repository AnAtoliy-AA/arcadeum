const fs = require('fs');
const path = require('path');

const LHCI_DIR = path.resolve(process.cwd(), '.lighthouseci');
const COMMENT_MARKER = '<!-- lhci-audit-bot -->';

function readLighthouseScores(dirPath = LHCI_DIR) {
  if (!fs.existsSync(dirPath)) return [];

  const jsonFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const results = [];

  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(dirPath, file), 'utf-8'),
      );
      if (!data.categories || !data.finalUrl) continue;

      const url = new URL(data.finalUrl);
      const page = url.pathname + url.search;

      const audits = data.audits || {};
      const lcpAudit = audits['largest-contentful-paint'] || {};
      const clsAudit = audits['cumulative-layout-shift'] || {};
      const tbtAudit = audits['total-blocking-time'] || {};

      const issues = [];
      for (const [auditId, audit] of Object.entries(audits)) {
        if (
          audit &&
          typeof audit.score === 'number' &&
          audit.score < 0.9 &&
          audit.title &&
          !auditId.startsWith('screenshot')
        ) {
          issues.push(audit.title);
        }
      }

      results.push({
        page,
        performance: Math.round(data.categories.performance?.score * 100 ?? 0),
        accessibility: Math.round(
          data.categories.accessibility?.score * 100 ?? 0,
        ),
        seo: Math.round(data.categories.seo?.score * 100 ?? 0),
        bestPractices: Math.round(
          data.categories['best-practices']?.score * 100 ?? 0,
        ),
        lcpNumeric: lcpAudit.numericValue ?? 0,
        lcpDisplay: lcpAudit.displayValue ?? 'N/A',
        clsNumeric: clsAudit.numericValue ?? 0,
        clsDisplay: clsAudit.displayValue ?? 'N/A',
        tbtNumeric: tbtAudit.numericValue ?? 0,
        tbtDisplay: tbtAudit.displayValue ?? 'N/A',
        issues: issues.slice(0, 5),
      });
    } catch {}
  }

  return results.sort((a, b) => a.page.localeCompare(b.page));
}

function formatScore(score, min) {
  if (score >= min) return `${score}`;
  return `**${score}** ❌`;
}

function formatLcp(lcpMs, display) {
  if (lcpMs <= 2500) return display;
  return `**${display}** ❌`;
}

function formatCls(clsValue, display) {
  if (clsValue <= 0.1) return display;
  return `**${display}** ❌`;
}

function formatTbt(tbtMs, display) {
  if (tbtMs <= 200) return display;
  return `**${display}** ❌`;
}

function buildComment(results) {
  if (results.length === 0) {
    return `${COMMENT_MARKER}\n\n## Lighthouse & Core Web Vitals Audit\n\n⚠️ No Lighthouse results found.`;
  }

  const avgPerf =
    results.reduce((s, r) => s + r.performance, 0) / results.length;
  const avgA11y =
    results.reduce((s, r) => s + r.accessibility, 0) / results.length;
  const avgSeo = results.reduce((s, r) => s + r.seo, 0) / results.length;
  const avgBp =
    results.reduce((s, r) => s + r.bestPractices, 0) / results.length;

  const validLcp = results.filter((r) => r.lcpNumeric > 0);
  const avgLcpMs = validLcp.length
    ? validLcp.reduce((s, r) => s + r.lcpNumeric, 0) / validLcp.length
    : 0;
  const avgCls = results.reduce((s, r) => s + r.clsNumeric, 0) / results.length;
  const avgTbt = results.reduce((s, r) => s + r.tbtNumeric, 0) / results.length;

  const allPass = results.every(
    (r) =>
      r.performance >= 90 &&
      r.accessibility >= 100 &&
      r.seo >= 100 &&
      r.bestPractices >= 100 &&
      r.lcpNumeric <= 2500 &&
      r.clsNumeric <= 0.1,
  );

  const header = allPass
    ? '## ✅ Lighthouse & Core Web Vitals Audit — All Pages Passing'
    : '## ❌ Lighthouse & Core Web Vitals Audit — Issues Found';

  let table = `| Page | Perf | LCP | CLS | TBT | A11y | SEO | BP |\n|------|------|-----|-----|-----|------|-----|----|`;
  for (const r of results) {
    table += `\n| ${r.page} | ${formatScore(r.performance, 90)} | ${formatLcp(r.lcpNumeric, r.lcpDisplay)} | ${formatCls(r.clsNumeric, r.clsDisplay)} | ${formatTbt(r.tbtNumeric, r.tbtDisplay)} | ${formatScore(r.accessibility, 100)} | ${formatScore(r.seo, 100)} | ${formatScore(r.bestPractices, 100)} |`;
  }

  const summary = `\n\n**Average:** Perf ${Math.round(avgPerf)} | LCP ${(avgLcpMs / 1000).toFixed(2)}s | CLS ${avgCls.toFixed(2)} | TBT ${Math.round(avgTbt)}ms | A11y ${Math.round(avgA11y)} | SEO ${Math.round(avgSeo)} | BP ${Math.round(avgBp)}\n\n*Thresholds: Performance ≥ 90, LCP ≤ 2.5s, CLS ≤ 0.10, TBT ≤ 200ms, A11y/SEO/BP ≥ 100*`;

  let issuesSection = '';
  const pagesWithIssues = results.filter(
    (r) =>
      r.issues.length > 0 &&
      (r.performance < 90 ||
        r.seo < 95 ||
        r.lcpNumeric > 2500 ||
        r.clsNumeric > 0.1),
  );

  if (pagesWithIssues.length > 0) {
    issuesSection =
      '\n\n<details><summary><b>⚠️ Flagged Regressions & Audit Details</b></summary>\n\n';
    for (const p of pagesWithIssues) {
      issuesSection += `- **${p.page}**:\n`;
      for (const issue of p.issues) {
        issuesSection += `  - ${issue}\n`;
      }
    }
    issuesSection += '</details>';
  }

  return `${COMMENT_MARKER}\n\n${header}\n\n${table}${summary}${issuesSection}`;
}

async function postComment() {
  const token = process.env.GITHUB_TOKEN;
  const eventName = process.env.EVENT_NAME;
  const prNumber = process.env.PR_NUMBER;

  if (!token || eventName !== 'pull_request' || !prNumber) {
    console.log('Skipping PR comment (not a PR or missing token)');
    return;
  }

  const results = readLighthouseScores();
  const body = buildComment(results);

  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repo) {
    console.error('GITHUB_REPOSITORY not set');
    return;
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  let existingCommentId = null;
  try {
    const listRes = await fetch(`${apiUrl}?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const comments = await listRes.json();
    const existing = comments.find((c) => c.body?.includes(COMMENT_MARKER));
    if (existing) existingCommentId = existing.id;
  } catch (err) {
    console.error('Failed to list comments:', err.message);
  }

  if (existingCommentId) {
    try {
      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingCommentId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body }),
        },
      );
      console.log(`Updated existing PR comment #${existingCommentId}`);
    } catch (err) {
      console.error('Failed to update comment:', err.message);
    }
  } else {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });
      console.log('Posted new Lighthouse audit comment');
    } catch (err) {
      console.error('Failed to post comment:', err.message);
    }
  }
}

if (require.main === module) {
  postComment();
}

module.exports = {
  readLighthouseScores,
  formatScore,
  formatLcp,
  formatCls,
  formatTbt,
  buildComment,
  postComment,
};
