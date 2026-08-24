import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import {
  AdminStatisticsService,
  type AdminStatisticsResponse,
} from './admin-statistics.service';

interface DbStats {
  db: string;
  objects: number;
  dataSize: number;
  storageSize: number;
  indexSize: number;
}

interface CollStats {
  count: number;
  size: number;
  avgObjSize: number;
  nindexes: number;
}

interface CollDetail {
  count: number;
  sizeMB: number;
  avgObjBytes: number;
  indexes: number;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly statisticsService: AdminStatisticsService,
  ) {}

  @Get('ping')
  ping(): { ok: true } {
    return { ok: true };
  }

  @Get('statistics')
  async getStatistics(): Promise<AdminStatisticsResponse> {
    return this.statisticsService.getStatistics();
  }

  @Get('db-health')
  async dbHealth() {
    const db = this.connection.db;
    if (!db) return { error: 'No DB connection' };

    const stats = (await db.stats()) as unknown as DbStats;
    const collections = await db.listCollections().toArray();

    const details: Record<string, CollDetail> = {};
    for (const col of collections) {
      const s = (await db.command({
        collStats: col.name,
        scale: 1048576,
      })) as unknown as CollStats;
      if (s.count > 0) {
        details[col.name] = {
          count: s.count,
          sizeMB: +(s.size / 1048576).toFixed(2),
          avgObjBytes: s.avgObjSize || 0,
          indexes: s.nindexes || 0,
        };
      }
    }

    return {
      database: stats.db,
      totalDocs: stats.objects,
      dataSizeMB: +(stats.dataSize / 1048576).toFixed(2),
      storageSizeMB: +(stats.storageSize / 1048576).toFixed(2),
      indexSizeMB: +(stats.indexSize / 1048576).toFixed(2),
      collections: Object.keys(details).length,
      details,
    };
  }
}
