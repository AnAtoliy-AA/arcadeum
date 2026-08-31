import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Session } from 'node:inspector';
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
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

interface ServerMetricsResponse {
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    perCore: number[];
  };
  ram: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    usagePercent: number;
  };
  process: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
  };
  system: {
    uptimeSeconds: number;
    loadAvg: [number, number, number];
    nodeVersion: string;
    platform: string;
  };
}

export class CpuProfileDto {
  @IsOptional()
  @IsInt()
  @Min(1_000)
  @Max(60_000)
  durationMs?: number;
}

interface CpuProfileResponse {
  file: string;
  durationMs: number;
  pid: number;
}

function sampleCpuPercent(): number[] {
  return os.cpus().map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return total === 0 ? 0 : +((1 - idle / total) * 100).toFixed(1);
  });
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

  @Get('server-metrics')
  async getServerMetrics(): Promise<ServerMetricsResponse> {
    const before = sampleCpuPercent();
    await new Promise((r) => setTimeout(r, 100));
    const after = sampleCpuPercent();

    const perCore = before.map((b, i) => {
      const delta = after[i] - b;
      return Math.max(0, Math.min(100, +delta.toFixed(1)));
    });
    const usagePercent =
      perCore.length > 0
        ? +(perCore.reduce((a, b) => a + b, 0) / perCore.length).toFixed(1)
        : 0;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const mem = process.memoryUsage();

    return {
      cpu: {
        model: os.cpus()[0]?.model ?? 'unknown',
        cores: os.cpus().length,
        usagePercent,
        perCore,
      },
      ram: {
        totalMB: +(totalMem / 1048576).toFixed(0) as unknown as number,
        usedMB: +(usedMem / 1048576).toFixed(0) as unknown as number,
        freeMB: +(freeMem / 1048576).toFixed(0) as unknown as number,
        usagePercent: +((usedMem / totalMem) * 100).toFixed(1),
      },
      process: {
        heapUsedMB: +(mem.heapUsed / 1048576).toFixed(1),
        heapTotalMB: +(mem.heapTotal / 1048576).toFixed(1),
        rssMB: +(mem.rss / 1048576).toFixed(1),
        externalMB: +(mem.external / 1048576).toFixed(1),
      },
      system: {
        uptimeSeconds: +os.uptime(),
        loadAvg: os.loadavg() as [number, number, number],
        nodeVersion: process.version,
        platform: os.platform(),
      },
    };
  }

  @Post('cpu-profile')
  async captureCpuProfile(
    @Body() dto: CpuProfileDto,
  ): Promise<CpuProfileResponse> {
    const durationMs = Math.min(Math.max(dto?.durationMs ?? 30_000, 1_000), 60_000);
    const profile = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const session = new Session();
        session.connect();
        session.post('Profiler.enable', () => {
          session.post(
            'Profiler.start',
            { samplingInterval: 1000 },
            () => {
              setTimeout(() => {
                session.post(
                  'Profiler.stop',
                  (
                    err: Error | null,
                    data: { profile: Record<string, unknown> },
                  ) => {
                    session.disconnect();
                    if (err) return reject(err);
                    resolve(data.profile);
                  },
                );
              }, durationMs);
            },
          );
        });
      },
    );

    const dir = path.join(process.cwd(), 'profiles');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `cpu-${Date.now()}-${process.pid}.cpuprofile`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(profile));

    return {
      file: filename,
      durationMs,
      pid: process.pid,
    };
  }
}
