import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ReviewJobData } from '../queue/review-queue.service';
import { spawn } from 'child_process';

const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '3', 10);

@Processor('review')
export class ReviewProcessor {
  private readonly logger = new Logger(ReviewProcessor.name);

  private spawnAsync(
    cmd: string,
    args: string[],
    opts: { cwd: string; timeout?: number },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        cwd: opts.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: opts.timeout,
      });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (d: Buffer) => (stdout += d.toString()));
      child.stderr?.on('data', (d: Buffer) => (stderr += d.toString()));
      child.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr || `Exit code ${code}`));
      });
      child.on('error', reject);
    });
  }

  @Process({ concurrency })
  async handleReview(job: Job<ReviewJobData>): Promise<{
    success: boolean;
    message: string;
  }> {
    const { issueNum, engine, prUrl } = job.data;
    this.logger.log(
      `Processing review job ${job.id}: reviewing issue #${issueNum} PR ${prUrl}`,
    );

    await job.progress(10);

    try {
      const prNum = prUrl.match(/\/(\d+)$/)?.[1];
      if (!prNum) {
        return { success: false, message: `Invalid PR URL: ${prUrl}` };
      }

      const cwd = process.env.REPO_PATH ?? process.cwd();

      await job.progress(20);

      const prompt = [
        `Review GitHub PR #${prNum} for issue #${issueNum}.`,
        '',
        'Check for:',
        '- Code quality and best practices',
        '- Security vulnerabilities',
        '- Performance issues',
        '- Missing error handling',
        '- Type safety violations (no any types)',
        '- Missing i18n for user-facing strings',
        '',
        'Post your review as a GitHub PR review comment.',
        'Use: gh pr review <number> --body "<review>"',
        'Be constructive and specific.',
      ].join('\n');

      const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

      const cli = engine === 'mimo' ? 'mimo' : 'opencode';
      if (cli === 'mimo') {
        try {
          await this.spawnAsync('mimo', ['auth', 'login', '-p', 'mimo-free'], {
            cwd,
            timeout: 30_000,
          });
        } catch {
          // ignore — token may already be valid
        }
      }

      await job.progress(50);

      await this.spawnAsync(
        cli,
        ['run', escapedPrompt, '--dangerously-skip-permissions'],
        { cwd, timeout: 600_000 },
      );

      await job.progress(100);

      this.logger.log(`Review job ${job.id} completed for PR #${prNum}`);
      return { success: true, message: `Review posted on PR #${prNum}` };
    } catch (err) {
      this.logger.error(`Review job ${job.id} failed: ${(err as Error).message}`);
      return { success: false, message: `Review failed: ${(err as Error).message}` };
    }
  }

  @OnQueueActive()
  onActive(job: Job<ReviewJobData>) {
    this.logger.log(
      `Review job ${job.id} started: issue #${job.data.issueNum}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(
    job: Job<ReviewJobData>,
    result: { success: boolean; message: string },
  ) {
    this.logger.log(
      `Review job ${job.id} finished: ${result.success ? 'success' : 'failed'} - ${result.message}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job<ReviewJobData>, err: Error) {
    this.logger.error(
      `Review job ${job.id} failed: ${err.message}`,
      err.stack,
    );
  }
}
