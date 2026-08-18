import { describe, it, expect } from 'vitest';
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
});
