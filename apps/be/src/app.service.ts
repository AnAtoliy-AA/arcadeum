import { Injectable } from '@nestjs/common';
import * as packageJson from '../package.json';

export interface LiveStatus {
  status: 'ok';
  version: string;
  timestamp: string;
  uptimeSeconds: number;
}

@Injectable()
export class AppService {
  getLiveStatus(): LiveStatus {
    return {
      status: 'ok',
      version: packageJson.version,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
