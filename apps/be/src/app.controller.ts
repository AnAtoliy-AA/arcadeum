import { Controller, Get, Logger, Optional } from '@nestjs/common';
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

  @SkipThrottle()
  @Get('health')
  health() {
    return { ok: true };
  }

  @SkipThrottle()
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
