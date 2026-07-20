import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { GitHubService } from '../github/github.service';
import { ImplementJobData } from '../queue/implement-queue.service';
import { ReviewQueueService } from '../queue/review-queue.service';
import { NotificationService } from '../notification/notification.service';
import { CIFollService } from '../ci/ci-poll.service';

const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10);

@Processor('implementation')
export class ImplementProcessor {
  private readonly logger = new Logger(ImplementProcessor.name);
  private readonly activeTargets = new Set<string>();

  constructor(
    private readonly githubService: GitHubService,
    private readonly reviewQueue: ReviewQueueService,
    private readonly notificationService: NotificationService,
    private readonly ciPollService: CIFollService,
  ) {}

  @Process({ concurrency })
  async handleJob(job: Job<ImplementJobData>): Promise<{
    success: boolean;
    message: string;
    branchName?: string;
    worktreePath?: string;
  }> {
    const { issueNum, engine, type, existingWorktree } = job.data;
    const targetKey = `${type}:${issueNum}`;

    if (this.activeTargets.has(targetKey)) {
      this.logger.warn(`Skipping job ${job.id}: ${targetKey} already being processed`);
      return { success: false, message: `Skipped: ${targetKey} is already being processed by another job` };
    }

    this.activeTargets.add(targetKey);
    this.logger.log(
      `Processing job ${job.id}: ${type} on #${issueNum} with ${engine}`,
    );

    await job.progress(5);

    const jobId = String(job.id);
    let cwd: string | null = null;
    let createdWorktree = false;

    try {
      if (existingWorktree) {
        cwd = existingWorktree;
        this.logger.log(`Reusing worktree at ${cwd}`);
      } else {
        cwd = this.githubService.createWorktree(jobId);
        createdWorktree = true;
      }
      await job.progress(10);

      let result: { success: boolean; message: string; branchName?: string };

      switch (type) {
        case 'implement':
          result = await this.handleImplement(job, cwd);
          break;
        case 'fix':
          result = await this.handleFix(job, cwd);
          break;
        case 'ci-fix':
          result = await this.handleCIFix(job, cwd);
          break;
        default:
          result = { success: false, message: `Unknown job type: ${type}` };
      }

      await job.progress(80);

      if (result.branchName && result.success) {
        if (type === 'fix' || type === 'ci-fix') {
          const verification = this.githubService.verifyChanges(cwd);
          if (!verification.ok) {
            this.logger.error(`Verification failed: ${verification.errors.join('; ')}`);
            result = {
              success: false,
              message: `Verification failed:\n${verification.errors.join('\n')}`,
            };
          } else {
            await this.postProcess(job, result.branchName, cwd);
          }
        } else {
          await this.postProcess(job, result.branchName, cwd);
        }
      }

      await job.progress(100);

      this.logger.log(
        `Job ${job.id} completed: ${result.success ? 'success' : 'failed'} - ${result.message}`,
      );

      return { ...result, worktreePath: !result.success && cwd ? cwd : undefined };
    } catch (err) {
      this.logger.error(`Job ${job.id} failed: ${(err as Error).message}`);
      return { success: false, message: (err as Error).message, worktreePath: cwd ?? undefined };
    } finally {
      this.activeTargets.delete(targetKey);
      if (createdWorktree && cwd) {
        try {
          this.githubService.removeWorktree(jobId);
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  private async handleImplement(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { issueNum, engine, issueTitle, issueBody } = job.data;

    if (!issueTitle || !issueBody) {
      return { success: false, message: 'Missing issue data in job payload' };
    }

    return this.githubService.implementLocally(issueNum, engine, cwd, {
      title: issueTitle,
      body: issueBody,
    });
  }

  private async handleFix(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { prNumber, engine, prBranchName } = job.data;

    if (!prNumber || !prBranchName) {
      return { success: false, message: 'Missing PR data in job payload' };
    }

    const failedChecks = this.githubService.getPrChecks(prNumber).filter(
      (c) => c.state === 'FAILURE' || c.state === 'failure',
    );
    const reviews = this.githubService.getPrReviews(prNumber);
    const reviewComments = reviews
      .filter((r) => r.state === 'CHANGES_REQUESTED' || r.body?.includes('```suggestion'))
      .map((r) => r.body)
      .join('\n---\n');

    this.logger.log(`Fetched ${failedChecks.length} failed checks for PR #${prNumber}`);

    return this.githubService.fixPR(prNumber, engine, cwd, {
      branchName: prBranchName,
      failedChecks: failedChecks.length > 0 ? failedChecks : undefined,
      reviewComments: reviewComments || undefined,
    });
  }

  private async handleCIFix(
    job: Job<ImplementJobData>,
    cwd: string,
  ): Promise<{ success: boolean; message: string; branchName?: string }> {
    const { prNumber, engine, prBranchName, prFailedChecks } = job.data;

    if (!prNumber || !prBranchName || !prFailedChecks) {
      return { success: false, message: 'Missing CI fix data in job payload' };
    }

    return this.githubService.checkAndFixCI(prNumber, engine, cwd, {
      branchName: prBranchName,
      failedChecks: prFailedChecks,
    });
  }

  private async postProcess(
    job: Job<ImplementJobData>,
    branchName: string,
    cwd: string,
  ): Promise<void> {
    const { type, issueNum } = job.data;

    this.logger.log(`Resolving conflicts for ${branchName}`);
    const conflictResult = this.githubService.resolveConflicts(branchName, 'develop', cwd, job.data.engine as 'mimo' | 'opencode');
    if (!conflictResult.success) {
      this.logger.warn(`Conflict resolution: ${conflictResult.message}`);
    }

    this.logger.log(`Pushing branch ${branchName} from worktree`);
    const pushResult = this.githubService.pushBranch(branchName, cwd);
    if (!pushResult.success) {
      this.logger.error(`Push failed: ${pushResult.message}`);
      await this.notificationService.publish({
        jobId: String(job.id),
        issueNum,
        engine: job.data.engine,
        success: false,
        type: `${type}-failed` as 'implement-failed' | 'fix-failed',
        jobType: type,
        message: `Git push failed for ${type} on #${issueNum} (branch: ${branchName}): ${pushResult.message}`,
        timestamp: Date.now(),
      });
      return;
    }

    let prUrl = '';

    if (type === 'implement') {
      this.logger.log(`Creating PR for branch: ${branchName}`);
      try {
        const prResult = this.githubService.createPR(issueNum, branchName, cwd);
        if (prResult.success && prResult.prUrl) {
          prUrl = prResult.prUrl;
          this.logger.log(`PR created: ${prUrl}`);
        } else {
          this.logger.warn(`PR creation failed: ${prResult.message}`);
          await this.notificationService.publish({
            jobId: String(job.id),
            issueNum,
            engine: job.data.engine,
            success: false,
            type: 'implement-failed',
            jobType: 'implement',
            message: `PR creation failed for #${issueNum} (branch: ${branchName}): ${prResult.message}`,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        this.logger.error(`Failed to create PR: ${(err as Error).message}`);
        await this.notificationService.publish({
          jobId: String(job.id),
          issueNum,
          engine: job.data.engine,
          success: false,
          type: 'implement-failed',
          jobType: 'implement',
          message: `PR creation failed for #${issueNum} (branch: ${branchName}): ${(err as Error).message}`,
          timestamp: Date.now(),
        });
      }
    }

    await this.notificationService.publish({
      jobId: String(job.id),
      issueNum,
      engine: job.data.engine,
      success: true,
      message: prUrl ? `PR created: ${prUrl}` : `Branch pushed: ${branchName}`,
      timestamp: Date.now(),
      type: prUrl ? 'pr-opened' : 'task-completed',
      prUrl: prUrl || undefined,
    });

    if (prUrl) {
      this.logger.log(`Auto-queueing review for PR: ${prUrl}`);
      try {
        await this.reviewQueue.addJob(
          issueNum,
          job.data.engine,
          job.data.chatId,
          job.data.userId,
          prUrl,
        );
      } catch (err) {
        this.logger.error(`Failed to queue review: ${(err as Error).message}`);
      }

      const prNum = prUrl.match(/\/(\d+)$/)?.[1];
      if (prNum) {
        this.logger.log(`Starting CI poll for PR #${prNum}`);
        this.ciPollService.startPolling(prNum, issueNum, job.data.engine);
      }
    }

  }

  @OnQueueActive()
  onActive(job: Job<ImplementJobData>) {
    this.logger.log(
      `Job ${job.id} started: ${job.data.type} on #${job.data.issueNum} with ${job.data.engine}`,
    );
  }

  @OnQueueCompleted()
  async onCompleted(
    job: Job<ImplementJobData>,
    result: { success: boolean; message: string; worktreePath?: string },
  ) {
    this.logger.log(
      `Job ${job.id} finished: ${result.success ? 'success' : 'failed'} - ${result.message}`,
    );

    if (!result.success && !result.message.startsWith('Skipped:')) {
      const { type, issueNum, engine, prNumber } = job.data;
      const jobType = type === 'ci-fix' ? 'CI fix' : type;
      const target = type === 'fix' || type === 'ci-fix' ? `PR #${prNumber}` : `Issue #${issueNum}`;
      await this.notificationService.publish({
        jobId: String(job.id),
        issueNum,
        engine,
        success: false,
        type: `${type}-failed` as 'implement-failed' | 'fix-failed',
        jobType: type,
        message: `${jobType} failed for ${target}: ${result.message}`,
        timestamp: Date.now(),
        worktreePath: result.worktreePath,
      });
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job<ImplementJobData>, err: Error) {
    this.logger.error(
      `Job ${job.id} failed: ${err.message}`,
      err.stack,
    );

    const { type, issueNum, engine, prNumber } = job.data;
    const jobType = type === 'ci-fix' ? 'CI fix' : type;
    const target = type === 'fix' || type === 'ci-fix' ? `PR #${prNumber}` : `Issue #${issueNum}`;
    await this.notificationService.publish({
      jobId: String(job.id),
      issueNum,
      engine,
      success: false,
      type: `${type}-failed` as 'implement-failed' | 'fix-failed',
      jobType: type,
      message: `${jobType} crashed for ${target}: ${err.message}`,
      timestamp: Date.now(),
    });
  }
}
