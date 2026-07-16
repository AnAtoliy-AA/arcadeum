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
  type?: 'pr-opened' | 'ci-failed' | 'ci-fixed' | 'task-completed' | 'task-failed';
  prUrl?: string;
  failedChecks?: string[];
}

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationService.name);
  private publisher!: Redis;
  private subscriber!: Redis;
  private readonly channel = 'task-bot:notifications';
  private handlers: ((notification: JobNotification) => void)[] = [];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST') ?? '127.0.0.1';
    const port = parseInt(this.config.get<string>('REDIS_PORT') ?? '6379', 10);
    const password = this.config.get<string>('REDIS_PASSWORD');

    this.publisher = new Redis({ host, port, password });
    this.subscriber = new Redis({ host, port, password });

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

    this.logger.log('Notification service initialized');
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  async publish(notification: JobNotification): Promise<void> {
    await this.publisher.publish(this.channel, JSON.stringify(notification));
    this.logger.log(`Published notification: ${notification.issueNum}`);
  }

  onNotification(handler: (notification: JobNotification) => void): void {
    this.handlers.push(handler);
  }
}
