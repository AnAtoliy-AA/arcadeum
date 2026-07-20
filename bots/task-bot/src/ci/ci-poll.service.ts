import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { execFileSync } from 'child_process';
import { ConfigService } from '@nestjs/config';

interface PollEntry {
  timer: NodeJS.Timeout;
  prNumber: string;
  issueNum: string;
  engine: string;
  startTime: number;
}

@Injectable()
export class CIFollService implements OnModuleDestroy {
  private readonly logger = new Logger(CIFollService.name);
  private readonly activePolls = new Map<string, PollEntry>();
  private readonly pollIntervalMs = 30_000;
  private readonly maxPollTimeMs = 15 * 60 * 1000;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {}

  onModuleDestroy() {
    for (const [key, entry] of this.activePolls) {
      clearTimeout(entry.timer);
      this.activePolls.delete(key);
    }
  }

  startPolling(
    prNumber: string,
    issueNum: string,
    engine: string,
  ): void {
    if (this.activePolls.has(prNumber)) {
      this.logger.log(`Already polling PR #${prNumber}`);
      return;
    }

    this.logger.log(`Starting CI poll for PR #${prNumber}`);
    this.scheduleNext(prNumber, issueNum, engine, Date.now());
  }

  stopPolling(prNumber: string): void {
    const entry = this.activePolls.get(prNumber);
    if (entry) {
      clearTimeout(entry.timer);
      this.activePolls.delete(prNumber);
      this.logger.log(`Stopped CI poll for PR #${prNumber}`);
    }
  }

  private scheduleNext(
    prNumber: string,
    issueNum: string,
    engine: string,
    startTime: number,
  ): void {
    const timer = setTimeout(() => {
      this.activePolls.delete(prNumber);
      this.checkCIStatus(prNumber, issueNum, engine, startTime);
    }, this.pollIntervalMs);

    this.activePolls.set(prNumber, { timer, prNumber, issueNum, engine, startTime });
  }

  private checkCIStatus(
    prNumber: string,
    issueNum: string,
    engine: string,
    startTime: number,
  ): void {
    const elapsed = Date.now() - startTime;
    if (elapsed > this.maxPollTimeMs) {
      this.logger.log(`CI poll timeout for PR #${prNumber} after ${Math.round(elapsed / 1000)}s`);
      return;
    }

    try {
      const repoPath = this.config.get<string>('REPO_PATH') ?? process.cwd();
      const result = execFileSync(
        'gh',
        ['pr', 'checks', prNumber, '--json', 'name,state,conclusion'],
        { encoding: 'utf-8', cwd: repoPath, timeout: 15_000 },
      );

      const checks = JSON.parse(result) as Array<{
        name: string;
        state: string;
        conclusion: string | null;
      }>;

      if (checks.length === 0) {
        this.logger.log(`No checks found for PR #${prNumber} yet, retrying...`);
        this.scheduleNext(prNumber, issueNum, engine, startTime);
        return;
      }

      const pending = checks.filter(
        (c) => c.state === 'pending' || c.conclusion === null,
      );
      const failed = checks.filter(
        (c) => c.conclusion === 'failure' || c.conclusion === 'action_required',
      );
      const passed = checks.filter(
        (c) => c.conclusion === 'success',
      );

      this.logger.log(
        `PR #${prNumber} CI: ${passed.length} passed, ${failed.length} failed, ${pending.length} pending`,
      );

      if (failed.length > 0) {
        this.logger.log(`CI has failures on PR #${prNumber}, webhook will handle auto-fix`);
        return;
      }

      if (pending.length > 0) {
        this.scheduleNext(prNumber, issueNum, engine, startTime);
        return;
      }

      if (passed.length > 0 && pending.length === 0 && failed.length === 0) {
        this.logger.log(`CI all green for PR #${prNumber}!`);
        this.notificationService.publish({
          jobId: `ci-green-${prNumber}`,
          issueNum,
          engine,
          success: true,
          message: `All ${passed.length} CI checks passed for PR #${prNumber}`,
          timestamp: Date.now(),
          type: 'ci-fixed',
        });
        return;
      }
    } catch (err) {
      this.logger.warn(`CI poll error for PR #${prNumber}: ${(err as Error).message}`);
      this.scheduleNext(prNumber, issueNum, engine, startTime);
    }
  }
}
