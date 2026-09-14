import { describe, it, expect } from 'vitest';
import {
  formatScore,
  formatLcp,
  formatCls,
  formatTbt,
  buildComment,
} from '../../../../../../scripts/lhci-comment';

interface LighthouseResultItem {
  page: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
  lcpNumeric: number;
  lcpDisplay: string;
  clsNumeric: number;
  clsDisplay: string;
  tbtNumeric: number;
  tbtDisplay: string;
  issues: string[];
}

describe('Lighthouse & Core Web Vitals CI Auditor (Agent 7)', () => {
  it('formats metric values correctly for passing and failing thresholds', () => {
    expect(formatScore(95, 90)).toBe('95');
    expect(formatScore(85, 90)).toBe('**85** ❌');

    expect(formatLcp(2100, '2.1 s')).toBe('2.1 s');
    expect(formatLcp(3200, '3.2 s')).toBe('**3.2 s** ❌');

    expect(formatCls(0.04, '0.04')).toBe('0.04');
    expect(formatCls(0.18, '0.18')).toBe('**0.18** ❌');

    expect(formatTbt(80, '80 ms')).toBe('80 ms');
    expect(formatTbt(350, '350 ms')).toBe('**350 ms** ❌');
  });

  it('builds a passing comment when all pages meet Core Web Vitals and quality thresholds', () => {
    const mockResults: LighthouseResultItem[] = [
      {
        page: '/en/games/chess',
        performance: 96,
        accessibility: 100,
        seo: 100,
        bestPractices: 100,
        lcpNumeric: 1800,
        lcpDisplay: '1.8 s',
        clsNumeric: 0.01,
        clsDisplay: '0.01',
        tbtNumeric: 50,
        tbtDisplay: '50 ms',
        issues: [],
      },
      {
        page: '/en/games/sea-battle',
        performance: 92,
        accessibility: 100,
        seo: 100,
        bestPractices: 100,
        lcpNumeric: 2200,
        lcpDisplay: '2.2 s',
        clsNumeric: 0.03,
        clsDisplay: '0.03',
        tbtNumeric: 90,
        tbtDisplay: '90 ms',
        issues: [],
      },
    ];

    const comment = buildComment(mockResults);
    expect(comment).toContain(
      '## ✅ Lighthouse & Core Web Vitals Audit — All Pages Passing',
    );
    expect(comment).toContain('/en/games/chess');
    expect(comment).toContain('1.8 s');
    expect(comment).toContain('0.01');
    expect(comment).not.toContain('❌');
  });

  it('flags regressions and reports detailed issues when LCP or CLS exceed thresholds', () => {
    const mockResults: LighthouseResultItem[] = [
      {
        page: '/en/games/slow-game',
        performance: 82,
        accessibility: 100,
        seo: 92,
        bestPractices: 100,
        lcpNumeric: 3400,
        lcpDisplay: '3.4 s',
        clsNumeric: 0.15,
        clsDisplay: '0.15',
        tbtNumeric: 280,
        tbtDisplay: '280 ms',
        issues: [
          'Document does not have a meta description',
          'Reduce unused JavaScript',
        ],
      },
    ];

    const comment = buildComment(mockResults);
    expect(comment).toContain(
      '## ❌ Lighthouse & Core Web Vitals Audit — Issues Found',
    );
    expect(comment).toContain('**82** ❌');
    expect(comment).toContain('**3.4 s** ❌');
    expect(comment).toContain('**0.15** ❌');
    expect(comment).toContain('**280 ms** ❌');
    expect(comment).toContain('Document does not have a meta description');
  });

  it('handles empty results gracefully', () => {
    const comment = buildComment([]);
    expect(comment).toContain('⚠️ No Lighthouse results found.');
  });
});
