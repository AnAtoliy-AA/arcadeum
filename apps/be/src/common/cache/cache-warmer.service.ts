import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { OCI_CONNECTION } from '../providers/mongo-connections.provider';

/**
 * Warms critical caches on application startup to prevent the "cold start"
 * thundering-herd problem after deploys. Runs once during onModuleInit.
 *
 * Currently performs lightweight ping queries to warm MongoDB connection
 * pool and logs readiness. Individual cache managers (Redis-backed) will
 * auto-warm on first access.
 */
@Injectable()
export class CacheWarmer implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmer.name);

  constructor(
    @InjectConnection(OCI_CONNECTION)
    private readonly ociConnection: Connection,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Warm the MongoDB connection pool by issuing a ping
      if (this.ociConnection.readyState === 1 && this.ociConnection.db) {
        await this.ociConnection.db.admin().command({ ping: 1 });
        this.logger.log('MongoDB connection pool warmed');
      }
    } catch (err) {
      this.logger.warn(`Cache warming skipped: ${err}`);
    }

    this.logger.log('Cache warming complete');
  }
}
