import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitHubService } from '../github/github.service';
import { NotificationService } from '../notification/notification.service';

interface CIFailurePayload {
  prNumber: string;
  branchName: string;
  failedChecks: string[];
  runUrl: string;
  secret?: string;
}

@Controller('ci')
export class CIController {
  private readonly logger = new Logger(CIController.name);

  constructor(
    private readonly githubService: GitHubService,
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
      issueNum: payload.prNumber,
      engine: 'mimo',
      success: false,
      message: `CI failed: ${payload.failedChecks.join(', ')}`,
      timestamp: Date.now(),
      type: 'ci-failed',
      failedChecks: payload.failedChecks,
    });

    try {
      const result = await this.githubService.checkAndFixCI(
        payload.prNumber,
        payload.branchName,
      );

      this.logger.log(`CI fix result: ${result.message}`);

      await this.notificationService.publish({
        jobId: `ci-fix-${payload.prNumber}`,
        issueNum: payload.prNumber,
        engine: 'mimo',
        success: result.success,
        message: result.message,
        timestamp: Date.now(),
        type: 'ci-fixed',
      });

      return { status: 'processed', ...result };
    } catch (err) {
      this.logger.error(`CI fix failed: ${(err as Error).message}`);

      await this.notificationService.publish({
        jobId: `ci-fix-${payload.prNumber}`,
        issueNum: payload.prNumber,
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
