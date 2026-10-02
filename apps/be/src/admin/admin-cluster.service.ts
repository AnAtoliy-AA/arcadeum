import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ClusterWorkerInfo {
  pmId: number;
  name: string;
  pid: number;
  status: string;
  cpu: number;
  memoryMB: number;
  uptimeSeconds: number;
  restarts: number;
}

export interface ClusterStatusResponse {
  isPm2: boolean;
  targetApp: string;
  instances: ClusterWorkerInfo[];
  timestamp: number;
}

export interface ClusterReloadResponse {
  ok: boolean;
  message: string;
  timestamp: number;
}

interface Pm2ProcessJson {
  pid?: number;
  name?: string;
  pm_id?: number;
  pm2_env?: {
    status?: string;
    pm_uptime?: number;
    restart_time?: number;
  };
  monit?: {
    memory?: number;
    cpu?: number;
  };
}

@Injectable()
export class AdminClusterService {
  private readonly logger = new Logger(AdminClusterService.name);
  private readonly appName = 'arcadeum-be';

  async getClusterStatus(): Promise<ClusterStatusResponse> {
    try {
      const { stdout } = await execFileAsync('pm2', ['jlist'], {
        timeout: 5000,
      });
      const list = JSON.parse(stdout) as Pm2ProcessJson[];
      const instances: ClusterWorkerInfo[] = list
        .filter((p) => p.name === this.appName)
        .map((p) => {
          const uptime = p.pm2_env?.pm_uptime
            ? Math.max(0, Math.round((Date.now() - p.pm2_env.pm_uptime) / 1000))
            : 0;
          return {
            pmId: p.pm_id ?? -1,
            name: p.name ?? this.appName,
            pid: p.pid ?? 0,
            status: p.pm2_env?.status ?? 'unknown',
            cpu: p.monit?.cpu ?? 0,
            memoryMB: Math.round((p.monit?.memory ?? 0) / 1048576),
            uptimeSeconds: uptime,
            restarts: p.pm2_env?.restart_time ?? 0,
          };
        });

      return {
        isPm2: instances.length > 0,
        targetApp: this.appName,
        instances,
        timestamp: Date.now(),
      };
    } catch {
      return {
        isPm2: false,
        targetApp: this.appName,
        instances: [
          {
            pmId: 0,
            name: process.title || 'node',
            pid: process.pid,
            status: 'online',
            cpu: 0,
            memoryMB: Math.round(process.memoryUsage().rss / 1048576),
            uptimeSeconds: Math.round(process.uptime()),
            restarts: 0,
          },
        ],
        timestamp: Date.now(),
      };
    }
  }

  async reloadCluster(): Promise<ClusterReloadResponse> {
    try {
      this.logger.warn(
        `Admin requested graceful cluster reload for ${this.appName}`,
      );
      await execFileAsync('pm2', ['reload', this.appName], {
        timeout: 15000,
      });
      return {
        ok: true,
        message: `Successfully reloaded cluster ${this.appName}`,
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to reload cluster via PM2: ${msg}`);
      return {
        ok: false,
        message: `Failed to reload cluster: ${msg}`,
        timestamp: Date.now(),
      };
    }
  }
}
