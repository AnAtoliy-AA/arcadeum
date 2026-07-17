import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { ImplementQueueService } from '../queue/implement-queue.service';

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
  ) {}

  @Post('fix')
  @HttpCode(200)
  async handleCIFailure(@Body() payload: CIFailurePayload) {
    const secret = this.config.get<string>('CI_WEBHOOK_SECRET');
    if (secret && payload.secret !== secret) {
      this.logger.warn('Invalid CI webhook secret');
      return { status: 'rejected' };
    }

    this.logger.log(
      `CI failure received for PR #${payload.prNumber} (${payload.branchName}): ${payload.failedChecks.join(', ')}`,
    );

    await this.notificationService.publish({
      jobId: `ci-fail-${payload.prNumber}`,
      issueNum: payload.issueNum ?? payload.prNumber,
      engine: 'mimo',
      success: false,
      message: `CI failed: ${payload.failedChecks.join(', ')}`,
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

      this.logger.log(`CI fix queued: job ${jobId} for PR #${payload.prNumber}`);

      return { status: 'queued', jobId };
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
}
