import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { ImplementQueueService } from '../queue/implement-queue.service';
import { CIFixTrackerService } from './ci-fix-tracker.service';

interface CIFailurePayload {
  prNumber: string;
  branchName: string;
  failedChecks: string[];
  issueNum?: string;
  runUrl: string;
  secret?: string;
}

@Controller('ci')
export class CIController {
  private readonly logger = new Logger(CIController.name);

  constructor(
    private readonly queueService: ImplementQueueService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
    private readonly ciFixTracker: CIFixTrackerService,
  ) {}

  @Post('fix')
  @HttpCode(200)
  async handleCIFailure(@Body() payload: CIFailurePayload) {
    const secret = this.config.get<string>('CI_WEBHOOK_SECRET');
    if (secret && payload.secret !== secret) {
      this.logger.warn('Invalid CI webhook secret');
      return { status: 'rejected' };
    }

    const maxAttempts = this.ciFixTracker.getMaxAttempts();
    const currentAttempts = await this.ciFixTracker.getAttempts(payload.prNumber);

    if (currentAttempts >= maxAttempts) {
      this.logger.warn(
        `CI fix max attempts (${maxAttempts}) reached for PR #${payload.prNumber}. Giving up.`,
      );

      await this.notificationService.publish({
        jobId: `ci-fix-max-${payload.prNumber}`,
        issueNum: payload.issueNum ?? payload.prNumber,
        engine: 'mimo',
        success: false,
        message: `CI fix failed after ${maxAttempts} attempts. Manual intervention needed.\nFailed checks: ${payload.failedChecks.join(', ')}`,
        timestamp: Date.now(),
        type: 'ci-fixed',
      });

      return { status: 'max_attempts_reached', attempts: currentAttempts };
    }

    this.logger.log(
      `CI failure received for PR #${payload.prNumber} (${payload.branchName}): ${payload.failedChecks.join(', ')} [attempt ${currentAttempts + 1}/${maxAttempts}]`,
    );

    await this.ciFixTracker.incrementAttempts(payload.prNumber);

    await this.notificationService.publish({
      jobId: `ci-fail-${payload.prNumber}`,
      issueNum: payload.issueNum ?? payload.prNumber,
      engine: 'mimo',
      success: false,
      message: `CI failed (attempt ${currentAttempts + 1}/${maxAttempts}): ${payload.failedChecks.join(', ')}`,
      timestamp: Date.now(),
      type: 'ci-failed',
      failedChecks: payload.failedChecks,
    });

    try {
      const jobId = await this.queueService.addCIFixJob(
        payload.prNumber,
        'mimo',
        0,
        0,
        {
          issueNum: payload.issueNum ?? payload.prNumber,
          prBranchName: payload.branchName,
          prFailedChecks: payload.failedChecks.map((name) => ({
            name,
            state: 'FAILURE',
            link: payload.runUrl,
          })),
        },
      );

      this.logger.log(`CI fix queued: job ${jobId} for PR #${payload.prNumber} (attempt ${currentAttempts + 1}/${maxAttempts})`);

      return { status: 'queued', jobId, attempt: currentAttempts + 1, maxAttempts };
    } catch (err) {
      this.logger.error(`Failed to queue CI fix: ${(err as Error).message}`);

      await this.notificationService.publish({
        jobId: `ci-fix-${payload.prNumber}`,
        issueNum: payload.issueNum ?? payload.prNumber,
        engine: 'mimo',
        success: false,
        message: (err as Error).message,
        timestamp: Date.now(),
        type: 'ci-fixed',
      });

      return { status: 'error', message: (err as Error).message };
    }
  }

  @Post('reset')
  @HttpCode(200)
  async resetAttempts(@Body() body: { prNumber: string; secret?: string }) {
    const secret = this.config.get<string>('CI_WEBHOOK_SECRET');
    if (secret && body.secret !== secret) {
      return { status: 'rejected' };
    }
    await this.ciFixTracker.resetAttempts(body.prNumber);
    return { status: 'reset' };
  }
}
