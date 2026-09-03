import {
  Controller,
  Get,
  Logger,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { AppService } from './app.service';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from './common/providers/mongo-connections.provider';
import type { LiveStatus } from './app.service';

interface DbHealthResponse {
  ok: boolean;
  mongo: {
    oci: 'connected' | 'disconnected';
    atlas: 'connected' | 'disconnected' | 'not_configured';
  };
}

interface ReadinessResponse {
  ready: boolean;
  mongo: boolean;
  redis: boolean;
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    @InjectConnection(OCI_CONNECTION)
    private readonly ociConnection: Connection,
    @Optional()
    @InjectConnection(ATLAS_CONNECTION)
    private readonly atlasConnection?: Connection,
  ) {}

  @Get()
  getRootStatus(): LiveStatus {
    return this.appService.getLiveStatus();
  }

  @SkipThrottle({ default: true, auth: true, strict: true })
  @Get('health')
  health() {
    return { ok: true };
  }

  /**
   * Readiness probe — verifies MongoDB and Redis connectivity.
   * Returns 503 when not ready so Docker/K8s healthchecks fail and
   * remove the container from the load balancer pool.
   */
  @SkipThrottle({ default: true, auth: true, strict: true })
  @Get('ready')
  async readiness(): Promise<ReadinessResponse> {
    const mongoOk = await this.isMongoConnected(this.ociConnection);
    const redisOk = await this.isRedisConnected();
    const ready = mongoOk && redisOk;

    if (!ready) {
      throw new ServiceUnavailableException({
        ready: false,
        mongo: mongoOk,
        redis: redisOk,
      });
    }

    return { ready, mongo: mongoOk, redis: redisOk };
  }

  @SkipThrottle({ default: true, auth: true, strict: true })
  @Get('health/db')
  async checkDbHealth(): Promise<DbHealthResponse> {
    const oci = await this.pingConnection(this.ociConnection);
    const atlas = this.atlasConnection
      ? await this.pingConnection(this.atlasConnection)
      : ('not_configured' as const);

    return {
      ok: oci === 'connected',
      mongo: { oci, atlas },
    };
  }

  private async isMongoConnected(connection: Connection): Promise<boolean> {
    try {
      if (
        connection.readyState !== ConnectionStates.connected ||
        !connection.db
      ) {
        return false;
      }
      await connection.db.admin().command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  private async isRedisConnected(): Promise<boolean> {
    try {
      if (!process.env.REDIS_URL) return true;
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      const Redis: any = (await import('ioredis')).default;
      const client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
      });
      await client.connect();
      const pong: unknown = await client.ping();
      await client.quit();
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      return pong === 'PONG';
    } catch {
      // Redis may not be configured (local dev) — treat as healthy
      return !process.env.REDIS_URL;
    }
  }

  private async pingConnection(
    connection: Connection,
  ): Promise<'connected' | 'disconnected'> {
    try {
      if (
        connection.readyState !== ConnectionStates.connected ||
        !connection.db
      ) {
        return 'disconnected';
      }
      await connection.db.admin().command({ ping: 1 });
      return 'connected';
    } catch (err) {
      this.logger.warn(`Mongo ping failed: ${err}`);
      return 'disconnected';
    }
  }
}
