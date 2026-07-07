import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);

  constructor(private readonly config: ConfigService) {}

  private getRepoPath(): string {
    return this.config.get<string>('REPO_PATH') ?? process.cwd();
  }

  getArcNumbersFromRoadmap(): Set<number> {
    const roadmapPath = join(this.getRepoPath(), 'docs', 'ROADMAP.md');
    const arcNumbers = new Set<number>();

    try {
      const content = readFileSync(roadmapPath, 'utf-8');
      const matches = content.matchAll(/ARC-(\d+)/gi);
      for (const match of matches) {
        arcNumbers.add(parseInt(match[1], 10));
      }
    } catch {
      this.logger.warn('Could not read ROADMAP.md');
    }

    return arcNumbers;
  }

  getArcNumbersFromIssues(): Set<number> {
    const arcNumbers = new Set<number>();

    try {
      const result = execSync(
        'gh issue list --label "task" --json body --limit 100',
        { encoding: 'utf-8', cwd: this.getRepoPath() },
      );
      const issues = JSON.parse(result) as Array<{ body: string }>;
      for (const issue of issues) {
        const matches = issue.body.matchAll(/ARC-(\d+)/gi);
        for (const match of matches) {
          arcNumbers.add(parseInt(match[1], 10));
        }
      }
    } catch {
      this.logger.warn('Could not fetch existing issues');
    }

    return arcNumbers;
  }

  getNextArcNumber(): string {
    const roadmapArcs = this.getArcNumbersFromRoadmap();
    const usedArcs = this.getArcNumbersFromIssues();
    const allUsed = new Set([...roadmapArcs, ...usedArcs]);

    let next = 871;
    while (allUsed.has(next)) {
      next++;
    }
    return `ARC-${next}`;
  }

  matchRoadmapItem(title: string): { arc: string; description: string } | null {
    const roadmapPath = join(this.getRepoPath(), 'docs', 'ROADMAP.md');

    try {
      const content = readFileSync(roadmapPath, 'utf-8');
      const lines = content.split('\n');
      const titleLower = title.toLowerCase();

      for (const line of lines) {
        const arcMatch = line.match(/ARC-(\d+)/i);
        if (!arcMatch) continue;

        const descMatch = line.match(/\d+[A-Z]?\.\s*(.+?)(?:\s*`?ARC-\d+`?)?$/i);
        if (!descMatch) continue;

        const desc = descMatch[1].trim().toLowerCase();
        const descWords = desc.split(/\s+/);
        const matchCount = descWords.filter((w) => titleLower.includes(w)).length;
        const matchRatio = matchCount / descWords.length;

        if (matchRatio >= 0.5) {
          return { arc: `ARC-${arcMatch[1]}`, description: descMatch[1].trim() };
        }
      }
    } catch {
      this.logger.warn('Could not read ROADMAP.md for matching');
    }

    return null;
  }
}
