import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface JobNotification {
  jobId: string;
  issueNum: string;
  engine: string;
  success: boolean;
  message: string;
  timestamp: number;
  type?: 'pr-opened' | 'ci-failed' | 'ci-fixed' | 'task-completed' | 'task-failed' | 'implement-failed' | 'fix-failed' | 'review-failed' | 'timeout-prompt';
  prUrl?: string;
  failedChecks?: string[];
  jobType?: 'implement' | 'fix' | 'ci-fix' | 'review';
  worktreePath?: string;
}

export interface TimeoutResponse {
  jobId: string;
  action: 'continue' | 'abort';
  timestamp: number;
}

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationService.name);
  private publisher!: Redis;
  private subscriber!: Redis;
  private responseSubscriber!: Redis;
  private readonly channel = 'task-bot:notifications';
  private readonly responseChannel = 'task-bot:timeout-responses';
  private handlers: ((notification: JobNotification) => void)[] = [];
  private responseHandlers = new Map<string, (response: TimeoutResponse) => void>();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST') ?? '127.0.0.1';
    const port = parseInt(this.config.get<string>('REDIS_PORT') ?? '6379', 10);
    const password = this.config.get<string>('REDIS_PASSWORD');

    this.publisher = new Redis({ host, port, password });
    this.subscriber = new Redis({ host, port, password });
    this.responseSubscriber = new Redis({ host, port, password });

    await this.subscriber.subscribe(this.channel);
    this.subscriber.on('message', (_channel, message) => {
      try {
        const notification = JSON.parse(message) as JobNotification;
        this.logger.log(`Received notification: ${notification.issueNum} - ${notification.success ? 'success' : 'failed'}`);
        this.handlers.forEach((handler) => handler(notification));
      } catch (err) {
        this.logger.error(`Failed to parse notification: ${err}`);
      }
    });

    await this.responseSubscriber.subscribe(this.responseChannel);
    this.responseSubscriber.on('message', (_channel, message) => {
      try {
        const response = JSON.parse(message) as TimeoutResponse;
        this.logger.log(`Received timeout response: ${response.jobId} - ${response.action}`);
        const handler = this.responseHandlers.get(response.jobId);
        if (handler) {
          handler(response);
          this.responseHandlers.delete(response.jobId);
        }
      } catch (err) {
        this.logger.error(`Failed to parse timeout response: ${err}`);
      }
    });

    this.logger.log('Notification service initialized');
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
    await this.responseSubscriber.quit();
  }

  async publish(notification: JobNotification): Promise<void> {
    notification.message = notification.message
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      .replace(/\[[\d;]*m/g, '')
      .replace(/`([^`]*?)`/g, '«$1»')
      .replace(/[*_~\[\]()]/g, '')
      .slice(0, 3000);
    await this.publisher.publish(this.channel, JSON.stringify(notification));
    this.logger.log(`Published notification: ${notification.issueNum}`);
  }

  async publishTimeoutResponse(response: TimeoutResponse): Promise<void> {
    await this.publisher.publish(this.responseChannel, JSON.stringify(response));
    this.logger.log(`Published timeout response: ${response.jobId} - ${response.action}`);
  }

  onNotification(handler: (notification: JobNotification) => void): void {
    this.handlers.push(handler);
  }

  waitForTimeoutResponse(jobId: string, timeoutMs: number): Promise<'continue' | 'abort'> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.responseHandlers.delete(jobId);
        resolve('continue');
      }, timeoutMs);

      this.responseHandlers.set(jobId, (response) => {
        clearTimeout(timer);
        resolve(response.action);
      });
    });
  }
}
