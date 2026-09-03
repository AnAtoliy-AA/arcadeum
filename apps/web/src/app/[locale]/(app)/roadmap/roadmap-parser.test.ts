import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseRoadmapMarkdown } from './roadmap-parser';

describe('roadmap-parser', () => {
  it('parses ticket statuses, tiers, features, and phases from markdown', () => {
    const sampleMarkdown = `
# Arcadeum Platform Expansion Plan

## ARC Ticket Reference

| Feature                | ARC     | Branch                       | Status          |
| ---------------------- | ------- | ---------------------------- | --------------- |
| 1A. Stat Tracking      | ARC-871 | \`ARC-871-stat-tracking\`      | **Implemented** |
| 1B. Emotes             | ARC-872 | \`ARC-872-emotes\`             | Not started     |

---

## Feature Roadmap

### TIER 1 — Low Effort, High Impact

#### 1A. Stat Tracking \`ARC-871\`

**Effort: Easy (1-2 days)**

Pure frontend feature. No backend changes needed.

- Create a Zustand store backed by \`localStorage\`

#### 1B. Emotes \`ARC-872\`

**Effort: Easy (1-2 days)**

- Add a set of predefined emotes

---

## Recommended Implementation & Status Order

| Phase / Focus                | Features & Ticket Scope                                                                                           | Est. Days | Status / Progress                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| **Phase 1: Core UX**         | Stats tracking + Emotes + House rules                                                                             | 10        | **100% Completed**                                               |
`;

    const data = parseRoadmapMarkdown(sampleMarkdown);

    expect(data.tiers).toHaveLength(1);
    expect(data.tiers[0].id).toBe('tier1');
    expect(data.tiers[0].features).toHaveLength(2);

    expect(data.tiers[0].features[0].title).toBe('Stat Tracking');
    expect(data.tiers[0].features[0].arc).toBe('ARC-871');
    expect(data.tiers[0].features[0].status).toBe('implemented');
    expect(data.tiers[0].features[0].effort).toBe('1-2 days');

    expect(data.tiers[0].features[1].title).toBe('Emotes');
    expect(data.tiers[0].features[1].arc).toBe('ARC-872');
    expect(data.tiers[0].features[1].status).toBe('not_started');

    expect(data.phases).toHaveLength(1);
    expect(data.phases[0].phase).toBe(1);
    expect(data.phases[0].title).toBe('Core UX');
    expect(data.phases[0].status).toBe('100% Completed');
    expect(data.phases[0].features).toContain('Stats tracking');

    expect(data.stats).toEqual([
      { label: 'Features', value: '2', icon: '📋' },
      { label: 'Implemented', value: '1', icon: '✅' },
      { label: 'In Progress', value: '0', icon: '⏳' },
      { label: 'Planned', value: '1', icon: '🗺️' },
    ]);
  });

  it('parses Tier 6 and Tier 7 with ## Tier X heading format', () => {
    const sampleMarkdown = `
# Arcadeum Platform Expansion Plan

## Feature Roadmap

### TIER 1 — Low Effort, High Impact

#### 1A. Stat Tracking \`ARC-871\`

**Effort: Easy (1-2 days)**

- Create a Zustand store

## Tier 6 — Growth, SEO, and Analytics (8-Week Action Plan)

### 6A. Viral & Invite Loop Optimization

**Effort: Medium (3-4 days)**

One-tap share sheet for instant invite copying.

### 6B. SEO & Crawler Optimizations

**Effort: Medium (5-7 days)**

Dedicated crawlable landing pages for each game.

## Tier 7 — Growth Acceleration (30-Day Execution Plan)

### 7A. Funnel Measurement

**Effort: Easy (2-3 days)**

UTM tracking, funnel events, campaign URLs.

### 7B. Simplified Homepage

**Effort: Medium (2-3 days)**

New user should arrive → play within 30 seconds.
`;

    const data = parseRoadmapMarkdown(sampleMarkdown);

    expect(data.tiers).toHaveLength(3);

    expect(data.tiers[0].id).toBe('tier1');
    expect(data.tiers[0].label).toBe('Quick Wins');
    expect(data.tiers[0].features).toHaveLength(1);

    expect(data.tiers[1].id).toBe('tier6');
    expect(data.tiers[1].label).toBe('Growth & SEO');
    expect(data.tiers[1].icon).toBe('📈');
    expect(data.tiers[1].features).toHaveLength(2);
    expect(data.tiers[1].features[0].title).toBe(
      'Viral & Invite Loop Optimization',
    );
    expect(data.tiers[1].features[0].status).toBe('not_started');
    expect(data.tiers[1].features[1].title).toBe('SEO & Crawler Optimizations');

    expect(data.tiers[2].id).toBe('tier7');
    expect(data.tiers[2].label).toBe('Growth Acceleration');
    expect(data.tiers[2].icon).toBe('🚀');
    expect(data.tiers[2].features).toHaveLength(2);
    expect(data.tiers[2].features[0].title).toBe('Funnel Measurement');
    expect(data.tiers[2].features[1].title).toBe('Simplified Homepage');
    expect(data.tiers[2].features[1].desc).toContain('30 seconds');
  });

  it('parses Tier 8 (Retention) and Tier 9 (Performance)', () => {
    const sampleMarkdown = `
# Arcadeum Platform Expansion Plan

## ARC Ticket Reference

| Feature                | ARC     | Branch                       | Status      |
| ---------------------- | ------- | ---------------------------- | ----------- |
| 8A. Daily Habit System  | ARC-930 | \`ARC-930-daily-habit\`        | In Progress |
| 9A. Web Worker AI       | ARC-935 | \`ARC-935-web-worker-ai\`      | In Progress |

---

## Feature Roadmap

### TIER 8 — Player Retention & Habit Loops

#### 8A. Daily Challenges & Streak System \`ARC-930\`

**Effort: Medium (3-5 days)**

Daily curated puzzle per game with streak counters.

### TIER 9 — High-Performance Engine & Latency Optimization

#### 9A. Web Worker AI Engine Offloading \`ARC-935\`

**Effort: Medium (3-4 days)**

Move heavy computational bots off the main thread.
`;

    const data = parseRoadmapMarkdown(sampleMarkdown);

    expect(data.tiers).toHaveLength(2);

    expect(data.tiers[0].id).toBe('tier8');
    expect(data.tiers[0].label).toBe('Retention & Habit Loops');
    expect(data.tiers[0].icon).toBe('🔁');
    expect(data.tiers[0].features).toHaveLength(1);
    expect(data.tiers[0].features[0].title).toBe(
      'Daily Challenges & Streak System',
    );
    expect(data.tiers[0].features[0].arc).toBe('ARC-930');
    expect(data.tiers[0].features[0].status).toBe('partial');

    expect(data.tiers[1].id).toBe('tier9');
    expect(data.tiers[1].label).toBe('Performance & Latency');
    expect(data.tiers[1].icon).toBe('⚡');
    expect(data.tiers[1].features).toHaveLength(1);
    expect(data.tiers[1].features[0].title).toBe(
      'Web Worker AI Engine Offloading',
    );
    expect(data.tiers[1].features[0].arc).toBe('ARC-935');
    expect(data.tiers[1].features[0].status).toBe('partial');
  });

  it('correctly parses the actual repository docs/ROADMAP.md file', () => {
    const roadmapPath = join(process.cwd(), '../../docs/ROADMAP.md');
    let content = '';
    try {
      content = readFileSync(roadmapPath, 'utf8');
    } catch {
      const fallbackPath = join(process.cwd(), 'docs/ROADMAP.md');
      content = readFileSync(fallbackPath, 'utf8');
    }

    const data = parseRoadmapMarkdown(content);
    expect(data.tiers.length).toBeGreaterThanOrEqual(9);
    expect(data.phases.length).toBeGreaterThanOrEqual(13);

    const tier8 = data.tiers.find((t) => t.id === 'tier8');
    expect(tier8).toBeDefined();
    expect(tier8?.features.length).toBeGreaterThanOrEqual(5);

    const tier9 = data.tiers.find((t) => t.id === 'tier9');
    expect(tier9).toBeDefined();
    expect(tier9?.features.length).toBeGreaterThanOrEqual(4);
  });
});
